(() => {
  "use strict";

  // =========================================================
  // CONFIG
  // =========================================================
  const URL_BUSCAR_ALUMNOS = "http://localhost:8001/alumno/buscarAlumnos";
  const URL_REPORTE_NOTAS = "http://localhost:8001/calificacion/reporteNotasMateriasBimestre";

  // =========================================================
  // DOM
  // =========================================================
  const comboCiclo = document.getElementById("combo_ciclo_direc");

  const radioEspecifico = document.getElementById("estudianteEspecifico");
  const radioTodos = document.getElementById("todosEstudiantes");

  const btnGenerarBoleta = document.getElementById("btnGenerarBoleta");
  const btnVistaPrevia = document.getElementById("btnVistaPrevia");

  const tableBodyAlumnoNotas = document.getElementById("tableBodyAlumnoNotas");
  const vistaPreviaContainer = document.getElementById("vistaPreviaContainer");
  const boletaContainer = document.getElementById("boletaContainer");

  // Columnas layout
  const tablaCol = tableBodyAlumnoNotas?.closest(".col-12.col-lg-8.col-xl-6");
  const imagenCol = document
    .querySelector('img[alt="Imagen de calificaciones"]')
    ?.closest(".col-12.col-lg-3");

  const clasesOriginalesImagen = imagenCol ? [...imagenCol.classList] : [];

  // =========================================================
  // ESTADO
  // =========================================================
  let estado = {
    anio: new Date().getFullYear(),
    grado_id: null,
    seccion_id: null,
    alumnos: [],
    reporte: []
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

  function formatDateLong(date = new Date()) {
    return date.toLocaleDateString("es-GT", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  }

  function getBimestreTexto(cicloId) {
    const map = {
      1: "Primer Bimestre",
      2: "Segundo Bimestre",
      3: "Tercer Bimestre",
      4: "Cuarto Bimestre"
    };
    return map[Number(cicloId)] || "Bimestre";
  }

  function mostrarMensajeTabla(msg, className = "text-muted") {
    if (!tableBodyAlumnoNotas) return;

    tableBodyAlumnoNotas.innerHTML = `
      <tr>
        <td colspan="3" class="text-center py-3 ${className}">
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

    let grado_id =
      toInt(
        userData?.grado_id ??
        userData?.grado_actual_id ??
        userData?.maestro_grado_id ??
        userData?.maestro_grado_actual_id,
        null
      );

    let seccion_id =
      toInt(
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

    const anio = toInt(
      userData?.maestro_anio_actual ??
      userData?.anio_actual ??
      userData?.anio ??
      new Date().getFullYear(),
      new Date().getFullYear()
    );

    return { anio, grado_id, seccion_id };
  }

  async function fetchJSON(url, method = "POST", payload = null) {
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
        (Array.isArray(result?.errors) ? result.errors.map(x => x.msg).join("\n") : null) ||
        `Error HTTP ${response.status}`;

      throw new Error(message);
    }

    return result;
  }

  // =========================================================
  // UI MODO IMPRESION
  // =========================================================
  function actualizarModoImpresionUI() {
    const esTodos = radioTodos?.checked;

    if (!tablaCol || !imagenCol) return;

    if (esTodos) {
      tablaCol.classList.add("d-none");

    } else {
      tablaCol.classList.remove("d-none");

      clasesOriginalesImagen.forEach(cls => imagenCol.classList.add(cls));
    }
  }

  // =========================================================
  // ALUMNOS
  // =========================================================
  function normalizarAlumno(item) {
    return {
      alumno_id: item.alumno_id ?? item.id ?? null,
      codigo_alumno: item.codigo_alumno ?? item.codigo ?? "",
      nombre_completo:
        item.nombre_completo ??
        `${item.nombre ?? item.alumno_nombre ?? ""} ${item.apellido ?? item.alumno_apellido ?? ""}`.trim()
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
          >
        </td>
        <td>${escapeHtml(alumno.codigo_alumno || "—")}</td>
        <td>${escapeHtml(alumno.nombre_completo || "—")}</td>
      </tr>
    `).join("");
  }

  function obtenerAlumnosSeleccionadosIds() {
    return Array.from(document.querySelectorAll(".alumno-check:checked"))
      .map(check => toInt(check.value, null))
      .filter(id => id !== null);
  }

  // =========================================================
  // REPORTE DE NOTAS
  // =========================================================
  async function obtenerReporteNotas() {
    const ciclo_id = toInt(comboCiclo?.value, null);

    if (!ciclo_id) {
      throw new Error("Debe seleccionar el bimestre");
    }

    if (!estado.anio || !estado.grado_id || !estado.seccion_id) {
      throw new Error("No se encontraron anio, grado_id o seccion_id en sessionStorage");
    }

    const esTodos = radioTodos?.checked;
    const alumnosSeleccionados = obtenerAlumnosSeleccionadosIds();

    if (!esTodos && alumnosSeleccionados.length === 0) {
      throw new Error("Debe seleccionar al menos un alumno");
    }

    const payload = {
      anio: estado.anio,
      grado_id: estado.grado_id,
      seccion_id: estado.seccion_id,
      ciclo_id,
      alumnos: esTodos ? null : alumnosSeleccionados
    };

    const result = await fetchJSON(URL_REPORTE_NOTAS, "POST", payload);
    return Array.isArray(result?.data) ? result.data : [];
  }

  function normalizarReporte(rows) {
    if (!Array.isArray(rows) || rows.length === 0) return [];

    const camposMeta = new Set([
      "alumno_id",
      "codigo_alumno",
      "nombre_completo",
      "bimestre_numero",
      "tipo_fila",
      "promedio_bimestre"
    ]);

    const mapaAlumnos = new Map();

    rows.forEach(row => {
      const alumnoId = row.alumno_id;

      if (!mapaAlumnos.has(alumnoId)) {
        mapaAlumnos.set(alumnoId, {
          alumno_id: alumnoId,
          codigo_alumno: row.codigo_alumno ?? "",
          nombre_completo: row.nombre_completo ?? "Alumno",
          materiasMap: {},
          promedio_unidades: {
            1: "----",
            2: "----",
            3: "----",
            4: "----"
          },
          promedio_final: "----"
        });
      }

      const alumno = mapaAlumnos.get(alumnoId);

      // Actualizar datos base
      alumno.codigo_alumno = row.codigo_alumno ?? alumno.codigo_alumno ?? "";
      alumno.nombre_completo = row.nombre_completo ?? alumno.nombre_completo ?? "Alumno";

      const bimestre = Number(row.bimestre_numero);
      const esPromedioFinal = String(row.tipo_fila || "").toUpperCase() === "PROMEDIO_FINAL";

      Object.keys(row).forEach(key => {
        if (camposMeta.has(key)) return;

        if (!alumno.materiasMap[key]) {
          alumno.materiasMap[key] = {
            materia: key,
            unidad1: "----",
            unidad2: "----",
            unidad3: "----",
            unidad4: "----",
            final: "----"
          };
        }

        const valor = row[key] ?? "----";

        if (esPromedioFinal) {
          alumno.materiasMap[key].final = valor === "" || valor === null ? "----" : valor;
        } else if (bimestre >= 1 && bimestre <= 4) {
          alumno.materiasMap[key][`unidad${bimestre}`] =
            valor === "" || valor === null ? "----" : valor;
        }
      });

      // Promedio por unidad
      if (esPromedioFinal) {
        alumno.promedio_final =
          row.promedio_bimestre === "" || row.promedio_bimestre == null
            ? "----"
            : row.promedio_bimestre;
      } else if (bimestre >= 1 && bimestre <= 4) {
        alumno.promedio_unidades[bimestre] =
          row.promedio_bimestre === "" || row.promedio_bimestre == null
            ? "----"
            : row.promedio_bimestre;
      }
    });

    return Array.from(mapaAlumnos.values()).map(alumno => ({
      alumno_id: alumno.alumno_id,
      codigo_alumno: alumno.codigo_alumno,
      nombre_completo: alumno.nombre_completo,
      materias: Object.values(alumno.materiasMap),
      promedio_unidades: alumno.promedio_unidades,
      promedio_final: alumno.promedio_final
    }));
  }

  // =========================================================
  // BOLETAS
  // =========================================================
  function generarBoletaHTML(boleta, cicloId) {
    const filasMaterias = boleta.materias.length
      ? boleta.materias.map(item => `
        <tr>
          <td class="text-start">${escapeHtml(item.materia)}</td>
          <td class="text-center">${escapeHtml(item.unidad1 || "----")}</td>
          <td class="text-center">${escapeHtml(item.unidad2 || "----")}</td>
          <td class="text-center">${escapeHtml(item.unidad3 || "----")}</td>
          <td class="text-center">${escapeHtml(item.unidad4 || "----")}</td>
          <td class="text-center">${escapeHtml(item.final || "----")}</td>
        </tr>
      `).join("")
      : `
        <tr>
          <td colspan="6" class="text-center text-muted">Sin datos</td>
        </tr>
      `;

    return `
    <div class="boleta-half">
      <div class="boleta-half__inner">
        <div class="boleta-head">
          <div class="boleta-head__logo">
            <img src="../../assets/img/LogoEscuela.png" alt="Logo Escuela">
          </div>
          <div class="boleta-head__title">
            <div class="school-name">ESCUELA OFICIAL RURAL MIXTA COLONIA LINDA VISTA</div>
            <div class="report-title">BOLETA DE CALIFICACIONES</div>
            <div class="report-subtitle">${escapeHtml(getBimestreTexto(cicloId))} - ${escapeHtml(estado.anio)}</div>
          </div>
        </div>

        <div class="boleta-info">
          <div><strong>Alumno:</strong> ${escapeHtml(boleta.nombre_completo)}</div>
          <div><strong>Código:</strong> ${escapeHtml(boleta.codigo_alumno || "—")}</div>
          <div><strong>Grado:</strong> ${escapeHtml(estado.grado_id)} &nbsp;&nbsp; <strong>Sección:</strong> ${escapeHtml(estado.seccion_id)}</div>
          <div><strong>Fecha:</strong> ${escapeHtml(formatDateLong())}</div>
        </div>

        <table class="boleta-table-print">
          <thead>
            <tr>
              <th rowspan="2" class="area-col">Área curricular</th>
              <th colspan="4">Unidades</th>
              <th rowspan="2" class="final-col">Nota final</th>
            </tr>
            <tr>
              <th class="unidad-col">1</th>
              <th class="unidad-col">2</th>
              <th class="unidad-col">3</th>
              <th class="unidad-col">4</th>
            </tr>
          </thead>
          <tbody>
            ${filasMaterias}
            <tr>
              <td><strong>Promedio</strong></td>
              <td class="text-center"><strong>${escapeHtml(boleta.promedio_unidades?.[1] || "----")}</strong></td>
              <td class="text-center"><strong>${escapeHtml(boleta.promedio_unidades?.[2] || "----")}</strong></td>
              <td class="text-center"><strong>${escapeHtml(boleta.promedio_unidades?.[3] || "----")}</strong></td>
              <td class="text-center"><strong>${escapeHtml(boleta.promedio_unidades?.[4] || "----")}</strong></td>
              <td class="text-center"><strong>${escapeHtml(boleta.promedio_final || "----")}</strong></td>
            </tr>
          </tbody>
        </table>

        <div class="boleta-bottom">
          <div class="boleta-bottom-left">
            <div class="observaciones-block">
              <div class="observaciones-title"><strong>Observaciones:</strong></div>
              <div class="observacion-line"></div>
              <div class="observacion-line"></div>
            </div>

            <div class="boleta-signatures compact-signatures">
              <div class="firma-box">
                <div class="firma-line"></div>
                <div class="firma-label">Firma de Maestro</div>
              </div>
              <div class="firma-box">
                <div class="firma-line"></div>
                <div class="firma-label">Firma de Director</div>
              </div>
            </div>
          </div>

          <div class="boleta-bottom-right">
            <div class="sello-box">SELLO</div>
          </div>
        </div>
      </div>
    </div>
  `;
  }

  function generarVistaPreviaHTML(boletas, cicloId) {
    if (!boletas.length) {
      return `<div class="text-muted">No hay datos para mostrar</div>`;
    }

    return `
    <style>
      .preview-wrapper {
        display: flex;
        flex-direction: column;
        gap: 18px;
        align-items: center;
      }

      .boleta-half {
        width: 100%;
        max-width: 850px;
        border: 1px solid #000;
        background: #fff;
      }

      .boleta-half__inner {
        padding: 14px 16px;
        display: flex;
        flex-direction: column;
      }

      .boleta-head {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
      }

      .boleta-head__logo {
        width: 50px;
        height: 50px;
        flex-shrink: 0;
      }

      .boleta-head__logo img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .boleta-head__title {
        flex: 1;
        text-align: center;
      }

      .school-name {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        line-height: 1.2;
      }

      .report-title {
        font-size: 14px;
        font-weight: 700;
        margin-top: 2px;
      }

      .report-subtitle {
        font-size: 10px;
        margin-top: 2px;
      }

      .boleta-info {
        font-size: 10px;
        line-height: 1.35;
        margin-bottom: 8px;
        text-align: left;
      }

      .boleta-table-print {
        width: 100%;
        border-collapse: collapse;
        font-size: 10px;
      }

      .boleta-table-print th,
      .boleta-table-print td {
        border: 1px solid #000;
        padding: 3px 5px;
      }

      .boleta-table-print th {
        background: #f1f1f1;
        text-align: center;
        font-weight: 700;
      }

      .boleta-table-print .area-col {
        width: 40%;
      }

      .boleta-table-print .unidad-col {
        width: 10%;
      }

      .boleta-table-print .final-col {
        width: 14%;
      }

      .boleta-signatures {
        margin-top: 14px;
        display: flex;
        gap: 18px;
        justify-content: space-between;
      }

      .firma-box {
        flex: 1;
        text-align: center;
        font-size: 10px;
      }

      .firma-line {
        border-bottom: 1px solid #000;
        height: 20px;
        margin-bottom: 4px;
      }

      .boleta-bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 18px;
  margin-top: 10px;
}

.boleta-bottom-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.boleta-bottom-right {
  width: 120px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.observaciones-block {
  width: 100%;
  text-align: left;
  margin-bottom: 12px;
}

.observaciones-title {
  font-size: 10px;
  font-weight: 700;
  text-align: left;
  margin-bottom: 4px;
}

.observacion-line {
  width: 100%;
  border-bottom: 1px solid #000;
  height: 14px;
  margin-bottom: 4px;
}

.compact-signatures {
  display: flex;
  gap: 14px;
  justify-content: flex-start;
  margin-top: 2px;
}

.compact-signatures .firma-box {
  flex: 1;
  max-width: 180px;
  text-align: center;
  font-size: 10px;
}

.compact-signatures .firma-line {
  border-bottom: 1px solid #000;
  height: 18px;
  margin-bottom: 4px;
}

.sello-box {
  width: 100%;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  padding-bottom: 8px;
}
    </style>

    <div class="preview-wrapper">
      ${boletas.map(boleta => generarBoletaHTML(boleta, cicloId)).join("")}
    </div>
  `;
  }

  function generarDocumentoImpresion(boletas, cicloId) {
    const paginas = [];

    for (let i = 0; i < boletas.length; i += 2) {
      paginas.push(boletas.slice(i, i + 2));
    }

    const htmlPaginas = paginas.map(pagina => `
    <div class="page-letter">
      ${pagina.map(boleta => generarBoletaHTML(boleta, cicloId)).join("")}
    </div>
  `).join("");

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Boletas de Calificaciones</title>
      <style>
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          background: #fff;
          color: #000;
        }

        .page-letter {
          width: 8.5in;
          min-height: 11in;
          margin: 0 auto;
          padding: 0.22in;
          display: flex;
          flex-direction: column;
          gap: 0.16in;
          page-break-after: always;
        }

        .page-letter:last-child {
          page-break-after: auto;
        }

        .boleta-half {
          height: 5.15in;
          border: 1px solid #000;
          padding: 0;
        }

        .boleta-half__inner {
          height: 100%;
          padding: 0.12in 0.16in;
          display: flex;
          flex-direction: column;
        }

        .boleta-head {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .boleta-head__logo {
          width: 48px;
          height: 48px;
          flex-shrink: 0;
        }

        .boleta-head__logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .boleta-head__title {
          flex: 1;
          text-align: center;
        }

        .school-name {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          line-height: 1.2;
        }

        .report-title {
          font-size: 14px;
          font-weight: 700;
          margin-top: 2px;
        }

        .report-subtitle {
          font-size: 10px;
          margin-top: 2px;
        }

        .boleta-info {
          font-size: 10px;
          line-height: 1.3;
          margin-bottom: 8px;
        }

        .boleta-table-print {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
          margin-bottom: 8px;
        }

        .boleta-table-print th,
        .boleta-table-print td {
          border: 1px solid #000;
          padding: 3px 5px;
          vertical-align: middle;
        }

        .boleta-table-print th {
          background: #f1f1f1;
          text-align: center;
          font-weight: 700;
        }

        .boleta-table-print .area-col {
          width: 40%;
        }

        .boleta-table-print .unidad-col {
          width: 10%;
        }

        .boleta-table-print .final-col {
          width: 14%;
        }

        .boleta-signatures {
          margin-top: auto;
          display: flex;
          gap: 18px;
          justify-content: space-between;
        }

        .firma-box {
          flex: 1;
          text-align: center;
          font-size: 10px;
        }

        .firma-line {
          border-bottom: 1px solid #000;
          height: 20px;
          margin-bottom: 4px;
        }

        .boleta-bottom {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 18px;
          margin-top: 10px;
        }

        .boleta-bottom-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .boleta-bottom-right {
          width: 120px;
          display: flex;
          justify-content: center;
          align-items: flex-end;
        }

        .observaciones-block {
          width: 100%;
          text-align: left;
          margin-bottom: 12px;
        }

        .observaciones-title {
          font-size: 10px;
          font-weight: 700;
          text-align: left;
          margin-bottom: 4px;
        }

        .observacion-line {
          width: 100%;
          border-bottom: 1px solid #000;
          height: 14px;
          margin-bottom: 4px;
        }

        .compact-signatures {
          display: flex;
          gap: 14px;
          justify-content: flex-start;
          margin-top: 2px;
        }


        .compact-signatures .firma-box {
          flex: 1;
          max-width: 140px;
          text-align: center;
          font-size: 9px;
        }

        .compact-signatures .firma-line {
          border-bottom: 1px solid #000;
          height: 14px;
          margin-bottom: 3px;
        }

        .sello-box {
          width: 100%;
          text-align: center;
          font-size: 10px;
          font-weight: 700;
          padding-bottom: 6px;
        }

        @page {
          size: letter;
          margin: 0;
        }

        @media print {
          html, body {
            width: 8.5in;
            height: auto;
          }

          .page-letter {
            width: 8.5in;
            min-height: 11in;
            margin: 0;
            padding: 0.22in;
            page-break-after: always;
          }

          .page-letter:last-child {
            page-break-after: auto;
          }
        }
      </style>
    </head>
    <body>
      ${htmlPaginas}
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
  async function construirBoletasDesdeAPI() {
    const cicloId = toInt(comboCiclo?.value, null);

    if (!cicloId) {
      throw new Error("Debe seleccionar el bimestre");
    }

    const rows = await obtenerReporteNotas();
    const boletas = normalizarReporte(rows);

    if (!boletas.length) {
      throw new Error("No se encontraron datos para generar boletas");
    }

    estado.reporte = boletas;

    return {
      boletas,
      cicloId
    };
  }

  async function onVistaPrevia() {
    try {
      const { boletas, cicloId } = await construirBoletasDesdeAPI();

      boletaContainer.innerHTML = generarVistaPreviaHTML(boletas, cicloId);
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

  async function onGenerarBoleta() {
    try {
      const { boletas, cicloId } = await construirBoletasDesdeAPI();

      const htmlImpresion = generarDocumentoImpresion(boletas, cicloId);
      const win = window.open("", "_blank", "width=1000,height=800,scrollbars=yes");

      if (!win) {
        throw new Error("El navegador bloqueó la ventana emergente de impresión");
      }

      win.document.open();
      win.document.write(htmlImpresion);
      win.document.close();
    } catch (error) {
      console.error("Error al generar boletas:", error);
      alert(error.message || "No se pudo generar la boleta");
    }
  }

  // =========================================================
  // EVENTOS
  // =========================================================
  function bindEvents() {
    radioEspecifico?.addEventListener("change", actualizarModoImpresionUI);
    radioTodos?.addEventListener("change", actualizarModoImpresionUI);

    btnVistaPrevia?.addEventListener("click", onVistaPrevia);
    btnGenerarBoleta?.addEventListener("click", onGenerarBoleta);
  }

  // =========================================================
  // INIT
  // =========================================================
  async function init() {
    const datos = obtenerDatosSessionStorage();

    estado.anio = datos.anio;
    estado.grado_id = datos.grado_id;
    estado.seccion_id = datos.seccion_id;

    actualizarModoImpresionUI();
    bindEvents();
    await cargarAlumnos();
  }

  document.addEventListener("DOMContentLoaded", init);
})();