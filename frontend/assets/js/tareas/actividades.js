(() => {
  'use strict';

  // ====== reglas de materias (materia_id) ======
  const PrimeroATercero = [1, 2, 3, 4, 5];
  const CuartoASexto = [1, 2, 6, 7, 5, 4, 8];
  const Fisica = [9];
  const Computacion = [10];

  // ====== DOM ======
  const selGrado = document.getElementById('combo_grado_direc');
  const selSeccion = document.getElementById('combo_seccion_direc');
  const selCiclo = document.getElementById('combo_ciclo_direc');
  const selMateria = document.getElementById('combo_materia');
  const btnVer = document.getElementById('VisualizarInfo');
  const wrap = document.querySelector('.actividades-wrap');

  if (!wrap) return;

  // ====== userData (sessionStorage) ======
  let userData = null;
  try {
    const raw = sessionStorage.getItem('userData');
    userData = raw ? JSON.parse(raw) : null;
  } catch {
    userData = null;
  }
  const ROL = (userData?.rol_id || '').trim().toUpperCase();
  const ANIO = new Date().getFullYear();

  // ====== defaults requeridos ======
  const CICLO_DEFAULT = 1;
  const MATERIA_DEFAULT_ID = 1; // matematicas
  const MATERIA_PLACEHOLDER_VALUE = ''; // en tu HTML placeholder es value=""

  // ====== helpers ======
  function toInt(x, def = 0) {
    const n = parseInt(x, 10);
    return Number.isFinite(n) ? n : def;
  }
  function safeText(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function getMateriasPermitidas(gradoId, rol) {
    const r = (rol || '').trim().toUpperCase();
    if (r === 'F') return new Set(Fisica);
    if (r === 'C') return new Set(Computacion);
    if (gradoId >= 1 && gradoId <= 3) return new Set(PrimeroATercero);
    if (gradoId >= 4 && gradoId <= 6) return new Set(CuartoASexto);
    return new Set();
  }

  function getIdsSeleccion() {
    const grado_id = toInt(selGrado?.value, 0);
    const seccion_id = toInt(selSeccion?.value, 0);
    const ciclo_id = Math.max(1, toInt(selCiclo?.value, CICLO_DEFAULT));
    return { grado_id, seccion_id, ciclo_id, anio: ANIO };
  }

  async function actualizarActividad(payload) {
    const r = await fetch('http://localhost:8001/actividad/ActualizarActividad', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    if (!r.ok) throw new Error('ActualizarActividad HTTP ' + r.status);

    return r.json();
  }

  async function fetchCiclos() {
    const r = await fetch('http://localhost:8001/ciclo', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    if (!r.ok) throw new Error('ciclo HTTP ' + r.status);

    const json = await r.json();
    return Array.isArray(json.data) ? json.data : [];
  }

  async function fetchEstadosActividad() {
    const r = await fetch('http://localhost:8001/EstadoActividad', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    if (!r.ok) throw new Error('EstadoActividad HTTP ' + r.status);

    const json = await r.json();
    return Array.isArray(json.data) ? json.data : [];
  }

  async function fetchTiposActividad() {
    const r = await fetch('http://localhost:8001/tipoActividad', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    if (!r.ok) throw new Error('tipoActividad HTTP ' + r.status);

    const json = await r.json();
    return Array.isArray(json.data) ? json.data : [];
  }

  function buildOptions(items, {
    valueField,
    textField,
    selectedValue,
    placeholder = '-- Seleccione --'
  }) {
    let html = `<option value="">${placeholder}</option>`;

    html += items.map(item => {
      const value = item?.[valueField];
      const text = item?.[textField];
      const selected = Number(value) === Number(selectedValue) ? 'selected' : '';

      return `<option value="${safeText(value)}" ${selected}>${safeText(text)}</option>`;
    }).join('');

    return html;
  }

  async function fetchActividadesPorTipo(payload) {
    const r = await fetch('http://localhost:8001/actividad/ActividadesPorTipo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    if (!r.ok) throw new Error('ActividadesPorTipo HTTP ' + r.status);
    const json = await r.json();
    return Array.isArray(json.data) ? json.data : [];
  }

  async function fetchActividadDetalle(actividad_id) {
    const r = await fetch('http://localhost:8001/actividad/ActividadDetalle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ actividad_id: Number(actividad_id) })
    });

    if (!r.ok) throw new Error('ActividadDetalle HTTP ' + r.status);

    const json = await r.json();
    return Array.isArray(json.data) && json.data.length ? json.data[0] : null;
  }

  // =========================================================
  // Render UI (h3 + contador) + cards por tipo
  // =========================================================
  const SECCIONES = [
    { key: 'tarea', title: 'Trabajo, proyecto o ejercicio', match: /tarea/i },
    { key: 'evaluacion', title: 'Evaluación', match: /examen|evalu/i }
  ];

  function cardTemplate(a) {
    const titulo = safeText(a?.nombre_actividad || 'Actividad');
    const desc = safeText(a?.descripcion || '—');
    const pts = safeText(a?.puntaje_maximo ?? '0');
    const actividadId = Number(a?.actividad_id || 0);

    return `
    <div class="card actividad-card shadow-sm mb-3">
      <div class="card-body py-3">
        <div class="row g-3 align-items-center">
          <div class="col-12 col-md-1 d-flex">
            <div class="icon-badge mx-auto mx-md-0">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5985E1">
                <path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
              </svg>
            </div>
          </div>

          <div class="col-12 col-md-8">
            <h2
              class="actividad-title mb-1 text-primary actividad-click"
              style="cursor:pointer"
              data-actividad-id="${actividadId}">
              ${titulo}
            </h2>

            <p class="actividad-desc mb-0">${desc}</p>
          </div>

          <div class="col-12 col-md-3 d-flex justify-content-md-end">
            <span class="activity-points">${pts} pts</span>
          </div>
        </div>
      </div>
    </div>
  `;
  }

  function headingTemplate(title, count, key) {
    return `
    <div class="d-flex align-items-center justify-content-between mb-2 section-header"
         data-section="${key}"
         style="cursor:pointer;">
      <div class="d-flex align-items-center gap-2">
        <span class="toggle-icon" data-icon="${key}">▼</span>
        <h3 class="mb-0">${safeText(title)}</h3>
      </div>
      <span class="badge bg-primary">${count}</span>
    </div>
  `;
  }


  function renderNoDisponible() {
    wrap.innerHTML = `
      ${headingTemplate('Trabajo, proyecto o ejercicio', 0)}
      <p class="text-muted">Datos no disponibles</p>

      ${headingTemplate('Evaluación', 0)}
      <p class="text-muted">Datos no disponibles</p>
    `;
  }

  function obtenerActividadIdDesdeSession() {
    return toInt(sessionStorage.getItem('actividadIdRedireccion'), 0);
  }

  function agruparPorSeccion(dataMaterias) {
    const bucket = { tarea: [], evaluacion: [] };

    for (const mat of dataMaterias) {
      const tipos = Array.isArray(mat?.tipos_actividad) ? mat.tipos_actividad : [];

      for (const t of tipos) {
        const nombreTipo = String(t?.tipo_actividad || '');
        const acts = Array.isArray(t?.actividades) ? t.actividades : [];

        const sec = SECCIONES.find(s => s.match.test(nombreTipo));
        if (!sec) continue;

        bucket[sec.key].push(...acts);
      }
    }

    return bucket;
  }

  function renderSecciones(bucket) {
    const htmlParts = SECCIONES.map(sec => {
      const lista = bucket[sec.key] || [];
      const count = lista.length;

      const cards = count
        ? lista.map(cardTemplate).join('')
        : `<p class="text-muted">Datos no disponibles</p>`;

      return `
      ${headingTemplate(sec.title, count, sec.key)}
      <div class="section-content mb-4" data-content="${sec.key}">
        ${cards}
      </div>
    `;
    });

    wrap.innerHTML = htmlParts.join('\n');

    activarCollapseSecciones();
    activarEventosModal();
  }

  function activarCollapseSecciones() {
    document.querySelectorAll('.section-header').forEach(header => {
      header.addEventListener('click', () => {
        const key = header.dataset.section;
        const content = document.querySelector(`[data-content="${key}"]`);
        const icon = document.querySelector(`[data-icon="${key}"]`);

        if (!content) return;

        const isHidden = content.style.display === 'none';

        content.style.display = isHidden ? 'block' : 'none';
        icon.textContent = isHidden ? '▼' : '▶';
      });
    });
  }

  function activarEventosModal() {
    document.querySelectorAll('.actividad-click').forEach(el => {
      el.addEventListener('click', async () => {
        const actividadIdRaw = el.getAttribute('data-actividad-id');
        const actividadId = toInt(actividadIdRaw, 0);

        if (!actividadId) {
          alert('No se encontró el identificador de la actividad.');
          return;
        }

        try {
          const detalle = await fetchActividadDetalle(actividadId);

          if (!detalle) {
            alert('No se encontró el detalle de la actividad.');
            return;
          }

          await abrirModalActividad(detalle);
        } catch (error) {
          console.error('Error obteniendo detalle de actividad:', error);
          alert('No fue posible obtener el detalle de la actividad.');
        }
      });
    });
  }

  // =========================================================
  // Combo Materia: llenar solo permitidas + auto-selección materia 1
  // - En carga inicial: fuerza materia_id=1 si está disponible
  // - Si no existe 1 en permitidas/data: selecciona la primera opción disponible
  // =========================================================
  function setMateriaOptions(materiasPermitidas, data, forceDefault) {
    if (!selMateria) return;

    const prev = selMateria.value;

    // limpiar dejando la opción placeholder (índice 0)
    while (selMateria.options.length > 1) selMateria.remove(1);

    const unique = new Map(); // materia_id -> nombre
    for (const m of (data || [])) {
      const id = toInt(m?.materia_id, 0);
      if (!id) continue;
      if (!materiasPermitidas.has(id)) continue;
      unique.set(id, m?.nombre_materia || `Materia ${id}`);
    }

    for (const [id, nombre] of unique.entries()) {
      const opt = document.createElement('option');
      opt.value = String(id);
      opt.textContent = nombre;
      selMateria.appendChild(opt);
    }

    const exists = (val) => [...selMateria.options].some(o => o.value === String(val));

    if (forceDefault) {
      // 1) intentar matematicas (id 1)
      if (exists(MATERIA_DEFAULT_ID)) {
        selMateria.value = String(MATERIA_DEFAULT_ID);
        return;
      }
      // 2) si no hay 1, elegir la primera materia disponible (si hay)
      if (selMateria.options.length > 1) {
        selMateria.selectedIndex = 1;
        return;
      }
      // 3) nada disponible
      selMateria.value = MATERIA_PLACEHOLDER_VALUE;
      return;
    }

    // No forzar: mantener selección previa si sigue existiendo
    if (prev && exists(prev)) {
      selMateria.value = prev;
    } else {
      // si quedó inválida, dejar placeholder
      selMateria.value = MATERIA_PLACEHOLDER_VALUE;
    }
  }

  // =========================================================
  // Orquestación
  // Reglas pedidas:
  // - Al cargar página: ciclo=1 + materia=1 y cargar tarjetas automáticamente
  // - Si el usuario cambia ciclo/materia: NO refrescar automáticamente
  // - Solo refrescar al presionar botón Ver usando ciclo/materia elegidos
  // =========================================================
  let isFirstLoadDone = false;

  async function refrescarVista({ forceDefaults = false } = {}) {
    const { grado_id, seccion_id, ciclo_id, anio } = getIdsSeleccion();

    if (!grado_id || !seccion_id) {
      renderNoDisponible();
      return;
    }

    const permitidas = getMateriasPermitidas(grado_id, ROL);

    try {
      const payload = { grado_id, seccion_id, ciclo_id, anio };
      const data = await fetchActividadesPorTipo(payload);

      // llenar combo materia solo con permitidas
      setMateriaOptions(permitidas, data, forceDefaults);

      // filtrar permitidas
      let dataFiltrada = (data || []).filter(m => permitidas.has(toInt(m?.materia_id)));

      // filtrar por materia seleccionada (si hay una elegida)
      const materiaSeleccionada = toInt(selMateria?.value, 0);
      if (materiaSeleccionada > 0) {
        dataFiltrada = dataFiltrada.filter(m => toInt(m?.materia_id) === materiaSeleccionada);
      } else {
        // si quedó placeholder y no hay selección, no mostramos todo (evita “ruido”)
        // puedes cambiar esto si quieres “todas”
        dataFiltrada = [];
      }

      const bucket = agruparPorSeccion(dataFiltrada);
      renderSecciones(bucket);

    } catch (e) {
      console.error('Error refrescarVista ActividadesPorTipo:', e);
      renderNoDisponible();
    }
  }

  async function abrirActividadDesdeSessionSiExiste() {
    const actividadId = obtenerActividadIdDesdeSession();

    if (!actividadId) return;

    try {
      const detalle = await fetchActividadDetalle(actividadId);

      sessionStorage.removeItem('actividadIdRedireccion');

      if (!detalle) {
        alert('No se encontró la actividad solicitada.');
        return;
      }

      await abrirModalActividad(detalle);
    } catch (error) {
      console.error('Error cargando actividad desde sessionStorage:', error);
      sessionStorage.removeItem('actividadIdRedireccion');
      alert('No fue posible abrir la actividad solicitada.');
    }
  }

  // Esperar a que combos grado/sección estén listos (se llenan async por otro JS)
  function esperarCombosListosYcargar(maxIntentos = 40) {
    let i = 0;
    const t = setInterval(() => {
      i++;

      const g = toInt(selGrado?.value, 0);
      const s = toInt(selSeccion?.value, 0);

      // en primera carga: forzar ciclo 1 (aunque ya haya valor)
      if (!isFirstLoadDone && selCiclo) selCiclo.value = String(CICLO_DEFAULT);

      if (g > 0 && s > 0) {
        clearInterval(t);

        // primera carga automática: ciclo 1 + materia 1 + tarjetas
        if (!isFirstLoadDone) {
          isFirstLoadDone = true;
          refrescarVista({ forceDefaults: true });
        } else {
          refrescarVista({ forceDefaults: false });
        }
        return;
      }

      if (i >= maxIntentos) {
        clearInterval(t);
        renderNoDisponible();
      }
    }, 200);
  }

  async function abrirModalActividad(data) {
    const oldModal = document.getElementById('modalActividad');
    if (oldModal) oldModal.remove();

    const fechaCreacion = data?.fecha_creacion
      ? String(data.fecha_creacion).substring(0, 10)
      : '';

    const fechaEntrega = data?.fecha_entrega
      ? new Date(data.fecha_entrega).toISOString().slice(0, 16)
      : '';

    let ciclos = [];
    let estadosActividad = [];
    let tiposActividad = [];

    try {
      const [ciclosRes, estadosRes, tiposRes] = await Promise.all([
        fetchCiclos(),
        fetchEstadosActividad(),
        fetchTiposActividad()
      ]);

      ciclos = ciclosRes.filter(item => item?.estado === true || item?.estado === 1);

      estadosActividad = estadosRes.filter(item => item?.estado === true || item?.estado === 1);

      tiposActividad = tiposRes
        .filter(item => item?.estado === true || item?.estado === 1)
        .filter(item => Number(item?.tipo_actividad_id) !== 3); // quitar actitudinal
    } catch (error) {
      console.error('Error cargando catálogos del modal:', error);
      alert('No fue posible cargar los catálogos del detalle de actividad.');
      return;
    }

    const optionsCiclo = buildOptions(ciclos.map(item => ({
      ciclo_id: item.ciclo_id,
      texto: `Bimestre ${item.numero_ciclo}`
    })), {
      valueField: 'ciclo_id',
      textField: 'texto',
      selectedValue: data?.ciclo_id,
      placeholder: '-- Seleccione bimestre --'
    });

    const optionsTipoActividad = buildOptions(tiposActividad.map(item => ({
      tipo_actividad_id: item.tipo_actividad_id,
      texto: item.descripcion_tipo
    })), {
      valueField: 'tipo_actividad_id',
      textField: 'texto',
      selectedValue: data?.tipo_actividad_id,
      placeholder: '-- Seleccione tipo --'
    });

    const optionsEstadoActividad = buildOptions(estadosActividad.map(item => ({
      estado_actividad_id: item.estado_actividad_id,
      texto: item.descripcion_estado
    })), {
      valueField: 'estado_actividad_id',
      textField: 'texto',
      selectedValue: data?.estado_actividad_id,
      placeholder: '-- Seleccione estado --'
    });

    const modalHTML = `
    <div class="modal fade" id="modalActividad" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">

          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">Detalle de Actividad</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>

          <div class="modal-body">
            <form id="formDetalleActividad">
              <input type="hidden" id="detalle_actividad_id" value="${safeText(data.actividad_id || '')}">

              <div class="row g-3">

                <!-- FILA 1 -->
                <div class="col-12 col-md-5">
                  <label class="form-label">Nombre de actividad</label>
                  <input
                    type="text"
                    class="form-control campo-editable-actividad"
                    id="detalle_nombre_actividad"
                    value="${safeText(data.nombre_actividad || '')}"
                    disabled>
                </div>

                <div class="col-12 col-md-2">
                  <label class="form-label">Puntaje máximo</label>
                  <input
                    type="number"
                    step="0.01"
                    class="form-control campo-editable-actividad"
                    id="detalle_puntaje_maximo"
                    value="${safeText(data.puntaje_maximo || '')}"
                    disabled>
                </div>

                <div class="col-12 col-md-3">
                  <label class="form-label">Materia</label>
                  <input
                    type="text"
                    class="form-control"
                    id="detalle_nombre_materia"
                    value="${safeText(data.nombre_materia || '')}"
                    disabled>
                </div>

                <div class="col-12 col-md-2">
                  <label class="form-label">Fecha de creación</label>
                  <input
                    type="date"
                    class="form-control"
                    id="detalle_fecha_creacion"
                    value="${safeText(fechaCreacion)}"
                    disabled>
                </div>
                <!-- FILA 2 -->

                <div class="col-12 col-md-3">
                  <label class="form-label">Fecha de entrega</label>
                  <input
                    type="datetime-local"
                    class="form-control campo-editable-actividad"
                    id="detalle_fecha_entrega"
                    value="${safeText(fechaEntrega)}"
                    disabled>
                </div>

                <div class="col-12 col-md-3">
                  <label class="form-label">Bimestre</label>
                  <select
                    class="form-select campo-editable-actividad"
                    id="detalle_ciclo_id"
                    disabled>
                    ${optionsCiclo}
                  </select>
                </div>

                <div class="col-12 col-md-3">
                  <label class="form-label">Tipo de actividad</label>
                  <select
                    class="form-select campo-editable-actividad"
                    id="detalle_tipo_actividad_id"
                    disabled>
                    ${optionsTipoActividad}
                  </select>
                </div>

                <div class="col-12 col-md-3">
                  <label class="form-label">Estado de actividad</label>
                  <select
                    class="form-select campo-editable-actividad"
                    id="detalle_estado_actividad_id"
                    disabled>
                    ${optionsEstadoActividad}
                  </select>
                </div>
                <!-- FILA 3 -->

                <div class="col-12 col-md-12">
                  <label class="form-label">Descripción</label>
                  <textarea
                    class="form-control campo-editable-actividad"
                    id="detalle_descripcion"
                    rows="4"
                    disabled>${safeText(data.descripcion || '')}</textarea>
                </div>

              </div>
            </form>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Cerrar
            </button>
            <button type="button" class="btn btn-primary" id="btnEditarActividad">
              Editar
            </button>
          </div>

        </div>
      </div>
    </div>
  `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modalEl = document.getElementById('modalActividad');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    initModalActividadEventos(modalEl, data);
  }

  function toggleCamposEdicionActividad(habilitar) {
    document.querySelectorAll('.campo-editable-actividad').forEach(el => {
      el.disabled = !habilitar;
    });
  }

  function obtenerPayloadActividadDesdeModal() {
    const fechaEntregaRaw = document.getElementById('detalle_fecha_entrega')?.value || '';

    return {
      actividad_id: toInt(document.getElementById('detalle_actividad_id')?.value, 0),
      nombre_actividad: document.getElementById('detalle_nombre_actividad')?.value?.trim() || '',
      puntaje_maximo: parseFloat(document.getElementById('detalle_puntaje_maximo')?.value || '0') || 0,
      fecha_entrega: fechaEntregaRaw
        ? fechaEntregaRaw.replace('T', ' ') + ':00'
        : '',
      ciclo_id: toInt(document.getElementById('detalle_ciclo_id')?.value, 0),
      tipo_actividad_id: toInt(document.getElementById('detalle_tipo_actividad_id')?.value, 0),
      estado_actividad_id: toInt(document.getElementById('detalle_estado_actividad_id')?.value, 0),
      descripcion: document.getElementById('detalle_descripcion')?.value?.trim() || ''
    };
  }

  function initModalActividadEventos(modalEl, dataOriginal) {
    const btnEditarActividad = modalEl.querySelector('#btnEditarActividad');
    if (!btnEditarActividad) return;

    let modoEdicion = false;

    btnEditarActividad.addEventListener('click', async () => {
      if (!modoEdicion) {
        const confirmarEditar = confirm('¿Desea habilitar la edición de esta actividad?');
        if (!confirmarEditar) return;

        modoEdicion = true;
        toggleCamposEdicionActividad(true);

        btnEditarActividad.textContent = 'Actualizar';
        btnEditarActividad.classList.remove('btn-primary');
        btnEditarActividad.classList.add('btn-success');
        return;
      }

      const payload = obtenerPayloadActividadDesdeModal();

      if (!payload.actividad_id) {
        alert('No se encontró el identificador de la actividad.');
        return;
      }

      if (!payload.nombre_actividad) {
        alert('El nombre de la actividad es obligatorio.');
        return;
      }

      if (!payload.puntaje_maximo || payload.puntaje_maximo <= 0) {
        alert('El puntaje máximo debe ser mayor a 0.');
        return;
      }

      if (!payload.fecha_entrega) {
        alert('La fecha de entrega es obligatoria.');
        return;
      }

      if (!payload.ciclo_id) {
        alert('Debe seleccionar un bimestre.');
        return;
      }

      if (!payload.tipo_actividad_id) {
        alert('Debe seleccionar un tipo de actividad.');
        return;
      }

      if (!payload.estado_actividad_id) {
        alert('Debe seleccionar un estado de actividad.');
        return;
      }

      if (!payload.descripcion) {
        alert('La descripción es obligatoria.');
        return;
      }

      const confirmarActualizar = confirm('¿Desea actualizar la información de esta actividad?');
      if (!confirmarActualizar) return;

      try {
        await actualizarActividad(payload);

        alert('Actividad actualizada correctamente.');

        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();

        refrescarVista({ forceDefaults: false });
      } catch (error) {
        console.error('Error actualizando actividad:', error);
        alert('No fue posible actualizar la actividad.');
      }
    });

    modalEl.addEventListener('hidden.bs.modal', () => {
      modalEl.remove();
    });
  }
  // =========================================================
  // Bootstrap + listeners
  // =========================================================
  document.addEventListener('DOMContentLoaded', () => {
    if (selCiclo) selCiclo.value = String(CICLO_DEFAULT);

    wrap.innerHTML = `<p class="text-muted">Cargando actividades...</p>`;

    esperarCombosListosYcargar();

    btnVer?.addEventListener('click', () => {
      refrescarVista({ forceDefaults: false });
    });

    selGrado?.addEventListener('change', () => {
      if (selCiclo) selCiclo.value = String(CICLO_DEFAULT);
      isFirstLoadDone = false;
      esperarCombosListosYcargar();
    });

    selSeccion?.addEventListener('change', () => {
      if (selCiclo) selCiclo.value = String(CICLO_DEFAULT);
      isFirstLoadDone = false;
      esperarCombosListosYcargar();
    });

    setTimeout(() => {
      abrirActividadDesdeSessionSiExiste();
    }, 800);
  });

})();
