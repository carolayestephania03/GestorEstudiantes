document.addEventListener("DOMContentLoaded", () => {
  const btnBuscar = document.getElementById("search-btn");
  const tableBody = document.getElementById("tableBodyActivities");
  const comboGrado = document.getElementById('combo_grado_direc');
  const comboSeccion = document.getElementById('combo_seccion_direc');
  const modalEncargado = new bootstrap.Modal(document.getElementById('modalEncargado'));

  const btnCrearEnc = document.getElementById("create-btn");

  const step1Enc = document.getElementById("step-1-enc");
  const step2Enc = document.getElementById("step-2-enc");

  const btnNextEnc = document.getElementById("btnNextEnc");
  const btnPrevEnc = document.getElementById("btnPrevEnc");
  const btnGuardarEnc = document.getElementById("btnGuardarEnc");

  const wizardProgressEnc = document.getElementById("wizardProgressEnc");

  let currentStepEnc = 1;
  let modoEncargado = "crear"; // crear | editar


  btnBuscar.addEventListener("click", async (e) => {
    e.preventDefault();
    await buscarEncargados();
  });

  // ============================
  // ABRIR MODAL CREAR
  // ============================
  btnCrearEnc.addEventListener("click", () => {
    modoEncargado = "crear";
    currentStepEnc = 1;

    document.getElementById("modalEncargadoTitle").textContent = "Registrar Encargado";

    limpiarModalEncargado();
    actualizarWizardEnc();
    modalEncargado.show();
  });

  // ============================
  // BOTÓN SIGUIENTE
  // ============================
  btnNextEnc.addEventListener("click", () => {

    const nombre = document.getElementById("modal_nombre").value.trim();
    const apellido = document.getElementById("modal_apellido").value.trim();

    if (!nombre || !apellido) {
      alert("Debe completar nombre y apellido");
      return;
    }

    currentStepEnc = 2;
    actualizarWizardEnc();
  });

  // ============================
  // BOTÓN ANTERIOR
  // ============================
  btnPrevEnc.addEventListener("click", () => {
    currentStepEnc = 1;
    actualizarWizardEnc();
  });


  // ============================
  // LIMPIAR MODAL
  // ============================
  function limpiarModalEncargado() {
    document.getElementById("formEncargado").reset();
  }

  function actualizarWizardEnc() {

    if (currentStepEnc === 1) {
      step1Enc.classList.remove("d-none");
      step2Enc.classList.add("d-none");

      btnPrevEnc.disabled = true;
      btnNextEnc.classList.remove("d-none");
      btnGuardarEnc.classList.add("d-none");

      wizardProgressEnc.style.width = "50%";
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

  // ============================
  // GUARDAR / ACTUALIZAR
  // ============================
  btnGuardarEnc.addEventListener("click", async () => {

    const payload = {
      persona: {
        nombre: document.getElementById("modal_nombre").value.trim(),
        apellido: document.getElementById("modal_apellido").value.trim(),
        telefono: document.getElementById("modal_telefono").value.trim(),
        genero: document.getElementById("modal_genero").value,
        dpi: document.getElementById("modal_dpi").value.trim(),
        nit: document.getElementById("modal_nit").value.trim(),
        fecha_nacimiento: document.getElementById("modal_fecha_nacimiento").value,
        correo: document.getElementById("modal_correo").value.trim(),
        residencia: document.getElementById("modal_residencia").value.trim()
      },
      alumno: {
        nombre: document.getElementById("modal_nombre_alumno").value.trim(),
        dpi: document.getElementById("modal_dpi_alumno").value.trim(),
        grado: document.getElementById("modal_grado_alumno").value,
        seccion: document.getElementById("modal_seccion_alumno").value
      }
    };

    try {

      if (modoEncargado === "crear") {
        await fetch("http://localhost:8001/encargado/CrearEncargadoCompleto", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (modoEncargado === "editar") {
        await fetch("http://localhost:8001/encargado/ActualizarEncargadoCompleto", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      modalEncargado.hide();
      buscarEncargados();

    } catch (error) {
      alert("Error al guardar");
    }
  });


  async function buscarEncargados() {
    tableBody.innerHTML = "";

    const payload = construirPayload();

    try {
      const response = await fetch(
        "http://localhost:8001/encargado/BuscarEncargado",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Error al consultar encargados");
      }

      const result = await response.json();
      renderTabla(result?.data || []);
    } catch (error) {
      console.error(error);
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-danger">
            Error al cargar la información
          </td>
        </tr>
      `;
    }
  }

  function construirPayload() {
    const payload = {};

    const dpi = document.getElementById("DPI_enc").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const nombreEnc = document.getElementById("nombre_encargado").value.trim();
    const codigoAlumno = document.getElementById("Cod_estudiante").value.trim();
    const nombreAlumno = document.getElementById("nombre_estudiante").value.trim();
    const gradoId = document.getElementById("combo_grado_direc").value;
    const seccionId = document.getElementById("combo_seccion_direc").value;

    if (dpi) payload.dpi_encargado = dpi;
    if (nombreEnc) payload.nombre_encargado = nombreEnc;
    if (telefono) payload.telefono_encargado = telefono;
    if (codigoAlumno) payload.codigo_alumno = codigoAlumno;
    if (nombreAlumno) payload.nombre_alumno = nombreAlumno;
    if (gradoId) payload.grado_id = parseInt(gradoId);
    if (seccionId) payload.seccion_id = parseInt(seccionId);

    return payload;
  }

  function renderTabla(encargados) {
    if (!encargados.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">
            No se encontraron registros
          </td>
        </tr>
      `;
      return;
    }

    let contador = 1;

    encargados.forEach((enc) => {
      const alumnosHTML = renderAlumnos(enc.alumnos);

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${contador++}</td>
        <td>${enc.dpi || ""}</td>
        <td>${enc.nombre} ${enc.apellido}</td>
        <td>${enc.telefono || ""}</td>
        <td>${enc.residencia || ""}</td>
        <td>${alumnosHTML}</td>
        <td>
          <button class="btn btn-sm btn-info">Ver</button>
        </td>
      `;

      tableBody.appendChild(row);
    });
  }

  function renderAlumnos(alumnos) {
    if (!alumnos || !alumnos.length) {
      return "<em>Sin alumnos asignados</em>";
    }

    let html = "<ul style='padding-left: 18px; margin-bottom: 0;'>";

    alumnos.forEach((al) => {
      html += `
        <li>
          ${al.nombre} ${al.apellido}
          <small class="text-muted">
            (${al.grado} ${al.seccion})
          </small>
        </li>
      `;
    });

    html += "</ul>";
    return html;
  }

});
