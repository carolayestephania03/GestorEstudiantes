(() => {
  "use strict";

  // =========================================================
  // DOM PRINCIPAL
  // =========================================================
  const selGrado = document.getElementById("combo_grado_direc");
  const selSeccion = document.getElementById("combo_seccion_direc");

  const inpCodigo = document.getElementById("Cod_alumno");
  const inpNombre = document.getElementById("nombre_alumno");
  const inpDpi = document.getElementById("dpi_alumno");
  const inpMaestro = document.getElementById("nombre_maestro");

  const btnBuscar = document.getElementById("search-btn");
  const tbody = document.getElementById("tableBodyActivities");

  // =========================================================
  // MODAL ALUMNO
  // =========================================================
  const modalAlumnoEl = document.getElementById("modalAlumno");
  const modalAlumno = modalAlumnoEl ? new bootstrap.Modal(modalAlumnoEl) : null;

  const btnCrearAlumno = document.getElementById("create-btn");

  const formAlumno = document.getElementById("formAlumno");
  const modalAlumnoTitle = document.getElementById("modalAlumnoTitle");
  const hiddenAlumnoId = document.getElementById("modal_alumno_id");

  const step1 = document.getElementById("step-1-alumno");
  const step2 = document.getElementById("step-2-alumno");

  const btnNext = document.getElementById("btnNextAlumno");
  const btnPrev = document.getElementById("btnPrevAlumno");
  const btnGuardar = document.getElementById("btnGuardarAlumno");
  const wizardProgress = document.getElementById("wizardProgressAlumno");

  // Paso 1
  const modalNombre = document.getElementById("modal_nombre");
  const modalApellido = document.getElementById("modal_apellido");
  const modalTelefono = document.getElementById("modal_telefono");
  const modalGenero = document.getElementById("modal_genero");
  const modalDpi = document.getElementById("modal_dpi");
  const modalNit = document.getElementById("modal_nit");
  const modalFechaNacimiento = document.getElementById("modal_fecha_nacimiento");
  const modalCorreo = document.getElementById("modal_correo");
  const modalResidencia = document.getElementById("modal_residencia");

  // Paso 2
  const insertCodigoAlumno = document.getElementById("insert_codigo_alumno");
  const modalGradoAlumno = document.getElementById("modal_grado_alumno");
  const modalSeccionAlumno = document.getElementById("modal_seccion_alumno");

  // Buscar encargado
  const buscarNombreEncargado = document.getElementById("buscar_nombre_encargado");
  const buscarDpiEncargado = document.getElementById("buscar_dpi_encargado");
  const btnBuscarEncargadoAlumno = document.getElementById("btnBuscarEncargadoAlumno");
  const tableBodyModalEncargado = document.getElementById("tableBodyModalEncargado");

  let currentStep = 1;
  let modoAlumno = "crear"; // crear | editar

  // Guardar el encargado seleccionado
  let encargadoSeleccionado = null;

  // Año
  let ANIO = new Date().getFullYear();
  try {
    const raw = sessionStorage.getItem("userData");
    const ud = raw ? JSON.parse(raw) : null;
    if (ud?.maestro_anio_actual) ANIO = Number(ud.maestro_anio_actual);
  } catch (_) {}

  // =========================================================
  // HELPERS
  // =========================================================
  const toInt = (x, def = 0) => {
    const n = parseInt(x, 10);
    return Number.isFinite(n) ? n : def;
  };

  const safeText = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[c]));

  function setMessageRow(msg) {
    if (!tbody) return;
    tbody.innerHTML = `
      <tr>
        <td colspan="999" class="text-center text-muted py-3">${safeText(msg)}</td>
      </tr>
    `;
  }

  function setMessageRowEncargado(msg, className = "text-muted") {
    if (!tableBodyModalEncargado) return;
    tableBodyModalEncargado.innerHTML = `
      <tr>
        <td colspan="3" class="text-center py-3 ${className}">${safeText(msg)}</td>
      </tr>
    `;
  }

  function maestrosToBullets(str) {
    const raw = String(str ?? "").trim();
    if (!raw) return '<span class="text-muted">—</span>';

    const parts = raw
      .split("|")
      .map(x => x.trim())
      .filter(Boolean);

    if (!parts.length) return '<span class="text-muted">—</span>';

    return `
      <ul class="mb-0 ps-3">
        ${parts.map(m => `<li>${safeText(m)}</li>`).join("")}
      </ul>
    `;
  }

  function normalizarFechaParaInput(fecha) {
    if (!fecha) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha;

    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return "";

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function limpiarModalAlumno() {
    formAlumno?.reset();

    if (hiddenAlumnoId) hiddenAlumnoId.value = "";

    encargadoSeleccionado = null;

    if (modalAlumnoTitle) modalAlumnoTitle.textContent = "Registrar Alumno";

    setMessageRowEncargado("Use los filtros y presione Buscar");
  }

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

  function obtenerNombreApellidoDesdeTexto(nombreCompleto) {
    const limpio = String(nombreCompleto || "").trim();
    if (!limpio) {
      return { nombre: "", apellido: "" };
    }

    const partes = limpio.split(/\s+/);
    if (partes.length === 1) {
      return { nombre: partes[0], apellido: "" };
    }

    return {
      nombre: partes[0],
      apellido: partes.slice(1).join(" ")
    };
  }

  // =========================================================
  // API
  // =========================================================
  async function postJSON(url, payload) {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload)
    });

    const json = await r.json().catch(() => ({}));

    if (!r.ok) {
      const msg =
        json?.error ||
        (Array.isArray(json?.errors) ? json.errors.map(x => x.msg).join("\n") : null) ||
        `${url} HTTP ${r.status}`;
      throw new Error(msg);
    }

    return json;
  }

  async function putJSON(url, payload) {
    const r = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload)
    });

    const json = await r.json().catch(() => ({}));

    if (!r.ok) {
      const msg =
        json?.error ||
        (Array.isArray(json?.errors) ? json.errors.map(x => x.msg).join("\n") : null) ||
        `${url} HTTP ${r.status}`;
      throw new Error(msg);
    }

    return json;
  }

  async function buscarAlumnos(payload) {
    const json = await postJSON("http://localhost:8001/alumno/Buscar", payload);
    return Array.isArray(json.data) ? json.data : [];
  }

  async function buscarEncargadosModal(payload) {
    const json = await postJSON("http://localhost:8001/encargado/BuscarEncargado", payload);
    return Array.isArray(json.data) ? json.data : [];
  }

  // =========================================================
  // BUSQUEDA LISTADO PRINCIPAL
  // =========================================================
  function buildPayload() {
    const grado_id = toInt(selGrado?.value, 0);
    const seccion_id = toInt(selSeccion?.value, 0);

    const payload = { anio: ANIO, grado_id, seccion_id };

    const nombre_alumno = (inpNombre?.value || "").trim();
    const nombre_maestro = (inpMaestro?.value || "").trim();
    const codigo_alumno = (inpCodigo?.value || "").trim();
    const dpi_alumno = (inpDpi?.value || "").trim();

    if (nombre_alumno) payload.nombre_alumno = nombre_alumno;
    if (nombre_maestro) payload.nombre_maestro = nombre_maestro;
    if (codigo_alumno) payload.codigo_alumno = codigo_alumno;
    if (dpi_alumno) payload.dpi_alumno = dpi_alumno;

    return payload;
  }

  function renderRows(lista) {
    if (!tbody) return;

    if (!lista || !lista.length) {
      setMessageRow("No se encontraron resultados.");
      return;
    }

    tbody.innerHTML = lista.map((x, idx) => {
      const codigo = x.codigo_alumno ?? "—";
      const dpi = x.dpi_alumno ?? x.dpi ?? "—";
      const nombre = `${x.alumno_nombre ?? x.nombre ?? ""} ${x.alumno_apellido ?? x.apellido ?? ""}`.trim() || "—";
      const tel = x.alumno_telefono ?? x.telefono ?? "—";
      const estado = x.estado_alumno ?? "—";

      return `
        <tr
          data-alumno-id="${safeText(x.alumno_id)}"
          data-codigo="${safeText(x.codigo_alumno ?? "")}"
          data-nombre="${safeText(x.alumno_nombre ?? x.nombre ?? "")}"
          data-apellido="${safeText(x.alumno_apellido ?? x.apellido ?? "")}"
          data-telefono="${safeText(x.alumno_telefono ?? x.telefono ?? "")}"
          data-correo="${safeText(x.alumno_correo ?? x.correo ?? "")}"
          data-residencia="${safeText(x.alumno_residencia ?? x.residencia ?? "")}"
          data-genero="${safeText(x.alumno_genero_id ?? x.genero_id ?? "")}"
          data-dpi="${safeText(x.dpi_alumno ?? x.dpi ?? "")}"
          data-fecha_nacimiento="${safeText(x.alumno_fecha_nacimiento ?? x.fecha_nacimiento ?? "")}"
          data-nit="${safeText(x.alumno_nit ?? x.nit ?? "")}"
          data-estado_alumno_id="${safeText(x.estado_alumno_id ?? 1)}"
          data-estado_alumno_reg="${safeText(x.estado_alumno_reg ?? 1)}"
          data-enc_nombre="${safeText(x.enc_nombre ?? "")}"
          data-enc_apellido="${safeText(x.enc_apellido ?? "")}"
          data-grado_id="${safeText(x.grado_id ?? "")}"
          data-seccion_id="${safeText(x.seccion_id ?? "")}"
        >
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
    }).join("");
  }

  async function onBuscar(e) {
    e?.preventDefault();

    const grado_id = toInt(selGrado?.value, 0);
    const seccion_id = toInt(selSeccion?.value, 0);

    if (!grado_id || !seccion_id) {
      setMessageRow("Seleccione grado y sección.");
      return;
    }

    setMessageRow("Buscando...");

    try {
      const payload = buildPayload();
      const data = await buscarAlumnos(payload);
      renderRows(data);
    } catch (err) {
      console.error("Error buscar alumnos:", err);
      setMessageRow("Datos no disponibles.");
    }
  }

  // =========================================================
  // MODAL - BUSCAR ENCARGADOS
  // =========================================================
  function construirPayloadBuscarEncargadoModal() {
    const payload = {};

    const nombre = buscarNombreEncargado?.value.trim();
    const dpi = buscarDpiEncargado?.value.trim();

    if (nombre) payload.nombre_encargado = nombre;
    if (dpi) payload.dpi_encargado = dpi;

    return payload;
  }

  function renderTablaEncargadosModal(lista) {
    if (!tableBodyModalEncargado) return;

    if (!Array.isArray(lista) || lista.length === 0) {
      setMessageRowEncargado("No se encontraron encargados");
      return;
    }

    let html = "";
    let i = 1;

    lista.forEach(enc => {
      const nombre = `${enc.nombre || ""} ${enc.apellido || ""}`.trim();
      const checked =
        encargadoSeleccionado &&
        encargadoSeleccionado.nombre === (enc.nombre || "") &&
        encargadoSeleccionado.apellido === (enc.apellido || "")
          ? "checked"
          : "";

      html += `
        <tr>
          <td class="text-center">${i++}</td>
          <td>
            <div class="fw-semibold">${safeText(nombre)}</div>
            <small class="text-muted">DPI: ${safeText(enc.dpi || "—")}</small>
          </td>
          <td class="text-center">
            <input
              type="radio"
              name="encargado_seleccionado"
              class="form-check-input encargado-check"
              data-nombre="${safeText(enc.nombre || "")}"
              data-apellido="${safeText(enc.apellido || "")}"
              value="${safeText(enc.dpi || "")}"
              ${checked}
            >
          </td>
        </tr>
      `;
    });

    tableBodyModalEncargado.innerHTML = html;

    tableBodyModalEncargado.querySelectorAll(".encargado-check").forEach(radio => {
      radio.addEventListener("change", () => {
        encargadoSeleccionado = {
          dpi: radio.value || "",
          nombre: radio.dataset.nombre || "",
          apellido: radio.dataset.apellido || ""
        };
      });
    });
  }

  async function onBuscarEncargadoModal() {
    setMessageRowEncargado("Buscando encargados...");

    try {
      const payload = construirPayloadBuscarEncargadoModal();
      const data = await buscarEncargadosModal(payload);
      renderTablaEncargadosModal(data);
    } catch (error) {
      console.error("Error buscando encargados:", error);
      setMessageRowEncargado("Error al buscar encargados", "text-danger");
    }
  }

  // =========================================================
  // VALIDACION / PAYLOAD CREATE-UPDATE
  // =========================================================
  function validarPaso1() {
    const nombre = modalNombre?.value.trim() || "";
    const apellido = modalApellido?.value.trim() || "";
    const telefono = modalTelefono?.value.trim() || "";
    const dpi = modalDpi?.value.trim() || "";
    const nit = modalNit?.value.trim() || "";
    const fecha = modalFechaNacimiento?.value || "";
    const correo = modalCorreo?.value.trim() || "";
    const residencia = modalResidencia?.value.trim() || "";

    if (!nombre || !apellido) {
      alert("Debe completar nombre y apellido");
      return false;
    }

    if (!telefono || !dpi || !nit || !fecha || !correo || !residencia) {
      alert("Debe completar todos los campos obligatorios del alumno");
      return false;
    }

    return true;
  }

  function validarPaso2() {
    const codigoAlumno = insertCodigoAlumno?.value.trim() || "";
    const gradoId = modalGradoAlumno?.value || "";
    const seccionId = modalSeccionAlumno?.value || "";

    if (!codigoAlumno) {
      alert("Debe ingresar el código de alumno");
      return false;
    }

    if (!gradoId || !seccionId) {
      alert("Debe seleccionar grado y sección");
      return false;
    }

    if (!encargadoSeleccionado || !encargadoSeleccionado.nombre || !encargadoSeleccionado.apellido) {
      alert("Debe seleccionar un encargado");
      return false;
    }

    return true;
  }

  function construirPayloadCrearAlumno() {
    return {
      alumno_nombre: modalNombre?.value.trim() || "",
      alumno_apellido: modalApellido?.value.trim() || "",
      alumno_correo: modalCorreo?.value.trim() || "",
      alumno_telefono: modalTelefono?.value.trim() || "",
      alumno_residencia: modalResidencia?.value.trim() || "",
      alumno_genero_id: modalGenero?.value || null,
      alumno_dpi: modalDpi?.value.trim() || "",
      alumno_fecha_nacimiento: modalFechaNacimiento?.value || "",
      alumno_nit: modalNit?.value.trim() || "",
      codigo_alumno: insertCodigoAlumno?.value.trim() || "",
      estado_alumno_id: 1,
      enc_nombre: encargadoSeleccionado?.nombre || "",
      enc_apellido: encargadoSeleccionado?.apellido || "",
      crear_matricula: 1,
      grado_id: toInt(modalGradoAlumno?.value, 0),
      seccion_id: toInt(modalSeccionAlumno?.value, 0)
    };
  }

  function construirPayloadActualizarAlumno() {
    const codigoBusqueda = hiddenAlumnoId?.value.trim() || "";
    const estadoAlumnoIdDesdeFila = Number(hiddenAlumnoId?.dataset.estadoAlumnoId || 1);
    const estadoAlumnoRegDesdeFila = Number(hiddenAlumnoId?.dataset.estadoAlumnoReg || 1);

    return {
      codigo_alumno_busqueda: codigoBusqueda,
      alumno_nombre: modalNombre?.value.trim() || "",
      alumno_apellido: modalApellido?.value.trim() || "",
      alumno_correo: modalCorreo?.value.trim() || "",
      alumno_telefono: modalTelefono?.value.trim() || "",
      alumno_residencia: modalResidencia?.value.trim() || "",
      alumno_genero_id: modalGenero?.value || null,
      alumno_dpi_nuevo: modalDpi?.value.trim() || "",
      alumno_fecha_nacimiento: modalFechaNacimiento?.value || "",
      alumno_nit: modalNit?.value.trim() || "",
      codigo_alumno_nuevo: insertCodigoAlumno?.value.trim() || "",
      estado_alumno_id: estadoAlumnoIdDesdeFila,
      estado_alumno_reg: estadoAlumnoRegDesdeFila,
      enc_nombre: encargadoSeleccionado?.nombre || "",
      enc_apellido: encargadoSeleccionado?.apellido || "",
      crear_matricula: 1,
      grado_id: toInt(modalGradoAlumno?.value, 0),
      seccion_id: toInt(modalSeccionAlumno?.value, 0)
    };
  }

  async function guardarAlumno() {
    if (!validarPaso1()) {
      currentStep = 1;
      actualizarWizard();
      return;
    }

    if (!validarPaso2()) {
      currentStep = 2;
      actualizarWizard();
      return;
    }

    try {
      let result;

      if (modoAlumno === "crear") {
        const payload = construirPayloadCrearAlumno();
        result = await postJSON("http://localhost:8001/alumno/CrearAlumno", payload);
      } else {
        const payload = construirPayloadActualizarAlumno();
        result = await putJSON("http://localhost:8001/alumno/ActualizarAlumno", payload);
      }

      alert(result?.message || "Operación realizada correctamente");
      modalAlumno?.hide();
      await onBuscar(new Event("submit"));
    } catch (error) {
      console.error("Error al guardar alumno:", error);
      alert(error.message || "Error al guardar alumno");
    }
  }

  // =========================================================
  // ABRIR MODAL CREAR / EDITAR
  // =========================================================
  function abrirModalCrear() {
    modoAlumno = "crear";
    currentStep = 1;
    limpiarModalAlumno();
    actualizarWizard();
    modalAlumno?.show();
  }

  function abrirModalEditarDesdeFila(tr) {
    modoAlumno = "editar";
    currentStep = 1;
    limpiarModalAlumno();

    if (modalAlumnoTitle) modalAlumnoTitle.textContent = "Actualizar Alumno";

    const codigoBusqueda = tr.dataset.codigo || "";
    if (hiddenAlumnoId) {
      hiddenAlumnoId.value = codigoBusqueda;
      hiddenAlumnoId.dataset.estadoAlumnoId = tr.dataset.estado_alumno_id || "1";
      hiddenAlumnoId.dataset.estadoAlumnoReg = tr.dataset.estado_alumno_reg || "1";
    }

    if (modalNombre) modalNombre.value = tr.dataset.nombre || "";
    if (modalApellido) modalApellido.value = tr.dataset.apellido || "";
    if (modalTelefono) modalTelefono.value = tr.dataset.telefono || "";
    if (modalCorreo) modalCorreo.value = tr.dataset.correo || "";
    if (modalResidencia) modalResidencia.value = tr.dataset.residencia || "";
    if (modalGenero) modalGenero.value = tr.dataset.genero || "";
    if (modalDpi) modalDpi.value = tr.dataset.dpi || "";
    if (modalFechaNacimiento) modalFechaNacimiento.value = normalizarFechaParaInput(tr.dataset.fecha_nacimiento || "");
    if (modalNit) modalNit.value = tr.dataset.nit || "";

    if (insertCodigoAlumno) insertCodigoAlumno.value = tr.dataset.codigo || "";
    if (modalGradoAlumno) modalGradoAlumno.value = tr.dataset.grado_id || "";
    if (modalSeccionAlumno) modalSeccionAlumno.value = tr.dataset.seccion_id || "";

    encargadoSeleccionado = {
      nombre: tr.dataset.enc_nombre || "",
      apellido: tr.dataset.enc_apellido || ""
    };

    if (encargadoSeleccionado.nombre || encargadoSeleccionado.apellido) {
      setMessageRowEncargado(`Encargado actual: ${encargadoSeleccionado.nombre} ${encargadoSeleccionado.apellido}`);
    } else {
      setMessageRowEncargado("Busque y seleccione un encargado");
    }

    actualizarWizard();
    modalAlumno?.show();
  }

  // =========================================================
  // EVENTOS
  // =========================================================
  tbody?.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-editar");
    if (!btn) return;

    const tr = btn.closest("tr");
    if (!tr) return;

    abrirModalEditarDesdeFila(tr);
  });

  btnBuscar?.addEventListener("click", onBuscar);

  [inpCodigo, inpNombre, inpDpi, inpMaestro].forEach(inp => {
    inp?.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") onBuscar(ev);
    });
  });

  btnCrearAlumno?.addEventListener("click", abrirModalCrear);

  btnNext?.addEventListener("click", () => {
    if (!validarPaso1()) return;
    currentStep = 2;
    actualizarWizard();
  });

  btnPrev?.addEventListener("click", () => {
    currentStep = 1;
    actualizarWizard();
  });

  btnBuscarEncargadoAlumno?.addEventListener("click", onBuscarEncargadoModal);

  btnGuardar?.addEventListener("click", guardarAlumno);

  modalAlumnoEl?.addEventListener("hidden.bs.modal", () => {
    limpiarModalAlumno();
    modoAlumno = "crear";
    currentStep = 1;
    actualizarWizard();
  });

  // =========================================================
  // INICIALIZACION
  // =========================================================
  document.addEventListener("DOMContentLoaded", () => {
    setMessageRow("Seleccione filtros y presione Buscar.");
    actualizarWizard();
  });

  setMessageRow("Seleccione filtros y presione Buscar.");
  actualizarWizard();
})();