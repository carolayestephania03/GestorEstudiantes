(() => {
  'use strict';

  // =========================================================
  // DOM
  // =========================================================
  const selGrado = document.getElementById('combo_grado_direc');
  const selSeccion = document.getElementById('combo_seccion_direc');

  const inpCodigo = document.getElementById('Cod_alumno');
  const inpNombre = document.getElementById('nombre_alumno');
  const inpDpi = document.getElementById('dpi_alumno');
  const inpMaestro = document.getElementById('nombre_maestro');

  const btnBuscar = document.getElementById('search-btn');
  const tbody = document.getElementById('tableBodyActivities');

  // ================================
  // MODAL ALUMNO
  // ================================
  const modalAlumnoEl = document.getElementById('modalAlumno');
  const modalAlumno = modalAlumnoEl ? new bootstrap.Modal(modalAlumnoEl) : null;

  const btnCrearAlumno = document.getElementById('create-btn');

  const step1 = document.getElementById('step-1-alumno');
  const step2 = document.getElementById('step-2-alumno');


  const btnNext = document.getElementById('btnNextAlumno');
  const btnPrev = document.getElementById('btnPrevAlumno');
  const btnGuardar = document.getElementById('btnGuardarAlumno');
  const wizardProgress = document.getElementById('wizardProgressAlumno');

  let currentStep = 1;
  let modoAlumno = "crear"; // crear | editar


  // Año (puedes amarrarlo a sessionStorage si ya lo manejas en tu app)
  let ANIO = new Date().getFullYear();
  try {
    const raw = sessionStorage.getItem('userData');
    const ud = raw ? JSON.parse(raw) : null;
    if (ud?.maestro_anio_actual) ANIO = Number(ud.maestro_anio_actual);
  } catch { }

  // =========================================================
  // Helpers
  // =========================================================
  const toInt = (x, def = 0) => {
    const n = parseInt(x, 10);
    return Number.isFinite(n) ? n : def;
  };

  const safeText = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));

  function setMessageRow(msg) {
    if (!tbody) return;
    tbody.innerHTML = `
      <tr>
        <td colspan="999" class="text-center text-muted py-3">${safeText(msg)}</td>
      </tr>
    `;
  }

  function maestrosToBullets(str) {
    const raw = String(str ?? '').trim();
    if (!raw) return '<span class="text-muted">—</span>';

    const parts = raw
      .split('|')
      .map(x => x.trim())
      .filter(Boolean);

    if (!parts.length) return '<span class="text-muted">—</span>';

    return `
      <ul class="mb-0 ps-3">
        ${parts.map(m => `<li>${safeText(m)}</li>`).join('')}
      </ul>
    `;
  }

  // =========================================================
  // API
  // =========================================================
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

  async function buscarAlumnos(payload) {
    const json = await postJSON('http://localhost:8001/alumno/Buscar', payload);
    return Array.isArray(json.data) ? json.data : [];
  }

  // =========================================================
  // Payload builder (quita campos vacíos)
  // =========================================================
  function buildPayload() {
    const grado_id = toInt(selGrado?.value, 0);
    const seccion_id = toInt(selSeccion?.value, 0);

    const payload = { anio: ANIO, grado_id, seccion_id };

    const nombre_alumno = (inpNombre?.value || '').trim();
    const nombre_maestro = (inpMaestro?.value || '').trim();
    const codigo_alumno = (inpCodigo?.value || '').trim();
    const dpi_alumno = (inpDpi?.value || '').trim();

    // Solo agregar si tienen algo
    if (nombre_alumno) payload.nombre_alumno = nombre_alumno;
    if (nombre_maestro) payload.nombre_maestro = nombre_maestro;
    if (codigo_alumno) payload.codigo_alumno = codigo_alumno;
    if (dpi_alumno) payload.dpi_alumno = dpi_alumno;

    return payload;
  }

  // =========================================================
  // Render tabla
  // =========================================================
  function renderRows(lista) {
    if (!tbody) return;

    if (!lista || !lista.length) {
      setMessageRow('No se encontraron resultados.');
      return;
    }

    tbody.innerHTML = lista.map((x, idx) => {
      const codigo = x.codigo_alumno ?? '—';
      const dpi = x.dpi_alumno ?? '—';
      const nombre = `${x.alumno_nombre ?? ''} ${x.alumno_apellido ?? ''}`.trim() || '—';
      const tel = x.alumno_telefono ?? '—';
      const estado = x.estado_alumno ?? '—';

      return `
        <tr data-alumno-id="${safeText(x.alumno_id)}">
          <td class="text-nowrap">${idx + 1}</td>
          <td class="text-nowrap">${safeText(codigo)}</td>
          <td class="text-nowrap">${safeText(dpi)}</td>
          <td class="text-nowrap">${safeText(nombre)}</td>
          <td class="text-nowrap">${safeText(tel)}</td>
          <td>${maestrosToBullets(x.maestros_que_le_dan_clase)}</td>
          <td class="text-nowrap">${safeText(estado)}</td>
          <td class="text-nowrap">
            <button type="button" class="btn btn-sm btn-outline-success btn-editar">Actualizar</button>
            <button type="button" class="btn btn-sm btn-outline-danger">Eliminar</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  tbody?.addEventListener("click", (e) => {

    const btn = e.target.closest(".btn-editar");
    if (!btn) return;

    const tr = btn.closest("tr");
    const alumnoId = tr?.dataset.alumnoId;

    if (!alumnoId) return;

    modoAlumno = "editar";
    currentStep = 1;

    // Aquí deberías hacer fetch para traer datos por ID
    console.log("Editar alumno ID:", alumnoId);

    actualizarWizard();
    modalAlumno?.show();
  });

  // =========================================================
  // Acción buscar
  // =========================================================
  async function onBuscar(e) {
    e?.preventDefault();

    const grado_id = toInt(selGrado?.value, 0);
    const seccion_id = toInt(selSeccion?.value, 0);

    if (!grado_id || !seccion_id) {
      setMessageRow('Seleccione grado y sección.');
      return;
    }

    setMessageRow('Buscando...');

    try {
      const payload = buildPayload();
      const data = await buscarAlumnos(payload);
      renderRows(data);
    } catch (err) {
      console.error('Error buscar alumnos:', err);
      setMessageRow('Datos no disponibles.');
    }
  }

  // =========================================================
  // Modal alumno (crear/editar)
  // =========================================================

  function actualizarWizard() {

    if (currentStep === 1) {
      step1?.classList.remove("d-none");
      step2?.classList.add("d-none");

      btnPrev?.setAttribute("disabled", true);
      btnNext?.classList.remove("d-none");
      btnGuardar?.classList.add("d-none");

      if (wizardProgress) wizardProgress.style.width = "50%";
    }

    if (currentStep === 2) {
      step1?.classList.add("d-none");
      step2?.classList.remove("d-none");

      btnPrev?.removeAttribute("disabled");
      btnNext?.classList.add("d-none");
      btnGuardar?.classList.remove("d-none");

      if (wizardProgress) wizardProgress.style.width = "100%";

      if (modoAlumno === "editar") {
        btnGuardar.textContent = "Actualizar";
        btnGuardar.className = "btn btn-warning";
      } else {
        btnGuardar.textContent = "Guardar";
        btnGuardar.className = "btn btn-success";
      }
    }
  }



  // =========================================================
  // Bootstrap
  // =========================================================
  document.addEventListener('DOMContentLoaded', () => {
    // estado inicial
    setMessageRow('Seleccione filtros y presione Buscar.');

    // botón buscar
    btnBuscar?.addEventListener('click', onBuscar);

    // (opcional) Enter en inputs dispara buscar
    [inpCodigo, inpNombre, inpDpi, inpMaestro].forEach(inp => {
      inp?.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') onBuscar(ev);
      });
    });
  });

  btnCrearAlumno?.addEventListener("click", () => {

    modoAlumno = "crear";
    currentStep = 1;

    document.getElementById("formAlumno")?.reset();

    actualizarWizard();
    modalAlumno?.show();
  });

  btnNext?.addEventListener("click", () => {

    const nombre = document.getElementById("modal_nombre")?.value.trim();
    const apellido = document.getElementById("modal_apellido")?.value.trim();

    if (!nombre || !apellido) {
      alert("Debe completar nombre y apellido");
      return;
    }

    currentStep = 2;
    actualizarWizard();
  });

  btnPrev?.addEventListener("click", () => {
    currentStep = 1;
    actualizarWizard();
  });

  btnGuardar?.addEventListener("click", async () => {

    const payload = {
      persona: {
        nombre: document.getElementById("modal_nombre")?.value.trim(),
        apellido: document.getElementById("modal_apellido")?.value.trim(),
        telefono: document.getElementById("modal_telefono")?.value.trim(),
        genero: document.getElementById("modal_genero")?.value,
        dpi: document.getElementById("modal_dpi")?.value.trim(),
        nit: document.getElementById("modal_nit")?.value.trim(),
        fecha_nacimiento: document.getElementById("modal_fecha_nacimiento")?.value,
        correo: document.getElementById("modal_correo")?.value.trim(),
        residencia: document.getElementById("modal_residencia")?.value.trim()
      },
      alumno: {
        grado: document.getElementById("modal_grado_alumno")?.value,
        seccion: document.getElementById("modal_seccion_alumno")?.value
      }
    };

    try {

      if (modoAlumno === "crear") {
        await fetch("http://localhost:8001/alumno/CrearCompleto", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (modoAlumno === "editar") {
        await fetch("http://localhost:8001/alumno/ActualizarCompleto", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      modalAlumno?.hide();
      onBuscar(); // refrescar tabla

    } catch (error) {
      alert("Error al guardar alumno");
    }

  });

})();
