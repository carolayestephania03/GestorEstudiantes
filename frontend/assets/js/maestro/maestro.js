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

  const btnNext = document.getElementById('btnNext');
  const btnPrev = document.getElementById('btnPrev');
  const wizardProgress = document.getElementById('wizardProgress');

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
    if (!selRenglon) return;

    // reset
    selRenglon.innerHTML = `<option value="" disabled selected>Elija renglon</option>`;

    const json = await getJSON('http://localhost:8001/renglon');
    const data = Array.isArray(json.data) ? json.data : [];

    data.forEach(r => {
      const id = toInt(r?.renglon_id, 0);
      if (!id) return;
      const opt = document.createElement('option');
      opt.value = String(id);
      opt.textContent = r?.descripcion || `Renglón ${id}`;
      selRenglon.appendChild(opt);
    });
  }

  async function cargarEscalafones() {
    if (!selEscalaf) return;

    // reset
    selEscalaf.innerHTML = `<option value="" disabled selected>Elija escalafon</option>`;

    const json = await getJSON('http://localhost:8001/escalafon');
    const data = Array.isArray(json.data) ? json.data : [];

    data.forEach(e => {
      const id = toInt(e?.escalafon_id, 0);
      if (!id) return;
      const opt = document.createElement('option');
      opt.value = String(id);
      opt.textContent = e?.descripcion || `Escalafón ${id}`;
      selEscalaf.appendChild(opt);
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

  if (currentStep === 1) {
    step1.classList.remove('d-none');
    step2.classList.add('d-none');

    btnPrev.disabled = true;
    btnNext.classList.remove('d-none');
    btnGuardarMaestro.classList.add('d-none');

    wizardProgress.style.width = '50%';
  }

  if (currentStep === 2) {
    step1.classList.add('d-none');
    step2.classList.remove('d-none');

    btnPrev.disabled = false;
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
      const dpi = m?.dpi_maestro ?? '—';

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
          </td>
        </tr>
      `;
    }).join('');

    tbody.innerHTML = rows;

    // Botón editar (por ahora solo demo)
    tbody.querySelectorAll('.btn-editar').forEach(btn => {
      btn.addEventListener('click', () => {
        const data = JSON.parse(btn.dataset.maestro || '{}');
        abrirModalEditar(data);
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

  modalCodigo.value = data.codigo_empleado || '';
  modalNombre.value = data.maestro_nombre || '';
  modalApellido.value = data.maestro_apellido || '';
  modalDpi.value = data.dpi_maestro || '';
  modalTelefono.value = data.telefono || '';
  modalRenglon.value = data.renglon_id || '';
  modalEscalafon.value = data.escalafon_id || '';

  actualizarWizard();
  modalMaestro.show();
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


        /*Control formulario modal maestro*/
btnNext.addEventListener('click', () => {

  // Validación paso 1
  if (!modalNombre.value.trim() || !modalApellido.value.trim()) {
    alert('Complete nombre y apellido');
    return;
  }

  currentStep = 2;
  actualizarWizard();
});

btnPrev.addEventListener('click', () => {
  currentStep = 1;
  actualizarWizard();
});


    /*VERIFICAR ACA*/
    btnGuardarMaestro.addEventListener('click', async () => {

  const payload = {
    persona: {
      codigo_empleado: modalCodigo.value || null,
      nombre: modalNombre.value.trim(),
      apellido: modalApellido.value.trim(),
      dpi: modalDpi.value.trim(),
      telefono: modalTelefono.value.trim()
    },
    maestro: {
      renglon_id: toInt(modalRenglon.value, null),
      escalafon_id: toInt(modalEscalafon.value, null)
    }
  };

  try {

    if (modoActual === 'crear') {
      await postJSON('http://localhost:8001/persona/CrearMaestroCompleto', payload);
    }

    if (modoActual === 'editar') {
      await postJSON('http://localhost:8001/persona/ActualizarMaestroCompleto', payload);
    }

    modalMaestro.hide();
    buscarMaestros();

  } catch (e) {
    alert('Error al guardar.');
  }
});


    // Si cambian grado/sección, limpiar tabla (para evitar confusiones)
    selGrado?.addEventListener('change', () => setEmpty('Presione Buscar para ver resultados.'));
    selSeccion?.addEventListener('change', () => setEmpty('Presione Buscar para ver resultados.'));
  });

})();
