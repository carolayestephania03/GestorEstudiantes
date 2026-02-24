document.addEventListener('DOMContentLoaded', () => {
  cargarUsuario();
});

async function cargarUsuario() {
  let userData = null;

  try {
    userData = JSON.parse(sessionStorage.getItem('userData'));
  } catch (e) {
    console.error('Error leyendo userData del sessionStorage');
    return;
  }

  if (!userData || !userData.usuario_id) {
    console.error('userData no contiene usuario_id');
    return;
  }

  const idUsuario = userData.usuario_id;

  try {
    const response = await fetch(
      'http://localhost:8001/usuario/BuscarIndividual',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_usuario: idUsuario
        })
      }
    );

    if (!response.ok) {
      throw new Error('Error al consultar el usuario');
    }

    const result = await response.json();

    if (!result.data) {
      console.warn('No se recibió información del usuario');
      return;
    }

    const u = result.data;

    /* ==========================
       Información Personal
    ========================== */
    setValue('nombre', u.nombre_completo);
    setValue('correo', u.correo);
    setValue('telefono', u.telefono);
    setValue('residencia', u.residencia);
    setValue('fechaNacimiento', u.fecha_nacimiento);

    if (u.genero_id === 'M') {
      setSelect('genero', 'masculino');
    } else if (u.genero_id === 'F') {
      setSelect('genero', 'femenino');
    }

    /* ==========================
       Documentos
    ========================== */
    setValue('dpi', u.dpi);
    setValue('nit', u.nit);

    /* ==========================
       Información Laboral
    ========================== */
    setValue('codigoEmpleado', u.codigo_empleado);
    setValue('cedulaDocente', u.cedula_docente);
    setValue('fechaInicio', u.fecha_inicio_labores);
    setValue('escalafon', u.escalafon_descripcion);
    setValue('renglon', u.renglon_descripcion);
    setValue('codigoInstitucional', u.codigo_institucional ?? '');

    /* ==========================
       Bloquear edición
    ========================== */
    bloquearFormulario();

  } catch (error) {
    console.error('Error cargando usuario:', error);
  }
}

/* ==========================
   Helpers
========================== */
function setValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value ?? '';
}

function setSelect(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

function bloquearFormulario() {
  const campos = document.querySelectorAll(
    '#navs-pills-top-home input, #navs-pills-top-home select'
  );

  campos.forEach(campo => {
    campo.setAttribute('disabled', true);
  });
}
