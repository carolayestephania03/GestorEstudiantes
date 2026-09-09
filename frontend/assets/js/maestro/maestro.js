(() => {
  'use strict';

  // =========================================================
  // DOM
  // =========================================================
  const selGrado = document.getElementById('combo_grado_direc');
  const selSeccion = document.getElementById('combo_seccion_direc');

  const inpCodEmp = document.getElementById('Cod_empleado');
  const selRenglon = document.getElementById('renglon_maestro');
  const selEscalaf = document.getElementById('escalafon_maestro');
  const inpNombre = document.getElementById('nombre_maestro');
  const inpDpi = document.getElementById('dpi_maestro');

  const btnBuscar = document.getElementById('search-btn');
  const btnCrear = document.getElementById('create-btn'); // (no hace nada por ahora)

  const tbody = document.getElementById('tableBodyMaestro');
  const table = document.getElementById('dataTableMaestro');

  const modalElement = document.getElementById('modalMaestro');
  const modalMaestro = modalElement ? new bootstrap.Modal(modalElement) : null;

  const modalTitle = document.getElementById('modalMaestroTitle');
  const btnGuardarMaestro = document.getElementById('btnGuardarMaestro');

  const modalCodigo = document.getElementById('modal_codigo_empleado');
  const modalNombre = document.getElementById('modal_nombre');
  const modalApellido = document.getElementById('modal_apellido');
  const modalDpi = document.getElementById('modal_dpi');
  const modalTelefono = document.getElementById('modal_telefono');
  const modalRenglon = document.getElementById('modal_renglon');
  const modalEscalafon = document.getElementById('modal_escalafon');

  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');
  const step3 = document.getElementById('step-3');

  const modalUsuario = document.getElementById('modal_usuario');
  const modalCedulaDocente = document.getElementById('modal_cedula_docente');
  const modalCodigoInstitucional = document.getElementById('modal_codigo_institucional');
  const modalFechaInicioLabores = document.getElementById('modal_fecha_inicio_labores');

  const modalGradoAsignado = document.getElementById('modal_grado_asignado');
  const modalSeccionAsignada = document.getElementById('modal_seccion_asignada');

  const btnNext = document.getElementById('btnNext');
  const btnPrev = document.getElementById('btnPrev');
  const wizardProgress = document.getElementById('wizardProgress');

  const modalEliminarElement = document.getElementById('modalEliminarMaestro');
  const modalEliminarMaestro = modalEliminarElement ? new bootstrap.Modal(modalEliminarElement) : null;

  const btnConfirmarEliminarMaestro = document.getElementById('btnConfirmarEliminarMaestro');
  const textoEliminarMaestro = document.getElementById('textoEliminarMaestro');

  let maestroAEliminar = null;

  // =========================================================
  // userData (sessionStorage)
  // =========================================================
  let userData = null;
  try {
    const raw = sessionStorage.getItem('userData');
    userData = raw ? JSON.parse(raw) : null;
  } catch {
    userData = null;
  }
  const ANIO = Number(userData?.maestro_anio_actual ?? new Date().getFullYear());

  // =========================================================
  // Helpers
  // =========================================================
  function toInt(x, def = 0) {
    const n = parseInt(x, 10);
    return Number.isFinite(n) ? n : def;
  }

  function safeText(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function normStr(s) {
    return String(s ?? '').trim();
  }

  function setLoading(msg = 'Cargando...') {
    if (!tbody) return;
    tbody.innerHTML = `
      <tr>
        <td colspan="999" class="text-center text-muted py-4">${safeText(msg)}</td>
      </tr>
    `;
  }

  function setEmpty(msg = 'Datos no disponibles') {
    if (!tbody) return;
    tbody.innerHTML = `
      <tr>
        <td colspan="999" class="text-center text-muted py-4">${safeText(msg)}</td>
      </tr>
    `;
  }

  // Convierte "Primero-A | Segundo-B" -> <ul><li>Primero-A</li>...</ul>
  function gruposToBullets(gruposStr) {
    const raw = normStr(gruposStr);
    if (!raw) return '<span class="text-muted">—</span>';

    const parts = raw.split('|').map(x => x.trim()).filter(Boolean);
    if (!parts.length) return '<span class="text-muted">—</span>';

    const items = parts.map(p => `<li class="mb-0">${safeText(p)}</li>`).join('');
    return `<ul class="mb-0 ps-3">${items}</ul>`;
  }

  // =========================================================
  // HTTP
  // =========================================================
  async function getJSON(url) {
    const r = await fetch(url, { method: 'GET', credentials: 'include' });
    if (!r.ok) throw new Error(`${url} HTTP ${r.status}`);
    return r.json();
  }

  async function postJSON(url, payload) {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    if (!r.ok) throw new Error(`${url} HTTP ${r.status}`);
    return r.json();
  }

  // =========================================================
  // Cargar combos (renglón / escalafón)
  // =========================================================
  async function cargarRenglones() {
    const selectsRenglon = [selRenglon, modalRenglon].filter(Boolean);

    if (!selectsRenglon.length) return;

    const json = await getJSON('http://localhost:8001/renglon');
    const data = Array.isArray(json.data) ? json.data : [];

    selectsRenglon.forEach(select => {
      select.innerHTML = `<option value="" disabled selected>Elija renglon</option>`;

      data.forEach(r => {
        const id = toInt(r?.renglon_id, 0);
        if (!id) return;

        const opt = document.createElement('option');
        opt.value = String(id);
        opt.textContent = r?.descripcion || `Renglón ${id}`;
        select.appendChild(opt);
      });
    });
  }

  async function cargarEscalafones() {
    const selectsEscalafon = [selEscalaf, modalEscalafon].filter(Boolean);

    if (!selectsEscalafon.length) return;

    const json = await getJSON('http://localhost:8001/escalafon');
    const data = Array.isArray(json.data) ? json.data : [];

    selectsEscalafon.forEach(select => {
      select.innerHTML = `<option value="" disabled selected>Elija escalafon</option>`;

      data.forEach(e => {
        const id = toInt(e?.escalafon_id, 0);
        if (!id) return;

        const opt = document.createElement('option');
        opt.value = String(id);
        opt.textContent = e?.descripcion || `Escalafón ${id}`;
        select.appendChild(opt);
      });
    });
  }

  // =========================================================
  // Construir payload: quitar campos opcionales si vienen vacíos
  // =========================================================
  function buildPayloadBuscar() {
    const grado_id = toInt(selGrado?.value, 0);
    const seccion_id = toInt(selSeccion?.value, 0);

    if (!grado_id || !seccion_id) {
      return { error: 'Seleccione grado y sección.' };
    }

    const payload = {
      anio: ANIO,
      grado_id,
      seccion_id
      // opcionales se agregan abajo
    };

    const codigo_empleado = normStr(inpCodEmp?.value);
    if (codigo_empleado) payload.codigo_empleado = toInt(codigo_empleado, null);

    const renglon_id = normStr(selRenglon?.value);
    if (renglon_id) payload.renglon_id = toInt(renglon_id, null);

    const escalafon_id = normStr(selEscalaf?.value);
    if (escalafon_id) payload.escalafon_id = toInt(escalafon_id, null);

    const nombre_maestro = normStr(inpNombre?.value);
    if (nombre_maestro) payload.nombre_maestro = nombre_maestro;

    const dpi_maestro = normStr(inpDpi?.value);
    if (dpi_maestro) payload.dpi_maestro = dpi_maestro;

    // Estos dos no existen en tu form actual, pero los dejo listos por si luego los agregas:
    // grado_imparte_id / seccion_imparte_id
    // (solo se enviarían si existen en el DOM y tienen valor)
    const selGradoImparte = document.getElementById('combo_grado_imparte');
    const selSeccionImparte = document.getElementById('combo_seccion_imparte');

    const grado_imparte_id = selGradoImparte ? normStr(selGradoImparte.value) : '';
    if (grado_imparte_id) payload.grado_imparte_id = toInt(grado_imparte_id, null);

    const seccion_imparte_id = selSeccionImparte ? normStr(selSeccionImparte.value) : '';
    if (seccion_imparte_id) payload.seccion_imparte_id = toInt(seccion_imparte_id, null);

    return { payload };
  }

  // =========================================================
  // Control formulario maestro (modal)
  // =========================================================


  let currentStep = 1;
  let modoActual = 'crear'; // crear | editar

  function actualizarWizard() {
    step1.classList.add('d-none');
    step2.classList.add('d-none');
    step3.classList.add('d-none');

    btnPrev.disabled = false;
    btnNext.classList.remove('d-none');
    btnGuardarMaestro.classList.add('d-none');

    if (currentStep === 1) {
      step1.classList.remove('d-none');
      btnPrev.disabled = true;
      wizardProgress.style.width = '33%';
    }

    if (currentStep === 2) {
      step2.classList.remove('d-none');
      wizardProgress.style.width = '66%';
    }

    if (currentStep === 3) {
      step3.classList.remove('d-none');
      btnNext.classList.add('d-none');
      btnGuardarMaestro.classList.remove('d-none');
      wizardProgress.style.width = '100%';

      btnGuardarMaestro.textContent =
        modoActual === 'editar' ? 'Actualizar' : 'Guardar';

      btnGuardarMaestro.className =
        modoActual === 'editar'
          ? 'btn btn-warning'
          : 'btn btn-success';
    }
  }


  // =========================================================
  // Render tabla
  // =========================================================
  function renderTabla(maestros) {
    if (!tbody) return;

    if (!Array.isArray(maestros) || !maestros.length) {
      setEmpty('Datos no disponibles');
      return;
    }

    const rows = maestros.map((m, idx) => {
      const cod = m?.codigo_empleado ?? '';
      const nombre = `${m?.maestro_nombre ?? ''} ${m?.maestro_apellido ?? ''}`.trim() || '—';
      const tel = m?.telefono ?? '—';
      const renglon = m?.renglon ?? '—';
      const escalafon = m?.escalafon ?? '—';

      const gruposHTML = gruposToBullets(m?.grupos_donde_imparte);

      return `
      <tr>
        <td class="text-nowrap">${idx + 1}</td>
        <td class="text-nowrap">${safeText(cod)}</td>
        <td class="text-nowrap">${safeText(nombre)}</td>
        <td class="text-nowrap">${safeText(tel)}</td>
        <td class="text-nowrap">${safeText(renglon)}</td>
        <td class="text-nowrap">${safeText(escalafon)}</td>
        <td>${gruposHTML}</td>
        <td class="text-nowrap text-center">
          <button type="button"
            class="btn btn-sm btn-outline-primary btn-editar"
            data-maestro='${JSON.stringify(m)}'>
            Editar
          </button>
          <button type="button"
            class="btn btn-sm btn-outline-danger btn-eliminar"
            data-maestro='${JSON.stringify(m)}'>
            Eliminar
          </button>
        </td>
      </tr>
    `;
    }).join('');

    tbody.innerHTML = rows;

    tbody.querySelectorAll('.btn-editar').forEach(btn => {
      btn.addEventListener('click', () => {
        const data = JSON.parse(btn.dataset.maestro || '{}');
        abrirModalEditar(data);
      });
    });

    tbody.querySelectorAll('.btn-eliminar').forEach(btn => {
      btn.addEventListener('click', () => {
        const data = JSON.parse(btn.dataset.maestro || '{}');
        abrirModalEliminar(data);
      });
    });
  }

  // =========================================================
  // limpiar
  // =========================================================

  function limpiarModal() {
    modalCodigo.value = '';
    modalNombre.value = '';
    modalApellido.value = '';
    modalDpi.value = '';
    modalTelefono.value = '';
    modalRenglon.value = '';
    modalEscalafon.value = '';

    modalUsuario.value = '';
    modalCedulaDocente.value = '';
    modalCodigoInstitucional.value = '';
    modalFechaInicioLabores.value = '';

    modalGradoAsignado.value = '';
    modalSeccionAsignada.value = '';

    const hiddenDpiBusqueda = document.getElementById('modal_dpi_busqueda');
    if (hiddenDpiBusqueda) hiddenDpiBusqueda.value = '';

    const modalCorreo = document.getElementById('modal_correo');
    const modalResidencia = document.getElementById('modal_residencia');
    const modalGenero = document.getElementById('modal_genero');
    const modalNit = document.getElementById('modal_nit');
    const modalFechaNacimiento = document.getElementById('modal_fecha_nacimiento');

    if (modalCorreo) modalCorreo.value = '';
    if (modalResidencia) modalResidencia.value = '';
    if (modalGenero) modalGenero.value = '';
    if (modalNit) modalNit.value = '';
    if (modalFechaNacimiento) modalFechaNacimiento.value = '';
  }

  function abrirModalCrear() {
    modoActual = 'crear';
    currentStep = 1;

    document.getElementById('modalMaestroTitle').textContent = 'Registrar Maestro';

    limpiarModal();
    actualizarWizard();
    modalMaestro.show();
  }


  function abrirModalEditar(data) {
    modoActual = 'editar';
    currentStep = 1;

    document.getElementById('modalMaestroTitle').textContent = 'Editar Maestro';

    limpiarModal();

    const hiddenDpiBusqueda = document.getElementById('modal_dpi_busqueda');
    if (hiddenDpiBusqueda) hiddenDpiBusqueda.value = data.dpi_maestro || '';

    modalCodigo.value = data.codigo_empleado || '';
    modalNombre.value = data.maestro_nombre || '';
    modalApellido.value = data.maestro_apellido || '';
    modalDpi.value = data.dpi_maestro || '';
    modalTelefono.value = data.telefono || '';
    modalRenglon.value = data.renglon_id || '';
    modalEscalafon.value = data.escalafon_id || '';

    modalUsuario.value = data.nombre_usuario || '';
    modalCedulaDocente.value = data.cedula_docente || '';
    modalCodigoInstitucional.value = data.codigo_institucional || '';
    modalFechaInicioLabores.value = data.fecha_inicio_labores || '';

    modalGradoAsignado.value = data.grado_base_id || '';
    modalSeccionAsignada.value = data.seccion_base_id || '';

    const modalCorreo = document.getElementById('modal_correo');
    const modalResidencia = document.getElementById('modal_residencia');
    const modalGenero = document.getElementById('modal_genero');
    const modalNit = document.getElementById('modal_nit');
    const modalFechaNacimiento = document.getElementById('modal_fecha_nacimiento');

    if (modalCorreo) modalCorreo.value = data.correo || '';
    if (modalResidencia) modalResidencia.value = data.residencia || '';
    if (modalNit) modalNit.value = data.nit || '';
    if (modalFechaNacimiento) modalFechaNacimiento.value = data.fecha_nacimiento || '';

    if (modalGenero) {
      if (data.genero_id === 'M') modalGenero.value = 'Masculino';
      else if (data.genero_id === 'F') modalGenero.value = 'Femenino';
      else modalGenero.value = '';
    }

    actualizarWizard();
    modalMaestro.show();
  }

  // =========================================================
  // Payload eliminar maestro
  // =========================================================

  async function eliminarMaestro(payload) {
    const r = await fetch('http://localhost:8001/persona/eliminarMaestro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      throw new Error(err?.error || `EliminarMaestro HTTP ${r.status}`);
    }

    return r.json();
  }

  function abrirModalEliminar(data) {
    maestroAEliminar = data || null;

    if (!maestroAEliminar) return;

    const nombre = `${data?.maestro_nombre ?? ''} ${data?.maestro_apellido ?? ''}`.trim();
    const dpi = data?.dpi_maestro ?? '—';
    const codigo = data?.codigo_empleado ?? '—';

    if (textoEliminarMaestro) {
      textoEliminarMaestro.innerHTML = `
      <strong>${safeText(nombre || 'Maestro')}</strong><br>
      DPI: ${safeText(dpi)}<br>
      Código empleado: ${safeText(codigo)}
    `;
    }

    modalEliminarMaestro?.show();
  }

  // =========================================================
  // Payload guardar maestro (crear/editar): quitar campos opcionales si vienen vacíos
  // =========================================================

  function normalizarFechaISO(valor) {
    const v = String(valor || '').trim();
    if (!v) return '';

    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;

    const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) {
      const [, dd, mm, yyyy] = m;
      return `${yyyy}-${mm}-${dd}`;
    }

    return v;
  }

  function buildPayloadGuardarMaestro() {
    const modalGenero = document.getElementById('modal_genero');
    const modalNit = document.getElementById('modal_nit');
    const modalFechaNacimiento = document.getElementById('modal_fecha_nacimiento');
    const modalCorreo = document.getElementById('modal_correo');
    const modalResidencia = document.getElementById('modal_residencia');
    const hiddenDpiBusqueda = document.getElementById('modal_dpi_busqueda');

    const nombre = modalNombre.value.trim();
    const apellido = modalApellido.value.trim();
    const correo = modalCorreo?.value.trim() || '';
    const telefono = modalTelefono.value.trim();
    const residencia = modalResidencia?.value.trim() || '';
    const dpi = modalDpi.value.trim();
    const fecha_nacimiento = normalizarFechaISO(modalFechaNacimiento?.value || '');
    const nit = modalNit?.value.trim() || '';

    const generoTexto = modalGenero?.value || '';
    const genero_id =
      generoTexto === 'Masculino' ? 'M' :
        generoTexto === 'Femenino' ? 'F' :
          null;

    const nombre_usuario = modalUsuario.value.trim();
    const codigo_empleado = toInt(modalCodigo.value, 0);
    const cedula_docente = toInt(modalCedulaDocente.value, 0);
    const fecha_inicio_labores = normalizarFechaISO(modalFechaInicioLabores.value || '');

    const escalafon_id = modalEscalafon.value ? toInt(modalEscalafon.value, null) : null;
    const renglon_id = modalRenglon.value ? toInt(modalRenglon.value, null) : null;

    const codigoInstitucionalRaw = modalCodigoInstitucional.value.trim();
    const codigo_institucional = codigoInstitucionalRaw
      ? toInt(codigoInstitucionalRaw, null)
      : null;

    const grado_id = modalGradoAsignado.value ? toInt(modalGradoAsignado.value, null) : null;
    const seccion_id = modalSeccionAsignada.value ? toInt(modalSeccionAsignada.value, null) : null;

    const asignar_clase = (grado_id && seccion_id) ? 1 : 0;

    if (!nombre) return { error: 'Complete el nombre.' };
    if (!apellido) return { error: 'Complete el apellido.' };
    if (!correo) return { error: 'Complete el correo.' };
    if (!telefono) return { error: 'Complete el teléfono.' };
    if (!residencia) return { error: 'Complete la residencia.' };
    if (!dpi) return { error: 'Complete el DPI.' };
    if (!fecha_nacimiento) return { error: 'Complete la fecha de nacimiento.' };
    if (!nit) return { error: 'Complete el NIT.' };
    if (!nombre_usuario) return { error: 'Complete el nombre de usuario.' };
    if (!codigo_empleado) return { error: 'Complete el código de empleado.' };
    if (!cedula_docente) return { error: 'Complete la cédula docente.' };
    if (!fecha_inicio_labores) return { error: 'Complete la fecha de inicio de labores.' };

    // CREAR
    if (modoActual === 'crear') {
      return {
        payload: {
          nombre,
          apellido,
          correo,
          telefono,
          residencia,
          genero_id,
          dpi,
          fecha_nacimiento,
          nit,
          nombre_usuario,
          codigo_empleado,
          cedula_docente,
          fecha_inicio_labores,
          escalafon_id,
          renglon_id,
          codigo_institucional,
          asignar_clase,
          grado_id: asignar_clase ? grado_id : null,
          seccion_id: asignar_clase ? seccion_id : null
        }
      };
    }

    // ACTUALIZAR
    const dpi_busqueda = hiddenDpiBusqueda?.value?.trim() || '';
    if (!dpi_busqueda) {
      return { error: 'No se encontró el DPI original para actualizar.' };
    }

    return {
      payload: {
        dpi_busqueda,
        nombre,
        apellido,
        correo,
        telefono,
        residencia,
        genero_id,
        dpi_nuevo: dpi,
        fecha_nacimiento,
        nit,
        nombre_usuario,
        codigo_empleado,
        cedula_docente,
        fecha_inicio_labores,
        escalafon_id,
        renglon_id,
        codigo_institucional,
        asignar_clase,
        grado_id: asignar_clase ? grado_id : null,
        seccion_id: asignar_clase ? seccion_id : null
      }
    };
  }


  // =========================================================
  // Buscar
  // =========================================================
  async function buscarMaestros() {
    const built = buildPayloadBuscar();
    if (built.error) {
      setEmpty(built.error);
      return;
    }

    setLoading('Buscando maestros...');

    try {
      const json = await postJSON('http://localhost:8001/persona/BuscarMaestro', built.payload);
      const data = Array.isArray(json.data) ? json.data : [];
      renderTabla(data);
    } catch (e) {
      console.error('Error BuscarMaestro:', e);
      setEmpty('Datos no disponibles');
    }
  }

  // =========================================================
  // Bootstrap
  // =========================================================
  document.addEventListener('DOMContentLoaded', async () => {
    // Estado inicial tabla
    setEmpty('Use los filtros y presione Buscar.');

    // Cargar combos
    try {
      await Promise.all([cargarRenglones(), cargarEscalafones()]);
    } catch (e) {
      console.error('Error cargando catálogos (renglon/escalafon):', e);
      // No bloqueamos, el usuario puede buscar igual
    }

    // Listeners
    btnBuscar?.addEventListener('click', (ev) => {
      ev.preventDefault();
      buscarMaestros();
    });

    btnCrear?.addEventListener('click', () => {
      abrirModalCrear();
    });

    btnConfirmarEliminarMaestro?.addEventListener('click', async () => {
      if (!maestroAEliminar) return;

      try {
        const payload = {};

        const dpi = normStr(maestroAEliminar?.dpi_maestro);
        const codigo = toInt(maestroAEliminar?.codigo_empleado, 0);

        if (dpi) {
          payload.dpi = dpi;
        } else if (codigo > 0) {
          payload.codigo_empleado = codigo;
        } else {
          alert('No se encontró DPI ni código de empleado para eliminar.');
          return;
        }

        await eliminarMaestro(payload);

        modalEliminarMaestro?.hide();
        maestroAEliminar = null;

        buscarMaestros();

      } catch (e) {
        console.error('Error al eliminar maestro:', e);
        alert('No fue posible eliminar el maestro.');
      }
    });

    /*Control formulario modal maestro*/
    btnNext.addEventListener('click', () => {
      if (currentStep === 1) {
        if (!modalNombre.value.trim() || !modalApellido.value.trim()) {
          alert('Complete nombre y apellido');
          return;
        }

        if (!modalDpi.value.trim()) {
          alert('Complete el DPI.');
          return;
        }

        currentStep = 2;
        actualizarWizard();
        return;
      }

      if (currentStep === 2) {
        /*if (!modalRenglon.value || !modalEscalafon.value) {
          alert('Seleccione renglón y escalafón.');
          return;
        }*/

        currentStep = 3;
        actualizarWizard();
      }
    });

    btnPrev.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep -= 1;
        actualizarWizard();
      }
    });

    btnGuardarMaestro.addEventListener('click', async () => {
      const built = buildPayloadGuardarMaestro();

      if (built.error) {
        alert(built.error);
        return;
      }

      try {
        if (modoActual === 'crear') {
          await postJSON('http://localhost:8001/persona/CrearMaestro', built.payload);
        } else {
          await postJSON('http://localhost:8001/persona/ActualizarMaestro', built.payload);
        }

        modalMaestro.hide();
        buscarMaestros();

      } catch (e) {
        console.error('Error al guardar maestro:', e);
        alert('Error al guardar.');
      }
    });


    // Si cambian grado/sección, limpiar tabla (para evitar confusiones)
    selGrado?.addEventListener('change', () => setEmpty('Presione Buscar para ver resultados.'));
    selSeccion?.addEventListener('change', () => setEmpty('Presione Buscar para ver resultados.'));
  });

})();
