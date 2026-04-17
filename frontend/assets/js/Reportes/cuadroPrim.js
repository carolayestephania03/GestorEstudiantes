(() => {
  "use strict";

  // =========================================================
  // CONFIG
  // =========================================================
  const URL_BUSCAR_ALUMNOS = "http://localhost:8001/alumno/buscarAlumnos";
  const URL_SITUACIONES = "http://localhost:8001/situacion";

  // =========================================================
  // DOM
  // =========================================================
  const inputLenguajeIndigena = document.getElementById("LenguajeIndigena");
  const inputTitulo = document.getElementById("tituloCuadroPRIM");
  const inputSubtitulo = document.getElementById("subtituloCuadroPRIM");
  const inputCiclo = document.getElementById("cicloCuadroPRIM");
  const inputObservaciones = document.getElementById("observacionesCuadroPRIM");

  const inputCodigoCentroEducativo = document.getElementById("CodigoCentroEducativo");

  const codDepto1 = document.getElementById("codDepto1");
  const codDepto2 = document.getElementById("codDepto2");
  const codMunicipio1 = document.getElementById("codMunicipio1");
  const codMunicipio2 = document.getElementById("codMunicipio2");
  const codCorrelativo1 = document.getElementById("codCorrelativo1");
  const codCorrelativo2 = document.getElementById("codCorrelativo2");
  const codCorrelativo3 = document.getElementById("codCorrelativo3");
  const codCorrelativo4 = document.getElementById("codCorrelativo4");
  const codNivel1 = document.getElementById("codNivel1");
  const codNivel2 = document.getElementById("codNivel2");

  const btnGenerarCuadroPRIM = document.getElementById("btnGenerarCuadroPRIM");
  const btnVistaPrevia = document.getElementById("btnVistaPrevia");

  const tableBodyAlumnoNotas = document.getElementById("tableBodyAlumnoNotas");
  const vistaPreviaContainer = document.getElementById("vistaPreviaContainerCuadroPrim");
  const cuadroPRIMContainer = document.getElementById("CuadroPRIMContainer");

  // =========================================================
  // ESTADO
  // =========================================================
  const estado = {
    anio: new Date().getFullYear(),
    grado_id: null,
    grado_desc: "",
    seccion_id: null,
    seccion_desc: "",
    alumnos: [],
    situaciones: [],
    docente: "",
    departamento: "",
    municipio: "",
    jornada: "",
    plan: "DIARIO(REGULAR)",
    idiomas: "CASTELLANO (ESPAÑOL)"
  };

  // =========================================================
  // HELPERS
  // =========================================================
  function toInt(value, fallback = null) {
    const n = parseInt(value, 10);
    return Number.isFinite(n) ? n : fallback;
  }

  function escapeHtml(text) {
    return String(text ?? "").replace(/[&<>"']/g, function (m) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[m];
    });
  }

  function safeUpper(value) {
    return String(value ?? "").trim().toUpperCase();
  }

  function formatDate(dateString) {
    if (!dateString) return "—";

    const fecha = new Date(dateString);
    if (Number.isNaN(fecha.getTime())) return escapeHtml(dateString);

    const day = String(fecha.getDate()).padStart(2, "0");
    const month = String(fecha.getMonth() + 1).padStart(2, "0");
    const year = fecha.getFullYear();

    return `${day}/${month}/${year}`;
  }

  function formatDateLong(date = new Date()) {
    return date.toLocaleDateString("es-GT", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  }

  function mostrarMensajeTabla(msg, className = "text-muted") {
    if (!tableBodyAlumnoNotas) return;

    tableBodyAlumnoNotas.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-3 ${className}">
          ${escapeHtml(msg)}
        </td>
      </tr>
    `;
  }

  function obtenerDatosSessionStorage() {
    let userData = null;

    try {
      const raw = sessionStorage.getItem("userData");
      userData = raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn("No se pudo leer userData:", error);
    }

    const gradoMap = {
      primero: { id: 1, desc: "PRIMERO" },
      segundo: { id: 2, desc: "SEGUNDO" },
      tercero: { id: 3, desc: "TERCERO" },
      cuarto: { id: 4, desc: "CUARTO" },
      quinto: { id: 5, desc: "QUINTO" },
      sexto: { id: 6, desc: "SEXTO" },
      "1ro": { id: 1, desc: "PRIMERO" },
      "2do": { id: 2, desc: "SEGUNDO" },
      "3ro": { id: 3, desc: "TERCERO" },
      "4to": { id: 4, desc: "CUARTO" },
      "5to": { id: 5, desc: "QUINTO" },
      "6to": { id: 6, desc: "SEXTO" },
      "1": { id: 1, desc: "PRIMERO" },
      "2": { id: 2, desc: "SEGUNDO" },
      "3": { id: 3, desc: "TERCERO" },
      "4": { id: 4, desc: "CUARTO" },
      "5": { id: 5, desc: "QUINTO" },
      "6": { id: 6, desc: "SEXTO" }
    };

    const seccionMap = {
      a: { id: 1, desc: "A" },
      b: { id: 2, desc: "B" },
      "1": { id: 1, desc: "A" },
      "2": { id: 2, desc: "B" }
    };

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

    let grado_desc = String(
      userData?.grado_desc ??
      userData?.grado_actual_desc ??
      userData?.maestro_grado_desc ??
      userData?.maestro_grado_actual ??
      ""
    ).trim().toUpperCase();

    let seccion_desc = String(
      userData?.seccion_desc ??
      userData?.seccion_actual_desc ??
      userData?.maestro_seccion_desc ??
      userData?.maestro_seccion_actual_desc ??
      ""
    ).trim().toUpperCase();

    if (!grado_id || !grado_desc) {
      const gradoTexto = String(
        userData?.maestro_grado_actual ??
        userData?.grado_actual ??
        userData?.grado ??
        ""
      ).trim().toLowerCase();

      const gradoObj = gradoMap[gradoTexto];
      if (gradoObj) {
        grado_id = gradoObj.id;
        grado_desc = gradoObj.desc;
      }
    }

    if (!seccion_id || !seccion_desc) {
      const seccionTexto = String(
        userData?.maestro_seccion_actual ??
        userData?.seccion_actual ??
        userData?.seccion ??
        ""
      ).trim().toLowerCase();

      const seccionObj = seccionMap[seccionTexto];
      if (seccionObj) {
        seccion_id = seccionObj.id;
        seccion_desc = seccionObj.desc;
      }
    }

    const anio = toInt(
      userData?.maestro_anio_actual ??
      userData?.anio_actual ??
      userData?.anio ??
      new Date().getFullYear(),
      new Date().getFullYear()
    );

    const docente = `${userData?.persona_nombre ?? ""} ${userData?.persona_apellido ?? ""}`.trim();

    return {
      anio,
      grado_id,
      grado_desc,
      seccion_id,
      seccion_desc,
      docente
    };
  }

  async function fetchJSON(url, method = "GET", payload = null) {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include"
    };

    if (payload !== null) {
      options.body = JSON.stringify(payload);
    }

    const response = await fetch(url, options);
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message =
        result?.error ||
        result?.mensaje ||
        (Array.isArray(result?.errors) ? result.errors.map(x => x.msg).join("\n") : null) ||
        `Error HTTP ${response.status}`;

      throw new Error(message);
    }

    return result;
  }

  function actualizarCodigoCentroEducativo() {
    const value = [
      codDepto1?.value || "",
      codDepto2?.value || "",
      "-",
      codMunicipio1?.value || "",
      codMunicipio2?.value || "",
      "-",
      codCorrelativo1?.value || "",
      codCorrelativo2?.value || "",
      codCorrelativo3?.value || "",
      codCorrelativo4?.value || "",
      "-",
      codNivel1?.value || "",
      codNivel2?.value || ""
    ].join("");

    if (inputCodigoCentroEducativo) {
      inputCodigoCentroEducativo.value = value.replace(/-+/g, (m) => m);
    }
  }

  function configurarInputsCodigo() {
    const inputs = [
      codDepto1, codDepto2,
      codMunicipio1, codMunicipio2,
      codCorrelativo1, codCorrelativo2, codCorrelativo3, codCorrelativo4,
      codNivel1, codNivel2
    ].filter(Boolean);

    inputs.forEach((input, index) => {
      input.addEventListener("input", (e) => {
        e.target.value = String(e.target.value || "").replace(/[^0-9]/g, "").slice(0, 1);
        actualizarCodigoCentroEducativo();

        if (e.target.value && inputs[index + 1]) {
          inputs[index + 1].focus();
        }
      });

      input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !e.target.value && inputs[index - 1]) {
          inputs[index - 1].focus();
        }
      });
    });

    actualizarCodigoCentroEducativo();
  }

  // =========================================================
  // ALUMNOS
  // =========================================================
  function normalizarAlumno(item) {
    const nombreCompleto =
      item.nombre_completo ??
      item.alumno_nombre_completo ??
      `${item.nombre ?? item.alumno_nombre ?? ""} ${item.apellido ?? item.alumno_apellido ?? ""}`.trim();

    const sexoRaw = String(
      item.sexo ??
      item.genero ??
      item.genero_desc ??
      item.alumno_sexo ??
      ""
    ).trim().toUpperCase();

    let sexo = sexoRaw;
    if (sexoRaw.startsWith("M")) sexo = "M";
    else if (sexoRaw.startsWith("F")) sexo = "F";

    return {
      alumno_id: item.alumno_id ?? item.id ?? null,
      codigo_alumno: item.codigo_alumno ?? item.codigo ?? item.codigo_personal ?? "",
      nombre_completo: nombreCompleto || "—",
      fecha_nacimiento: item.fecha_nacimiento ?? item.nacimiento ?? item.alumno_fecha_nacimiento ?? "",
      sexo,
      situacion_alumno_id: 1
    };
  }

  async function cargarAlumnos() {
    if (!estado.grado_id || !estado.seccion_id) {
      mostrarMensajeTabla("No se encontraron grado y sección en sessionStorage", "text-danger");
      return;
    }

    mostrarMensajeTabla("Cargando alumnos...");

    try {
      const payload = {
        grado_id: estado.grado_id,
        seccion_id: estado.seccion_id
      };

      const result = await fetchJSON(URL_BUSCAR_ALUMNOS, "POST", payload);
      const lista = Array.isArray(result?.data) ? result.data.map(normalizarAlumno) : [];

      estado.alumnos = lista;
      renderTablaAlumnos();
    } catch (error) {
      console.error("Error al cargar alumnos:", error);
      mostrarMensajeTabla(error.message || "Error al cargar alumnos", "text-danger");
    }
  }

  // =========================================================
  // SITUACIONES
  // =========================================================
  function normalizarSituacion(item) {
    return {
      situacion_alumno_id: toInt(item?.situacion_alumno_id, null),
      siglas: String(item?.siglas ?? "").trim().toUpperCase(),
      descripcion: String(item?.descripcion ?? "").trim(),
      estado: toInt(item?.estado, 0)
    };
  }

  async function cargarSituaciones() {
    try {
      const result = await fetchJSON(URL_SITUACIONES, "GET");
      const lista = Array.isArray(result?.data) ? result.data.map(normalizarSituacion) : [];

      estado.situaciones = lista.filter(x => x.estado === 1 && x.situacion_alumno_id !== null);

      if (!estado.situaciones.length) {
        throw new Error("No se encontraron situaciones activas");
      }
    } catch (error) {
      console.error("Error al cargar situaciones:", error);
      throw new Error(error.message || "No se pudieron cargar las situaciones");
    }
  }

  function buildSituacionOptions(selectedId = 1) {
    return estado.situaciones.map(item => `
      <option value="${escapeHtml(item.situacion_alumno_id)}" ${Number(item.situacion_alumno_id) === Number(selectedId) ? "selected" : ""}>
        ${escapeHtml(item.siglas)}${item.descripcion ? " - " + escapeHtml(item.descripcion) : ""}
      </option>
    `).join("");
  }

  function renderTablaAlumnos() {
    if (!tableBodyAlumnoNotas) return;

    if (!Array.isArray(estado.alumnos) || estado.alumnos.length === 0) {
      mostrarMensajeTabla("No se encontraron alumnos");
      return;
    }

    tableBodyAlumnoNotas.innerHTML = estado.alumnos.map(alumno => `
      <tr>
        <td class="text-center">
          <input
            type="checkbox"
            class="form-check-input alumno-check"
            value="${escapeHtml(alumno.alumno_id)}"
            checked
          >
        </td>
        <td>${escapeHtml(alumno.codigo_alumno || "—")}</td>
        <td>${escapeHtml(alumno.nombre_completo || "—")}</td>
        <td>
          <select
            class="form-select form-select-sm situacion-select"
            data-alumno-id="${escapeHtml(alumno.alumno_id)}"
          >
            ${buildSituacionOptions(alumno.situacion_alumno_id)}
          </select>
        </td>
      </tr>
    `).join("");
  }

  function obtenerAlumnosSeleccionados() {
    const checks = Array.from(document.querySelectorAll(".alumno-check:checked"));
    const mapaSituaciones = new Map();

    document.querySelectorAll(".situacion-select").forEach(select => {
      const alumnoId = toInt(select.dataset.alumnoId, null);
      const situacionId = toInt(select.value, 1);
      mapaSituaciones.set(alumnoId, situacionId);
    });

    return checks
      .map(check => {
        const alumnoId = toInt(check.value, null);
        const alumno = estado.alumnos.find(x => Number(x.alumno_id) === Number(alumnoId));
        if (!alumno) return null;

        return {
          ...alumno,
          situacion_alumno_id: mapaSituaciones.get(alumnoId) ?? 1
        };
      })
      .filter(Boolean);
  }

  function obtenerSituacionPorId(id) {
    return estado.situaciones.find(x => Number(x.situacion_alumno_id) === Number(id)) || null;
  }

  // =========================================================
  // NOTAS / ASIGNATURAS
  // =========================================================
  // PENDIENTE:
  // Aquí quedará después el consumo del API que devolverá las notas por alumno.
  // Por ahora se deja una estructura fija de columnas 1..10 para maquetar el formato.
  function obtenerColumnasAsignaturasBase() {
    return [
      { numero: 1, nombre: "L1. IDIOMA MATERNO" },
      { numero: 2, nombre: "L2. SEGUNDO IDIOMA" },
      { numero: 3, nombre: "L3. TERCER IDIOMA" },
      { numero: 4, nombre: "MATEMÁTICAS" },
      { numero: 5, nombre: "MEDIO SOCIAL Y NATURAL" },
      { numero: 6, nombre: "EXPRESIÓN ARTÍSTICA" },
      { numero: 7, nombre: "EDUCACIÓN FÍSICA" },
      { numero: 8, nombre: "FORMACIÓN CIUDADANA" },
      { numero: 9, nombre: "" },
      { numero: 10, nombre: "" }
    ];
  }

  function obtenerNotasTemporalesAlumno() {
    return {
      1: "----",
      2: "----",
      3: "----",
      4: "----",
      5: "----",
      6: "----",
      7: "----",
      8: "----",
      9: "----",
      10: "----"
    };
  }

  // =========================================================
  // RESUMEN
  // =========================================================
  function construirResumen(alumnosSeleccionados) {
    const resumen = {
      P: { M: 0, F: 0 },
      NP: { M: 0, F: 0 },
      PAC: { M: 0, F: 0 },
      NPAC: { M: 0, F: 0 },
      total: alumnosSeleccionados.length
    };

    alumnosSeleccionados.forEach(alumno => {
      const situacion = obtenerSituacionPorId(alumno.situacion_alumno_id);
      const sigla = safeUpper(situacion?.siglas);
      const sexo = alumno.sexo === "F" ? "F" : "M";

      if (resumen[sigla] && resumen[sigla][sexo] != null) {
        resumen[sigla][sexo] += 1;
      }
    });

    return resumen;
  }

  // =========================================================
  // HTML CUADRO PRIM
  // =========================================================
  function generarCodigoCentroBoxesHTML() {
    return `
      <div class="code-group">
        <div class="code-box">${escapeHtml(codDepto1?.value || "")}</div>
        <div class="code-box">${escapeHtml(codDepto2?.value || "")}</div>
      </div>
      <div class="code-separator">-</div>

      <div class="code-group">
        <div class="code-box">${escapeHtml(codMunicipio1?.value || "")}</div>
        <div class="code-box">${escapeHtml(codMunicipio2?.value || "")}</div>
      </div>
      <div class="code-separator">-</div>

      <div class="code-group">
        <div class="code-box">${escapeHtml(codCorrelativo1?.value || "")}</div>
        <div class="code-box">${escapeHtml(codCorrelativo2?.value || "")}</div>
        <div class="code-box">${escapeHtml(codCorrelativo3?.value || "")}</div>
        <div class="code-box">${escapeHtml(codCorrelativo4?.value || "")}</div>
      </div>
      <div class="code-separator">-</div>

      <div class="code-group">
        <div class="code-box">${escapeHtml(codNivel1?.value || "")}</div>
        <div class="code-box">${escapeHtml(codNivel2?.value || "")}</div>
      </div>
    `;
  }

  function generarFilasTablaPrincipal(alumnos) {
    const filasVaciasNecesarias = Math.max(0, 34 - alumnos.length);
    const rows = [];

    alumnos.forEach((alumno, index) => {
      const notas = obtenerNotasTemporalesAlumno();
      const situacion = obtenerSituacionPorId(alumno.situacion_alumno_id);

      rows.push(`
        <tr>
          <td class="text-center">${index + 1}</td>
          <td>${escapeHtml(alumno.codigo_alumno || "—")}</td>
          <td>${escapeHtml(alumno.nombre_completo || "—")}</td>
          <td class="text-center">${escapeHtml(formatDate(alumno.fecha_nacimiento))}</td>
          <td class="text-center">${escapeHtml(alumno.sexo || "—")}</td>
          <td class="text-center">${escapeHtml(notas[1])}</td>
          <td class="text-center">${escapeHtml(notas[2])}</td>
          <td class="text-center">${escapeHtml(notas[3])}</td>
          <td class="text-center">${escapeHtml(notas[4])}</td>
          <td class="text-center">${escapeHtml(notas[5])}</td>
          <td class="text-center">${escapeHtml(notas[6])}</td>
          <td class="text-center">${escapeHtml(notas[7])}</td>
          <td class="text-center">${escapeHtml(notas[8])}</td>
          <td class="text-center">${escapeHtml(notas[9])}</td>
          <td class="text-center">${escapeHtml(notas[10])}</td>
          <td class="text-center">${escapeHtml(situacion?.siglas || "")}</td>
        </tr>
      `);
    });

    for (let i = 0; i < filasVaciasNecesarias; i++) {
      rows.push(`
        <tr>
          <td>&nbsp;</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      `);
    }

    return rows.join("");
  }

  function generarTablaAsignaturasHTML() {
    const asignaturas = obtenerColumnasAsignaturasBase();

    return `
      <table class="prim-subjects-table">
        <thead>
          <tr>
            <th style="width: 42px;">No.</th>
            <th>Nombre de las asignaturas o áreas curriculares</th>
            <th style="width: 120px;">Documento de Identificación</th>
            <th style="width: 220px;">Nombre del o la docente</th>
            <th style="width: 90px;">Firma</th>
          </tr>
        </thead>
        <tbody>
          ${asignaturas
            .filter(item => item.nombre)
            .map(item => `
              <tr>
                <td class="text-center">${escapeHtml(item.numero)}</td>
                <td>${escapeHtml(item.nombre)}</td>
                <td></td>
                <td>${escapeHtml(estado.docente || "")}</td>
                <td></td>
              </tr>
            `).join("")}
        </tbody>
      </table>
    `;
  }

  function generarResumenHTML(resumen) {
    return `
      <table class="prim-summary-table">
        <thead>
          <tr>
            <th colspan="2">Promovidos(as)</th>
            <th colspan="2">No promovidos(as)</th>
            <th colspan="4">Adecuación curricular</th>
            <th rowspan="2">Total</th>
          </tr>
          <tr>
            <th>Masculino</th>
            <th>Femenino</th>
            <th>Masculino</th>
            <th>Femenino</th>
            <th colspan="2">Promovidos(as)</th>
            <th colspan="2">No promovidos(as)</th>
          </tr>
          <tr>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th>Masculino</th>
            <th>Femenino</th>
            <th>Masculino</th>
            <th>Femenino</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-center">${resumen.P.M}</td>
            <td class="text-center">${resumen.P.F}</td>
            <td class="text-center">${resumen.NP.M}</td>
            <td class="text-center">${resumen.NP.F}</td>
            <td class="text-center">${resumen.PAC.M}</td>
            <td class="text-center">${resumen.PAC.F}</td>
            <td class="text-center">${resumen.NPAC.M}</td>
            <td class="text-center">${resumen.NPAC.F}</td>
            <td class="text-center">${resumen.total}</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  function generarCuadroPrimHTML() {
    const alumnosSeleccionados = obtenerAlumnosSeleccionados();

    if (!alumnosSeleccionados.length) {
      throw new Error("Debe seleccionar al menos un alumno");
    }

    const resumen = construirResumen(alumnosSeleccionados);
    const filasTabla = generarFilasTablaPrincipal(alumnosSeleccionados);

    const lenguaje = inputLenguajeIndigena?.value?.trim() || "";
    const titulo = inputTitulo?.value?.trim() || "";
    const subtitulo = inputSubtitulo?.value?.trim() || "";
    const ciclo = inputCiclo?.value?.trim() || "";
    const observaciones = inputObservaciones?.value?.trim() || "- - - - - - - - - - - - - - - - - - - - - - - - - - - -";
    const anio = estado.anio;

    return `
      <style>
        .prim-preview-wrapper {
          background: #f5f5f5;
          padding: 16px;
        }

        .prim-page {
          width: 8.5in;
          min-height: 11in;
          margin: 0 auto 18px auto;
          background: #fff;
          color: #000;
          padding: 0.28in 0.30in;
          box-shadow: 0 2px 10px rgba(0,0,0,.08);
          font-family: Arial, sans-serif;
          font-size: 10px;
          box-sizing: border-box;
        }

        .prim-center { text-align: center; }
        .prim-bold { font-weight: 700; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }

        .prim-header-grid {
          display: grid;
          grid-template-columns: 140px 1fr 110px;
          gap: 10px;
          align-items: start;
          margin-bottom: 8px;
        }

        .prim-logo-area {
          min-height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .prim-logo-area img {
          max-width: 95px;
          max-height: 65px;
          object-fit: contain;
        }

        .prim-title-block {
          text-align: center;
          line-height: 1.25;
        }

        .prim-title-main {
          font-size: 16px;
          font-weight: 700;
        }

        .prim-title-sub {
          font-size: 12px;
          margin-top: 2px;
        }

        .prim-year-box {
          text-align: center;
          font-size: 10px;
        }

        .prim-year-number {
          display: inline-block;
          margin-top: 3px;
          border: 1px solid #000;
          padding: 2px 10px;
          font-weight: 700;
          min-width: 52px;
        }

        .prim-inline-row {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          margin-bottom: 6px;
          flex-wrap: wrap;
        }

        .prim-label {
          font-size: 10px;
          white-space: nowrap;
        }

        .line-fill {
          flex: 1;
          min-width: 120px;
          border-bottom: 1px solid #000;
          min-height: 14px;
          padding: 0 3px 1px 3px;
          display: flex;
          align-items: flex-end;
        }

        .line-fill.short { flex: 0 0 80px; }
        .line-fill.medium { flex: 0 0 180px; }
        .line-fill.long { flex: 1; }

        .code-wrapper {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 6px;
        }

        .code-group {
          display: flex;
        }

        .code-box {
          width: 18px;
          height: 18px;
          border: 1px solid #000;
          text-align: center;
          line-height: 18px;
          font-size: 10px;
        }

        .code-separator {
          font-weight: 700;
          margin: 0 2px;
          line-height: 18px;
        }

        .code-caption {
          font-size: 9px;
          text-align: center;
          margin-top: 2px;
        }

        .prim-summary-title {
          text-align: center;
          font-size: 15px;
          font-weight: 700;
          margin: 10px 0 6px 0;
        }

        .prim-summary-table,
        .prim-main-table,
        .prim-subjects-table {
          width: 100%;
          border-collapse: collapse;
        }

        .prim-summary-table th,
        .prim-summary-table td,
        .prim-main-table th,
        .prim-main-table td,
        .prim-subjects-table th,
        .prim-subjects-table td {
          border: 1px solid #000;
          padding: 3px 4px;
          vertical-align: middle;
          font-size: 9px;
        }

        .prim-summary-table th,
        .prim-main-table th,
        .prim-subjects-table th {
          font-weight: 700;
          text-align: center;
        }

        .prim-main-table th {
          font-size: 8px;
        }

        .prim-main-table td {
          height: 18px;
        }

        .prim-main-table .w-no { width: 28px; }
        .prim-main-table .w-codigo { width: 70px; }
        .prim-main-table .w-nombre { width: 260px; }
        .prim-main-table .w-fecha { width: 95px; }
        .prim-main-table .w-sexo { width: 28px; }
        .prim-main-table .w-area { width: 28px; }
        .prim-main-table .w-resultado { width: 42px; }

        .vertical-text {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          white-space: nowrap;
          text-align: center;
          margin: 0 auto;
        }

        .prim-table-note {
          margin-top: 6px;
          font-size: 8px;
          line-height: 1.3;
        }

        .prim-observaciones {
          margin-top: 12px;
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .prim-observaciones .obs-line {
          flex: 1;
          border: 1px solid #000;
          min-height: 22px;
          padding: 3px 6px;
          display: flex;
          align-items: center;
        }

        .prim-declaration {
          text-align: center;
          margin-top: 10px;
          font-size: 12px;
          font-weight: 700;
        }

        .prim-signature-row-top {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 18px;
          align-items: end;
        }

        .prim-signature-row-bottom {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 38px;
          align-items: end;
        }

        .signature-box {
          text-align: center;
          font-size: 9px;
        }

        .signature-line {
          border-bottom: 1px solid #000;
          height: 18px;
          margin-bottom: 4px;
        }

        .prim-footer-note {
          margin-top: 18px;
          font-size: 7.5px;
          line-height: 1.25;
        }

        @media print {
          .prim-preview-wrapper {
            background: #fff;
            padding: 0;
          }

          .prim-page {
            margin: 0 auto;
            box-shadow: none;
            page-break-after: always;
          }

          .prim-page:last-child {
            page-break-after: auto;
          }
        }
      </style>

      <div class="prim-preview-wrapper">
        <div class="prim-page">
          <div class="prim-header-grid">
            <div class="prim-logo-area">
              <img src="../../assets/img/logoMineduc.png" alt="Logo Ministerio">
            </div>

            <div class="prim-title-block">
              <div class="prim-title-main">NIVEL DE EDUCACIÓN PRIMARIA</div>
              <div class="prim-title-sub">${escapeHtml(lenguaje || "B'axa Tanul Chusb'al.")}${lenguaje ? "" : ""}</div>
              <div class="prim-title-main" style="font-size: 14px; margin-top: 2px;">REGISTRO GENERAL DE RESULTADOS FINALES</div>
              <div class="prim-title-sub">${escapeHtml(titulo || "Ib'ooqolil Tachul tatin Chusb'alib'.")}</div>
              <div class="prim-title-main" style="font-size: 13px; margin-top: 4px;">Primer Ciclo</div>
              <div class="prim-title-sub">${escapeHtml(subtitulo || "B'axa ya'b'. - B'axa Tajnib'al.")}</div>
              <div class="prim-title-sub" style="margin-top: 3px;">${escapeHtml(ciclo || "")}</div>
            </div>

            <div class="prim-year-box">
              <div>Ciclo escolar</div>
              <div class="prim-year-number">${escapeHtml(anio)}</div>
            </div>
          </div>

          <div class="prim-inline-row">
            <div class="prim-label">Código del centro educativo</div>
            <div class="code-wrapper">
              ${generarCodigoCentroBoxesHTML()}
            </div>

            <div class="prim-label" style="margin-left:auto;">Hoja No.</div>
            <div class="line-fill short">01</div>
            <div class="prim-label">de</div>
            <div class="line-fill short">01</div>
          </div>

          <div class="prim-inline-row">
            <div class="prim-label">Grado/Etapa</div>
            <div class="line-fill medium">${escapeHtml(estado.grado_desc || "")}</div>
            <div class="prim-label">Sección</div>
            <div class="line-fill short">${escapeHtml(estado.seccion_desc || "")}</div>
          </div>

          <div class="prim-inline-row">
            <div class="prim-label">Nombre del centro educativo</div>
            <div class="line-fill long">ESCUELA OFICIAL RURAL MIXTA COLONIA LINDA VISTA</div>
          </div>

          <div class="prim-inline-row">
            <div class="prim-label">Dirección del centro educativo</div>
            <div class="line-fill long"></div>
          </div>

          <div class="prim-inline-row">
            <div class="prim-label">Departamento</div>
            <div class="line-fill medium">${escapeHtml(estado.departamento || "")}</div>
            <div class="prim-label">Municipio</div>
            <div class="line-fill medium">${escapeHtml(estado.municipio || "")}</div>
          </div>

          <div class="prim-inline-row">
            <div class="prim-label">Sector</div>
            <div class="line-fill medium">OFICIAL</div>
            <div class="prim-label">Jornada</div>
            <div class="line-fill medium">${escapeHtml(estado.jornada || "")}</div>
            <div class="prim-label">Plan</div>
            <div class="line-fill medium">${escapeHtml(estado.plan || "")}</div>
          </div>

          <div class="prim-inline-row">
            <div class="prim-label">DPI del(la) Docente</div>
            <div class="line-fill medium"></div>
            <div class="prim-label">Idioma(s) en que se imparten clases</div>
            <div class="line-fill long">${escapeHtml(`${estado.idiomas}${lenguaje ? " / " + lenguaje : ""}`)}</div>
          </div>

          <div class="prim-inline-row">
            <div class="prim-label">Docente</div>
            <div class="line-fill long">${escapeHtml(estado.docente || "")}</div>
          </div>

          <div class="prim-inline-row">
            <div class="prim-label">Número y fecha de acuerdo gubernativo o ministerial de autorización del centro educativo:</div>
            <div class="line-fill long"></div>
          </div>

          <div class="prim-inline-row">
            <div class="prim-label">Número y fecha de resolución departamental de autorización del centro educativo:</div>
            <div class="line-fill long"></div>
          </div>

          <div class="prim-summary-title">Resumen de estudiantes</div>

          ${generarResumenHTML(resumen)}

          <table class="prim-main-table" style="margin-top:10px;">
            <thead>
              <tr>
                <th class="w-no" rowspan="2">No.</th>
                <th class="w-codigo" rowspan="2">Código personal</th>
                <th class="w-nombre" rowspan="2">Nombre de(la) estudiante</th>
                <th class="w-fecha" rowspan="2">Fecha de nacimiento</th>
                <th class="w-sexo" rowspan="2"><div class="vertical-text">Sexo M/F</div></th>
                <th colspan="10">Áreas, subáreas o asignaturas</th>
                <th class="w-resultado" rowspan="2"><div class="vertical-text">Resultado (1)</div></th>
              </tr>
              <tr>
                <th class="w-area">1</th>
                <th class="w-area">2</th>
                <th class="w-area">3</th>
                <th class="w-area">4</th>
                <th class="w-area">5</th>
                <th class="w-area">6</th>
                <th class="w-area">7</th>
                <th class="w-area">8</th>
                <th class="w-area">9</th>
                <th class="w-area">10</th>
              </tr>
            </thead>
            <tbody>
              ${filasTabla}
            </tbody>
          </table>

          <div class="prim-table-note">
            <div><strong>(1)</strong> En la columna de resultado escriba las siglas según la situación seleccionada del alumno.</div>
            <div><strong>(2)</strong> Promedio de las áreas y subáreas artículo 23, inciso a) del Acuerdo Ministerial 1171-2010.</div>
          </div>
        </div>

        <div class="prim-page">
          <table class="prim-main-table">
            <thead>
              <tr>
                <th class="w-no" rowspan="2">No.</th>
                <th class="w-codigo" rowspan="2">Código personal</th>
                <th class="w-nombre" rowspan="2">Nombre de(la) estudiante</th>
                <th class="w-fecha" rowspan="2">Fecha de nacimiento</th>
                <th class="w-sexo" rowspan="2"><div class="vertical-text">Sexo M/F</div></th>
                <th colspan="10">Áreas, subáreas o asignaturas</th>
                <th class="w-resultado" rowspan="2"><div class="vertical-text">Resultado (1)</div></th>
              </tr>
              <tr>
                <th class="w-area">1</th>
                <th class="w-area">2</th>
                <th class="w-area">3</th>
                <th class="w-area">4</th>
                <th class="w-area">5</th>
                <th class="w-area">6</th>
                <th class="w-area">7</th>
                <th class="w-area">8</th>
                <th class="w-area">9</th>
                <th class="w-area">10</th>
              </tr>
            </thead>
            <tbody>
              ${generarFilasTablaPrincipal([])}
            </tbody>
          </table>

          <div class="prim-footer-note">
            <div><strong>Nota:</strong></div>
            <div>a) El Acuerdo Ministerial No. 437-2020 autoriza el Currículum Nacional Base para el Nivel de Educación Primaria.</div>
            <div>b) El Artículo 23 Inciso a), del Acuerdo Ministerial 1171-2010, establece las condiciones de promoción en 1ro., 2do. y 3er. grados.</div>
            <div>c) El Artículo 25 Inciso a), del Acuerdo Ministerial 1171-2010, establece que en 1ro, 2do y 3er grado no aplica recuperación.</div>
            <div>d) Resolución Ministerial 1513 de fecha 28 de octubre del 2013.</div>
          </div>

          <div style="margin-top:14px;">
            ${generarTablaAsignaturasHTML()}
          </div>

          <div class="prim-observaciones">
            <div class="prim-label"><strong>Observaciones:</strong></div>
            <div class="obs-line">${escapeHtml(observaciones)}</div>
          </div>

          <div class="prim-declaration">
            Los infrascritos declaramos y juramos que la información consignada es verídica
          </div>

          <div class="prim-signature-row-top">
            <div class="signature-box">
              <div class="signature-line">${escapeHtml(formatDateLong())}</div>
              <div>Lugar y fecha</div>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <div>Nombre y firma del o la docente del centro educativo</div>
            </div>
          </div>

          <div class="prim-signature-row-bottom">
            <div class="signature-box">
              <div class="signature-line"></div>
              <div>Nombre y firma del director(a) del centro educativo</div>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <div>Nombre y firma de la autoridad educativa que certifica</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function generarDocumentoImpresion(htmlInterno) {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Cuadro PRIM</title>
        <style>
          @page {
            size: letter;
            margin: 0;
          }

          html, body {
            margin: 0;
            padding: 0;
            background: #fff;
          }
        </style>
      </head>
      <body>
        ${htmlInterno}
        <script>
          window.onload = function () {
            setTimeout(function () {
              window.print();
            }, 400);
          };
        </script>
      </body>
      </html>
    `;
  }

  // =========================================================
  // ACCIONES
  // =========================================================
  function validarConfiguracionBasica() {
    if (!estado.grado_id || !estado.seccion_id) {
      throw new Error("No se encontró grado o sección en sessionStorage");
    }

    if (!estado.alumnos.length) {
      throw new Error("No hay alumnos cargados para este grado y sección");
    }
  }

  function construirVistaCuadroPRIM() {
    validarConfiguracionBasica();
    return generarCuadroPrimHTML();
  }

  async function onVistaPrevia() {
    try {
      const html = construirVistaCuadroPRIM();
      cuadroPRIMContainer.innerHTML = html;
      vistaPreviaContainer.classList.remove("d-none");

      window.scrollTo({
        top: vistaPreviaContainer.offsetTop - 20,
        behavior: "smooth"
      });
    } catch (error) {
      console.error("Error en vista previa:", error);
      alert(error.message || "No se pudo generar la vista previa");
    }
  }

  async function onGenerarCuadroPRIM() {
    try {
      const html = construirVistaCuadroPRIM();
      const doc = generarDocumentoImpresion(html);
      const win = window.open("", "_blank", "width=1200,height=900,scrollbars=yes");

      if (!win) {
        throw new Error("El navegador bloqueó la ventana emergente de impresión");
      }

      win.document.open();
      win.document.write(doc);
      win.document.close();
    } catch (error) {
      console.error("Error al generar Cuadro PRIM:", error);
      alert(error.message || "No se pudo generar el Cuadro PRIM");
    }
  }

  // =========================================================
  // EVENTOS
  // =========================================================
  function bindEvents() {
    btnVistaPrevia?.addEventListener("click", onVistaPrevia);
    btnGenerarCuadroPRIM?.addEventListener("click", onGenerarCuadroPRIM);
  }

  // =========================================================
  // INIT
  // =========================================================
  async function init() {
    const datos = obtenerDatosSessionStorage();

    estado.anio = datos.anio;
    estado.grado_id = datos.grado_id;
    estado.grado_desc = datos.grado_desc || "";
    estado.seccion_id = datos.seccion_id;
    estado.seccion_desc = datos.seccion_desc || "";
    estado.docente = datos.docente || "";

    estado.jornada = "MATUTINA";

    bindEvents();
    configurarInputsCodigo();

    await cargarSituaciones();
    await cargarAlumnos();
  }

  document.addEventListener("DOMContentLoaded", init);
})();