document.addEventListener("DOMContentLoaded", () => {
  cargarUsuario();
  configurarEventosPerfil();
  configurarEventosPassword();
});

function getUserDataSession() {
  try {
    return JSON.parse(sessionStorage.getItem("userData")) || null;
  } catch (e) {
    console.error("Error leyendo userData del sessionStorage");
    return null;
  }
}

async function cargarUsuario() {
  const userData = getUserDataSession();

  if (!userData || !userData.usuario_id) {
    console.error("userData no contiene usuario_id");
    return;
  }

  const idUsuario = userData.usuario_id;

  try {
    const response = await fetch("http://localhost:8001/usuario/BuscarIndividual", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        id_usuario: idUsuario
      })
    });

    if (!response.ok) {
      throw new Error("Error al consultar el usuario");
    }

    const result = await response.json();

    if (!result.data) {
      console.warn("No se recibió información del usuario");
      return;
    }

    const u = result.data;

    setValue("nombre", u.nombre_completo || "");
    setValue("correo", u.correo || "");
    setValue("telefono", u.telefono || "");
    setValue("residencia", u.residencia || "");
    setValue("fechaNacimiento", normalizarFechaInput(u.fecha_nacimiento));

    if (u.genero_id === "M") {
      setSelect("genero", "masculino");
    } else if (u.genero_id === "F") {
      setSelect("genero", "femenino");
    }

    setValue("dpi", u.dpi || "");
    setValue("nit", u.nit || "");

    setValue("codigoEmpleado", u.codigo_empleado || "");
    setValue("cedulaDocente", u.cedula_docente || "");
    setValue("fechaInicio", normalizarFechaInput(u.fecha_inicio_labores));
    setValue("escalafon", u.escalafon_descripcion || "");
    setValue("renglon", u.renglon_descripcion || "");
    setValue("codigoInstitucional", u.codigo_institucional || "");

    bloquearFormulario();
    mostrarModoLectura();
  } catch (error) {
    console.error("Error cargando usuario:", error);
  }
}

function configurarEventosPerfil() {
  const btnEditar = document.getElementById("btn_editar_perfil");
  const btnGuardar = document.getElementById("btn_guardar_perfil");

  btnEditar?.addEventListener("click", () => {
    desbloquearFormulario();
    mostrarModoEdicion();
  });

  btnGuardar?.addEventListener("click", async () => {
    await actualizarPerfil();
  });
}

function configurarEventosPassword() {
  const btnGuardarPassword = document.getElementById("btn_guardar_password");

  btnGuardarPassword?.addEventListener("click", async () => {
    await actualizarPassword();
  });
}

async function actualizarPerfil() {
  const userData = getUserDataSession();

  if (!userData || !userData.usuario_id) {
    alert("No se encontró el usuario en sesión");
    return;
  }

  const payload = {
    usuario_id: Number(userData.usuario_id),
    nombre: getNombre(),
    apellido: getApellido(),
    email: getValue("correo"),
    telefono: getValue("telefono"),
    residencia: getValue("residencia"),
    genero_id: mapGeneroToBackend(getValue("genero")),
    dpi: getValue("dpi"),
    fecha_nacimiento: getValue("fechaNacimiento"),
    nit: getValue("nit"),
    codigo_empleado: toIntOrNull(getValue("codigoEmpleado")),
    cedula_docente: toIntOrNull(getValue("cedulaDocente")),
    fecha_inicio_lab: getValue("fechaInicio"),
    codigo_institucion: toIntOrNull(getValue("codigoInstitucional"))
  };

  limpiarPayload(payload);

  try {
    const response = await fetch("http://localhost:8001/usuario/Actualizar", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      const mensaje = result?.error || extraerErrores(result) || "Error al actualizar usuario";
      throw new Error(mensaje);
    }

    alert(result?.message || "Usuario actualizado correctamente");
    bloquearFormulario();
    mostrarModoLectura();
    await cargarUsuario();
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    alert(error.message || "No se pudo actualizar el perfil");
  }
}

async function actualizarPassword() {
  const userData = getUserDataSession();

  if (!userData || !userData.usuario_id) {
    alert("No se encontró el usuario en sesión");
    return;
  }

  const currentPassword = getValue("currentPassword");
  const newPassword = getValue("newPassword");
  const confirmPassword = getValue("confirmPassword");

  if (!currentPassword || !newPassword || !confirmPassword) {
    alert("Debe completar todos los campos de contraseña");
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("La nueva contraseña y su confirmación no coinciden");
    return;
  }

  if (newPassword.length < 8) {
    alert("La nueva contraseña debe tener al menos 8 caracteres");
    return;
  }

  // Aquí solo mandamos la nueva contraseña.
  // Si luego quieres validar la contraseña actual en backend, habría que ampliar el controller/SP.
  const payload = {
    usuario_id: Number(userData.usuario_id),
    contrasena: newPassword
  };

  try {
    const response = await fetch("http://localhost:8001/usuario/Actualizar", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      const mensaje = result?.error || extraerErrores(result) || "Error al actualizar contraseña";
      throw new Error(mensaje);
    }

    alert(result?.message || "Contraseña actualizada correctamente");

    setValue("currentPassword", "");
    setValue("newPassword", "");
    setValue("confirmPassword", "");
  } catch (error) {
    console.error("Error actualizando contraseña:", error);
    alert(error.message || "No se pudo actualizar la contraseña");
  }
}

/* ==========================
   HELPERS
========================== */
function setValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value ?? "";
}

function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

function setSelect(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

function bloquearFormulario() {
  const campos = document.querySelectorAll(
    "#navs-pills-top-home input, #navs-pills-top-home select"
  );

  campos.forEach(campo => {
    campo.setAttribute("disabled", true);
  });
}

function desbloquearFormulario() {
  const campos = document.querySelectorAll(
    "#navs-pills-top-home input, #navs-pills-top-home select"
  );

  campos.forEach(campo => {
    campo.removeAttribute("disabled");
  });

  // Si no quieres que estos cambien, vuelve a bloquearlos aquí:
  document.getElementById("escalafon")?.setAttribute("disabled", true);
  document.getElementById("renglon")?.setAttribute("disabled", true);
}

function mostrarModoLectura() {
  const btnEditar = document.getElementById("btn_editar_perfil");
  const btnGuardar = document.getElementById("btn_guardar_perfil");

  if (btnEditar) btnEditar.classList.remove("d-none");
  if (btnGuardar) btnGuardar.classList.add("d-none");
}

function mostrarModoEdicion() {
  const btnEditar = document.getElementById("btn_editar_perfil");
  const btnGuardar = document.getElementById("btn_guardar_perfil");

  if (btnEditar) btnEditar.classList.add("d-none");
  if (btnGuardar) btnGuardar.classList.remove("d-none");
}

function normalizarFechaInput(value) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function mapGeneroToBackend(value) {
  if (value === "masculino") return "M";
  if (value === "femenino") return "F";
  return null;
}

function toIntOrNull(value) {
  if (value === "" || value == null) return null;
  const n = parseInt(value, 10);
  return Number.isInteger(n) ? n : null;
}

function extraerErrores(result) {
  if (Array.isArray(result?.errors) && result.errors.length > 0) {
    return result.errors.map(e => e.msg).join("\n");
  }
  return null;
}

function limpiarPayload(payload) {
  Object.keys(payload).forEach(key => {
    if (
      payload[key] === "" ||
      payload[key] === undefined
    ) {
      payload[key] = null;
    }
  });
}

function getNombre() {
  const nombreCompleto = getValue("nombre");
  if (!nombreCompleto) return null;

  const partes = nombreCompleto.split(/\s+/).filter(Boolean);
  return partes.length > 0 ? partes[0] : null;
}

function getApellido() {
  const nombreCompleto = getValue("nombre");
  if (!nombreCompleto) return null;

  const partes = nombreCompleto.split(/\s+/).filter(Boolean);
  if (partes.length <= 1) return null;

  return partes.slice(1).join(" ");
}