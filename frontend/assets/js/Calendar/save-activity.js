document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("eventForm");
  const modalEl = document.getElementById("eventModal");
  const btnGuardar = document.getElementById("Boton-guardar-act");

  const inputNombre = document.getElementById("nombre_actividad");
  const inputPunteo = document.getElementById("punteo");
  const inputDescripcion = document.getElementById("descripcion");
  const inputFechaEntrega = document.getElementById("endDate");
  const selectMateria = document.getElementById("materia");
  const selectTipoTarea = document.getElementById("tipo_tarea");
  const selectUnidad = document.getElementById("Unidad");

  const modalInstance = modalEl ? bootstrap.Modal.getOrCreateInstance(modalEl) : null;

  toastr.options = {
    closeButton: false,
    debug: false,
    newestOnTop: false,
    progressBar: true,
    positionClass: "toast-top-right",
    preventDuplicates: false,
    onclick: null,
    showDuration: "300",
    hideDuration: "1000",
    timeOut: "5000",
    extendedTimeOut: "1000",
    showEasing: "swing",
    hideEasing: "linear",
    showMethod: "fadeIn",
    hideMethod: "fadeOut"
  };

  function toInt(value, fallback = null) {
    const n = parseInt(value, 10);
    return Number.isFinite(n) ? n : fallback;
  }

  function obtenerDatosSesion() {
    let userData = null;

    try {
      const raw = sessionStorage.getItem("userData");
      userData = raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error("No se pudo leer userData del sessionStorage:", error);
    }

    const gradoMap = {
      primero: 1,
      segundo: 2,
      tercero: 3,
      cuarto: 4,
      quinto: 5,
      sexto: 6,
      "1ro": 1,
      "2do": 2,
      "3ro": 3,
      "4to": 4,
      "5to": 5,
      "6to": 6,
      "1": 1,
      "2": 2,
      "3": 3,
      "4": 4,
      "5": 5,
      "6": 6
    };

    const seccionMap = {
      a: 1,
      b: 2,
      "1": 1,
      "2": 2
    };

    const usuario_id = toInt(
      userData?.usuario_id ??
      userData?.user_id ??
      userData?.id,
      null
    );

    let grado_id = toInt(
      userData?.grado_id ??
      userData?.grado_actual_id ??
      userData?.maestro_grado_id ??
      userData?.maestro_grado_actual_id,
      null
    );

    let seccion_id = toInt(
      userData?.seccion_id ??
      userData?.seccion_actual_id ??
      userData?.maestro_seccion_id ??
      userData?.maestro_seccion_actual_id,
      null
    );

    if (!grado_id) {
      const gradoTexto = String(
        userData?.maestro_grado_actual ??
        userData?.grado_actual ??
        userData?.grado ??
        ""
      ).trim().toLowerCase();

      grado_id = gradoMap[gradoTexto] ?? null;
    }

    if (!seccion_id) {
      const seccionTexto = String(
        userData?.maestro_seccion_actual ??
        userData?.seccion_actual ??
        userData?.seccion ??
        ""
      ).trim().toLowerCase();

      seccion_id = seccionMap[seccionTexto] ?? null;
    }

    return { usuario_id, grado_id, seccion_id };
  }

  function obtenerFechaActualLocal() {
    const hoy = new Date();

    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, "0");
    const day = String(hoy.getDate()).padStart(2, "0");

    const hours = String(hoy.getHours()).padStart(2, "0");
    const minutes = String(hoy.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  function validarFormulario() {
    const nombre = inputNombre?.value.trim();
    const puntaje = Number(inputPunteo?.value);
    const fechaEntrega = inputFechaEntrega?.value;
    const materiaId = selectMateria?.value;
    const tipoActividadId = selectTipoTarea?.value;
    const cicloId = selectUnidad?.value;

    const { usuario_id, grado_id, seccion_id } = obtenerDatosSesion();

    if (!usuario_id) {
      toastr.error("No se encontró el usuario_id en la sesión", "Datos incompletos");
      return false;
    }

    if (!grado_id || !seccion_id) {
      toastr.error("No se encontraron grado y sección en la sesión", "Datos incompletos");
      return false;
    }

    if (!nombre) {
      toastr.error("Debe ingresar el nombre de la actividad", "Campo requerido");
      inputNombre?.focus();
      return false;
    }

    if (!puntaje || puntaje <= 0) {
      toastr.error("El punteo debe ser mayor a 0", "Campo inválido");
      inputPunteo?.focus();
      return false;
    }

    if (!fechaEntrega) {
      toastr.error("Debe seleccionar la fecha de entrega", "Campo requerido");
      inputFechaEntrega?.focus();
      return false;
    }

    if (fechaEntrega < obtenerFechaActualLocal()) {
      toastr.error("No puede seleccionar una fecha anterior a la actual", "Fecha inválida");
      inputFechaEntrega?.focus();
      return false;
    }

    if (!materiaId) {
      toastr.error("Debe seleccionar la materia", "Campo requerido");
      selectMateria?.focus();
      return false;
    }

    if (!tipoActividadId) {
      toastr.error("Debe seleccionar el tipo de tarea", "Campo requerido");
      selectTipoTarea?.focus();
      return false;
    }

    if (!cicloId) {
      toastr.error("Debe seleccionar la unidad", "Campo requerido");
      selectUnidad?.focus();
      return false;
    }

    return true;
  }

  function construirPayload() {
    const { usuario_id, grado_id, seccion_id } = obtenerDatosSesion();

    return {
      usuario_id: usuario_id,
      grado_id: grado_id,
      seccion_id: seccion_id,
      materia_id: toInt(selectMateria?.value, 0),
      tipo_actividad_id: toInt(selectTipoTarea?.value, 0),
      ciclo_id: toInt(selectUnidad?.value, 0),
      nombre_actividad: inputNombre?.value.trim() || "",
      descripcion: inputDescripcion?.value.trim() || null,
      fecha_entrega: inputFechaEntrega?.value || "",
      puntaje_maximo: Number(inputPunteo?.value || 0),
      estado_actividad_id: 1,
      estado: 1,
      crear_para_alumnos: 1
    };
  }

  async function guardarActividad(event) {
    event.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    const payload = construirPayload();
    console.log("Payload actividad:", payload);

    try {
      btnGuardar.disabled = true;

      const response = await fetch("http://localhost:8001/actividad/CrearActividad", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const mensaje =
          result?.error ||
          (Array.isArray(result?.errors) ? result.errors.map(e => e.msg).join("\n") : null) ||
          `Error HTTP ${response.status}`;

        throw new Error(mensaje);
      }

      toastr.success(result?.message || "Actividad creada correctamente", "Éxito");

      form?.reset();
      modalInstance?.hide();

      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (error) {
      console.error("Error al guardar actividad:", error);
      toastr.error(error.message || "No se pudo guardar la actividad", "Error");
    } finally {
      btnGuardar.disabled = false;
    }
  }

  if (form) {
    form.addEventListener("submit", guardarActividad);
  }

  if (modalEl) {
    modalEl.addEventListener("show.bs.modal", function () {
      // No sobrescribir la fecha si ya fue colocada por el calendario
      if (!inputFechaEntrega?.value) {
        inputFechaEntrega.value = "";
      }
    });

    modalEl.addEventListener("hidden.bs.modal", function () {
      form?.reset();
      btnGuardar.disabled = false;
    });
  }
});