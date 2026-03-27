document.addEventListener("DOMContentLoaded", async () => {
  // =========================
  // ELEMENTOS PRINCIPALES
  // =========================
  const btnBuscar = document.getElementById("search-btn");
  const tableBody = document.getElementById("tableBodyActivities");
  const modalEncargadoEl = document.getElementById("modalEncargado");
  const modalEncargado = modalEncargadoEl ? new bootstrap.Modal(modalEncargadoEl) : null;

  const btnCrearEnc = document.getElementById("create-btn");

  // Wizard
  const step1Enc = document.getElementById("step-1-enc");
  const step2Enc = document.getElementById("step-2-enc");
  const btnNextEnc = document.getElementById("btnNextEnc");
  const btnPrevEnc = document.getElementById("btnPrevEnc");
  const btnGuardarEnc = document.getElementById("btnGuardarEnc");
  const wizardProgressEnc = document.getElementById("wizardProgressEnc");

  // Modal - búsqueda alumnos
  const btnBuscarEncAlumno = document.getElementById("btnBuscarEncargadoAlumno");
  const tableBodyModalAlumnos = document.getElementById("tableBodyModalAlumnos");

  const buscarNombreAlumno = document.getElementById("buscar_nombre_alumno");
  const buscarDpiAlumno = document.getElementById("buscar_dpi_alumno");
  const modalGradoAlumnoBusqueda = document.getElementById("modal_grado_alumno_busqueda");
  const modalSeccionAlumnoBusqueda = document.getElementById("modal_seccion_alumno_busqueda");

  // Filtros principales de la página
  const comboGrado = document.getElementById("combo_grado_direc");
  const comboSeccion = document.getElementById("combo_seccion_direc");

  let currentStepEnc = 1;
  let modoEncargado = "crear"; // crear | editar

  // =========================
  // UTILIDADES
  // =========================
  function seleccionarPorTexto(selectEl, texto) {
    if (!selectEl) return false;

    const target = (texto || "").trim().toLowerCase();

    for (let i = 0; i < selectEl.options.length; i++) {
      const opt = selectEl.options[i];
      const optText = (opt.textContent || "").trim().toLowerCase();

      if (optText === target) {
        selectEl.selectedIndex = i;
        return true;
      }
    }

    return false;
  }

  async function cargarOpcionesSelect(url, selectEl, valueKey, textKey, selectedText = null) {
    if (!selectEl) return [];

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status} al consultar ${url}`);
      }

      const json = await response.json();
      const items = Array.isArray(json.data) ? json.data : [];

      while (selectEl.options.length > 1) {
        selectEl.remove(1);
      }

      items.forEach(item => {
        if (item.estado === true || item.estado === 1 || item.estado === undefined) {
          const option = document.createElement("option");
          option.value = item[valueKey];
          option.textContent = item[textKey];
          selectEl.appendChild(option);
        }
      });

      if (selectedText) {
        seleccionarPorTexto(selectEl, selectedText);
      }

      return items;
    } catch (error) {
      console.error(`Error al cargar select desde ${url}:`, error);
      return [];
    }
  }

  async function cargarCombosModalAlumno() {
    await cargarOpcionesSelect(
      "http://localhost:8001/grado",
      modalGradoAlumnoBusqueda,
      "grado_id",
      "grado_des"
    );

    await cargarOpcionesSelect(
      "http://localhost:8001/seccion",
      modalSeccionAlumnoBusqueda,
      "seccion_id",
      "seccion_des"
    );
  }

  function mostrarMensajeTablaModal(mensaje, clase = "text-muted") {
    if (!tableBodyModalAlumnos) return;

    tableBodyModalAlumnos.innerHTML = `
      <tr>
        <td colspan="3" class="text-center ${clase}">
          ${mensaje}
        </td>
      </tr>
    `;
  }

  function limpiarModalEncargado() {
    const form = document.getElementById("formEncargado");
    if (form) form.reset();

    const hiddenId = document.getElementById("modal_encargado_id");
    if (hiddenId) hiddenId.value = "";

    if (buscarNombreAlumno) buscarNombreAlumno.value = "";
    if (buscarDpiAlumno) buscarDpiAlumno.value = "";

    if (modalGradoAlumnoBusqueda) modalGradoAlumnoBusqueda.selectedIndex = 0;
    if (modalSeccionAlumnoBusqueda) modalSeccionAlumnoBusqueda.selectedIndex = 0;

    mostrarMensajeTablaModal("Use los filtros y presione Buscar");
  }

  function actualizarWizardEnc() {
    if (!step1Enc || !step2Enc || !btnPrevEnc || !btnNextEnc || !btnGuardarEnc || !wizardProgressEnc) {
      return;
    }

    if (currentStepEnc === 1) {
      step1Enc.classList.remove("d-none");
      step2Enc.classList.add("d-none");

      btnPrevEnc.disabled = true;
      btnNextEnc.classList.remove("d-none");
      btnGuardarEnc.classList.add("d-none");

      wizardProgressEnc.style.width = "50%";
      return;
    }

    if (currentStepEnc === 2) {
      step1Enc.classList.add("d-none");
      step2Enc.classList.remove("d-none");

      btnPrevEnc.disabled = false;
      btnNextEnc.classList.add("d-none");
      btnGuardarEnc.classList.remove("d-none");

      wizardProgressEnc.style.width = "100%";

      if (modoEncargado === "editar") {
        btnGuardarEnc.textContent = "Actualizar";
        btnGuardarEnc.className = "btn btn-warning";
      } else {
        btnGuardarEnc.textContent = "Guardar";
        btnGuardarEnc.className = "btn btn-success";
      }
    }
  }

  function construirPayloadBuscarAlumnoModal() {
    const payload = {
      codigo_alumno: null,
      nombre: null,
      grado_id: null,
      seccion_id: null,
      dpi: null
    };

    const nombre = buscarNombreAlumno?.value.trim();
    const dpi = buscarDpiAlumno?.value.trim();
    const grado = modalGradoAlumnoBusqueda?.value;
    const seccion = modalSeccionAlumnoBusqueda?.value;

    if (nombre) payload.nombre = nombre;
    if (dpi) payload.dpi = dpi;
    if (grado) payload.grado_id = parseInt(grado, 10);
    if (seccion) payload.seccion_id = parseInt(seccion, 10);

    return payload;
  }

  function renderTablaAlumnosModal(alumnos, alumnosSeleccionados = []) {
    if (!tableBodyModalAlumnos) return;

    if (!Array.isArray(alumnos) || alumnos.length === 0) {
      tableBodyModalAlumnos.innerHTML = `
        <tr>
          <td colspan="3" class="text-center text-muted">
            No se encontraron alumnos
          </td>
        </tr>
      `;
      return;
    }

    const seleccionadosSet = new Set(alumnosSeleccionados.map(id => Number(id)));
    let html = "";
    let contador = 1;

    alumnos.forEach(alumno => {
      const alumnoId = alumno.alumno_id ?? "";
      const nombreCompleto = alumno.nombre_completo || "";
      const grado = alumno.grado_des || "";
      const seccion = alumno.seccion_des || "";
      const estadoAlumno = alumno.estado_alumno || "";
      const checked = seleccionadosSet.has(Number(alumnoId)) ? "checked" : "";

      html += `
        <tr>
          <td class="text-center">${contador++}</td>
          <td>
            <div class="fw-semibold">${nombreCompleto}</div>
            <small class="text-muted">
              ${grado} ${seccion} | Estado: ${estadoAlumno}
            </small>
          </td>
          <td class="text-center">
            <input
              type="checkbox"
              class="form-check-input alumno-check"
              value="${alumnoId}"
              ${checked}
            >
          </td>
        </tr>
      `;
    });

    tableBodyModalAlumnos.innerHTML = html;
  }

  function obtenerAlumnosSeleccionados() {
    return [...document.querySelectorAll(".alumno-check:checked")]
      .map(check => parseInt(check.value, 10))
      .filter(id => !Number.isNaN(id));
  }

  async function buscarAlumnosModal() {
    if (!tableBodyModalAlumnos) return;

    mostrarMensajeTablaModal("Buscando alumnos...");

    const payload = construirPayloadBuscarAlumnoModal();

    try {
      const response = await fetch("http://localhost:8001/alumno/BuscarAlumnos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status} al consultar alumnos`);
      }

      const result = await response.json();
      renderTablaAlumnosModal(result?.data || []);
    } catch (error) {
      console.error("Error en buscarAlumnosModal:", error);
      mostrarMensajeTablaModal("Error al cargar alumnos", "text-danger");
    }
  }

  function construirPayloadBusquedaEncargado() {
    const payload = {};

    const dpi = document.getElementById("DPI_enc")?.value.trim();
    const telefono = document.getElementById("telefono")?.value.trim();
    const nombreEnc = document.getElementById("nombre_encargado")?.value.trim();
    const codigoAlumno = document.getElementById("Cod_estudiante")?.value.trim();
    const nombreAlumno = document.getElementById("nombre_estudiante")?.value.trim();
    const gradoId = comboGrado?.value;
    const seccionId = comboSeccion?.value;

    if (dpi) payload.dpi_encargado = dpi;
    if (nombreEnc) payload.nombre_encargado = nombreEnc;
    if (telefono) payload.telefono_encargado = telefono;
    if (codigoAlumno) payload.codigo_alumno = codigoAlumno;
    if (nombreAlumno) payload.nombre_alumno = nombreAlumno;
    if (gradoId) payload.grado_id = parseInt(gradoId, 10);
    if (seccionId) payload.seccion_id = parseInt(seccionId, 10);

    return payload;
  }

  function renderAlumnos(alumnos) {
    if (!Array.isArray(alumnos) || alumnos.length === 0) {
      return "<em>Sin alumnos asignados</em>";
    }

    let html = "<ul style='padding-left:18px; margin-bottom:0;'>";

    alumnos.forEach(al => {
      html += `
        <li>
          ${al.nombre || ""} ${al.apellido || ""}
          <small class="text-muted">(${al.grado || ""} ${al.seccion || ""})</small>
        </li>
      `;
    });

    html += "</ul>";
    return html;
  }

  function renderTabla(encargados) {
    if (!tableBody) return;

    if (!Array.isArray(encargados) || encargados.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">
            No se encontraron registros
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = "";
    let contador = 1;

    encargados.forEach(enc => {
      const alumnosHTML = renderAlumnos(enc.alumnos);

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${contador++}</td>
        <td>${enc.dpi || ""}</td>
        <td>${enc.nombre || ""} ${enc.apellido || ""}</td>
        <td>${enc.telefono || ""}</td>
        <td>${enc.residencia || ""}</td>
        <td>${alumnosHTML}</td>
        <td>
          <button 
            type="button" 
            class="btn btn-sm btn-info btn-editar-encargado"
            data-dpi="${enc.dpi || ""}"
            data-nombre="${enc.nombre || ""}"
            data-apellido="${enc.apellido || ""}"
            data-telefono="${enc.telefono || ""}"
            data-residencia="${enc.residencia || ""}"
            data-correo="${enc.correo || ""}"
            data-genero="${enc.genero_id || enc.genero || ""}"
            data-fecha_nacimiento="${enc.fecha_nacimiento || ""}"
            data-nit="${enc.nit || ""}"
          >
            Ver
          </button>
        </td>
      `;

      tableBody.appendChild(row);
    });

    asociarEventosEditar();
  }

  async function buscarEncargados() {
    if (!tableBody) return;

    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted">
          Cargando información...
        </td>
      </tr>
    `;

    const payload = construirPayloadBusquedaEncargado();

    try {
      const response = await fetch("http://localhost:8001/encargado/BuscarEncargado", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status} al consultar encargados`);
      }

      const result = await response.json();
      renderTabla(result?.data || []);
    } catch (error) {
      console.error("Error en buscarEncargados:", error);
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-danger">
            Error al cargar la información
          </td>
        </tr>
      `;
    }
  }

  function normalizarFechaParaInput(fecha) {
    if (!fecha) return "";

    if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return fecha;
    }

    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function normalizarGeneroParaBackend(genero) {
    const valor = (genero || "").trim().toUpperCase();

    if (valor === "M" || valor === "F") return valor;
    if (valor === "MASCULINO") return "M";
    if (valor === "FEMENINO") return "F";

    return "";
  }

  function cargarDatosModalEditarDesdeBoton(btn) {
    modoEncargado = "editar";
    currentStepEnc = 1;

    const title = document.getElementById("modalEncargadoTitle");
    if (title) title.textContent = "Actualizar Encargado";

    limpiarModalEncargado();

    const dpiOriginal = btn.getAttribute("data-dpi") || "";
    const nombre = btn.getAttribute("data-nombre") || "";
    const apellido = btn.getAttribute("data-apellido") || "";
    const telefono = btn.getAttribute("data-telefono") || "";
    const residencia = btn.getAttribute("data-residencia") || "";
    const correo = btn.getAttribute("data-correo") || "";
    const genero = btn.getAttribute("data-genero") || "";
    const fechaNacimiento = btn.getAttribute("data-fecha_nacimiento") || "";
    const nit = btn.getAttribute("data-nit") || "";

    const hiddenId = document.getElementById("modal_encargado_id");
    if (hiddenId) hiddenId.value = dpiOriginal;

    document.getElementById("modal_nombre").value = nombre;
    document.getElementById("modal_apellido").value = apellido;
    document.getElementById("modal_telefono").value = telefono;
    document.getElementById("modal_residencia").value = residencia;
    document.getElementById("modal_correo").value = correo;
    document.getElementById("modal_dpi").value = dpiOriginal;
    document.getElementById("modal_nit").value = nit;
    document.getElementById("modal_fecha_nacimiento").value = normalizarFechaParaInput(fechaNacimiento);
    document.getElementById("modal_genero").value = normalizarGeneroParaBackend(genero);

    actualizarWizardEnc();
    modalEncargado?.show();
  }

  function asociarEventosEditar() {
    const botonesEditar = document.querySelectorAll(".btn-editar-encargado");

    botonesEditar.forEach(btn => {
      btn.addEventListener("click", async () => {
        await cargarCombosModalAlumno();
        cargarDatosModalEditarDesdeBoton(btn);
      });
    });
  }

  async function guardarEncargado() {
    const alumnosSeleccionados = obtenerAlumnosSeleccionados();

    const nombre = document.getElementById("modal_nombre")?.value.trim() || "";
    const apellido = document.getElementById("modal_apellido")?.value.trim() || "";
    const telefono = document.getElementById("modal_telefono")?.value.trim() || "";
    const genero_id = document.getElementById("modal_genero")?.value || null;
    const dpi = document.getElementById("modal_dpi")?.value.trim() || "";
    const nit = document.getElementById("modal_nit")?.value.trim() || "";
    const fecha_nacimiento = document.getElementById("modal_fecha_nacimiento")?.value || "";
    const correo = document.getElementById("modal_correo")?.value.trim() || "";
    const residencia = document.getElementById("modal_residencia")?.value.trim() || "";

    if (!nombre || !apellido) {
      alert("Debe completar nombre y apellido");
      currentStepEnc = 1;
      actualizarWizardEnc();
      return;
    }

    if (!correo || !telefono || !residencia || !dpi || !fecha_nacimiento || !nit) {
      alert("Debe completar todos los campos obligatorios");
      currentStepEnc = 1;
      actualizarWizardEnc();
      return;
    }

    if (alumnosSeleccionados.length === 0) {
      alert("Debe seleccionar al menos un alumno");
      currentStepEnc = 2;
      actualizarWizardEnc();
      return;
    }

    try {
      let response;
      let payload;

      if (modoEncargado === "crear") {
        payload = {
          nombre,
          apellido,
          correo,
          telefono,
          residencia,
          genero_id: genero_id || null,
          dpi,
          fecha_nacimiento,
          nit,
          estado_encargado: 1,
          alumnos: alumnosSeleccionados
        };

        response = await fetch("http://localhost:8001/encargado/CrearEncargado", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify(payload)
        });
      } else {
        const dpiBusqueda = document.getElementById("modal_encargado_id")?.value.trim() || "";

        if (!dpiBusqueda) {
          alert("No se encontró el DPI original del encargado para actualizar");
          return;
        }

        payload = {
          dpi_busqueda: dpiBusqueda,
          nombre,
          apellido,
          correo,
          telefono,
          residencia,
          genero_id: genero_id || null,
          dpi_nuevo: dpi,
          fecha_nacimiento,
          nit,
          estado_encargado: 1,
          alumnos: alumnosSeleccionados
        };

        response = await fetch("http://localhost:8001/encargado/ActualizarEncargado", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify(payload)
        });
      }

      const result = await response.json();

      if (!response.ok) {
        let mensaje = `Error HTTP ${response.status}`;

        if (result?.error) {
          mensaje = result.error;
        } else if (Array.isArray(result?.errors) && result.errors.length > 0) {
          mensaje = result.errors.map(err => err.msg).join("\n");
        }

        throw new Error(mensaje);
      }

      alert(result?.message || "Operación realizada correctamente");
      modalEncargado?.hide();
      await buscarEncargados();
    } catch (error) {
      console.error("Error en guardarEncargado:", error);
      alert(error.message || "Error al guardar el encargado");
    }
  }

  // =========================
  // EVENTOS
  // =========================
  btnBuscar?.addEventListener("click", async (e) => {
    e.preventDefault();
    await buscarEncargados();
  });

  btnCrearEnc?.addEventListener("click", async () => {
    modoEncargado = "crear";
    currentStepEnc = 1;

    const title = document.getElementById("modalEncargadoTitle");
    if (title) title.textContent = "Registrar Encargado";

    limpiarModalEncargado();
    actualizarWizardEnc();

    await cargarCombosModalAlumno();
    modalEncargado?.show();
  });

  btnNextEnc?.addEventListener("click", () => {
    const nombre = document.getElementById("modal_nombre")?.value.trim() || "";
    const apellido = document.getElementById("modal_apellido")?.value.trim() || "";
    const correo = document.getElementById("modal_correo")?.value.trim() || "";
    const telefono = document.getElementById("modal_telefono")?.value.trim() || "";
    const dpi = document.getElementById("modal_dpi")?.value.trim() || "";
    const fechaNacimiento = document.getElementById("modal_fecha_nacimiento")?.value || "";
    const nit = document.getElementById("modal_nit")?.value.trim() || "";
    const residencia = document.getElementById("modal_residencia")?.value.trim() || "";

    if (!nombre || !apellido) {
      alert("Debe completar nombre y apellido");
      return;
    }

    if (!correo || !telefono || !dpi || !fechaNacimiento || !nit || !residencia) {
      alert("Debe completar todos los campos obligatorios");
      return;
    }

    currentStepEnc = 2;
    actualizarWizardEnc();
  });

  btnPrevEnc?.addEventListener("click", () => {
    currentStepEnc = 1;
    actualizarWizardEnc();
  });

  btnBuscarEncAlumno?.addEventListener("click", async () => {
    await buscarAlumnosModal();
  });

  btnGuardarEnc?.addEventListener("click", async () => {
    await guardarEncargado();
  });

  modalEncargadoEl?.addEventListener("hidden.bs.modal", () => {
    limpiarModalEncargado();
    currentStepEnc = 1;
    modoEncargado = "crear";
    actualizarWizardEnc();

    const title = document.getElementById("modalEncargadoTitle");
    if (title) title.textContent = "Registrar Encargado";
  });

  // =========================
  // INICIALIZACIÓN
  // =========================
  actualizarWizardEnc();
});