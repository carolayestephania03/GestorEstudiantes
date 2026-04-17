document.addEventListener("DOMContentLoaded", function () {
  /* =========================================================
     DOM
  ========================================================= */
  const comboCiclo = document.getElementById("combo_ciclo_direc");

  const radioMateriaEspecifica = document.getElementById("MateriaEspecifica");
  const radioTodasMaterias = document.getElementById("todasMaterias");

  const btnGenerar = document.getElementById("btnGenerarListaDeCotejo");
  const btnVistaPrevia = document.getElementById("btnVistaPreviaListaCotejo");

  const tableBodyMaterias = document.getElementById("tableBodyMateriasLista");
  const vistaPreviaContainer = document.getElementById("vistaPreviaContainerLista");
  const listaDeCotejoContainer = document.getElementById("listaDeCotejoContainer");

  const tablaCol = tableBodyMaterias?.closest(".col-12.col-lg-8.col-xl-6");
  const imagenCol = document
    .querySelector('img[alt="Imagen de lista de Cotejo"]')
    ?.closest(".col-12.col-lg-3");

  const clasesOriginalesImagen = imagenCol ? [...imagenCol.classList] : [];

  /* =========================================================
     CONFIG
  ========================================================= */
  const URL_MATERIA = "http://localhost:8001/materia";
  const URL_LISTA_COTEJO = "http://localhost:8001/calificacion/reporteNotasListaCotejo";

  // AJUSTA ESTA RUTA SI TU ENDPOINT REAL ES OTRO
  const URL_ACTITUDINAL = "http://localhost:8001/Actitudinal/obtenerActitudinal";

  /* =========================================================
     ESTADO
  ========================================================= */
  const state = {
    anio: new Date().getFullYear(),
    grado_id: null,
    seccion_id: null,
    seccion_desc: "",
    docente: "",
    materias: [],
    reporte: [],
    reporteActitudinal: null,
    cacheMaterias: null,
    cacheReporte: new Map(),
    cacheActitudinal: new Map()
  };

  /* =========================================================
     HELPERS
  ========================================================= */
  function toInt(value, fallback = null) {
    const n = parseInt(value, 10);
    return Number.isFinite(n) ? n : fallback;
  }

  function toNumber(value, fallback = 0) {
    const n = Number(value);
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

  function getSessionData() {
    let userData = null;

    try {
      const raw = sessionStorage.getItem("userData");
      userData = raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error("No se pudo leer userData:", error);
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

    const seccionTextoMap = {
      a: "A",
      b: "B",
      "1": "A",
      "2": "B"
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

    let seccion_desc = String(
      userData?.seccion_desc ??
      userData?.seccion_actual_desc ??
      userData?.maestro_seccion_desc ??
      userData?.maestro_seccion_actual_desc ??
      ""
    ).trim().toUpperCase();

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

      if (!seccion_desc) {
        seccion_desc = seccionTextoMap[seccionTexto] ?? "";
      }
    }

    if (!seccion_desc) {
      if (Number(seccion_id) === 1) seccion_desc = "A";
      else if (Number(seccion_id) === 2) seccion_desc = "B";
    }

    const anio = toInt(
      userData?.maestro_anio_actual ??
      userData?.anio_actual ??
      userData?.anio,
      new Date().getFullYear()
    );

    const docente = [
      userData?.persona_nombre ?? "",
      userData?.persona_apellido ?? ""
    ].join(" ").trim() || "______________________________";

    return { grado_id, seccion_id, seccion_desc, anio, docente };
  }

  function getReporteCacheKey({ grado_id, seccion_id, anio, ciclo_id }) {
    return `${grado_id}|${seccion_id}|${anio}|${ciclo_id}`;
  }

  function getBimestreTexto() {
    return comboCiclo?.selectedOptions?.[0]?.textContent?.trim() || "";
  }

  function showMateriasTableMessage(msg, className = "text-muted") {
    if (!tableBodyMaterias) return;

    tableBodyMaterias.innerHTML = `
      <tr>
        <td colspan="2" class="text-center py-3 ${className}">
          ${escapeHtml(msg)}
        </td>
      </tr>
    `;
  }

  async function fetchJSON(url, method = "GET", payload = null) {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include"
    };

    if (payload) {
      options.body = JSON.stringify(payload);
    }

    const response = await fetch(url, options);
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message =
        result?.error ||
        (Array.isArray(result?.errors) ? result.errors.map(e => e.msg).join("\n") : null) ||
        `Error HTTP ${response.status}`;

      throw new Error(message);
    }

    return result;
  }

  function actualizarModoSeleccion() {
    const esTodas = radioTodasMaterias?.checked;

    if (!tablaCol || !imagenCol) return;

    if (esTodas) {
      tablaCol.classList.add("d-none");
      imagenCol.className = "";
      imagenCol.classList.add("col-12", "col-lg-8", "col-xl-9");
    } else {
      tablaCol.classList.remove("d-none");
      imagenCol.className = "";
      clasesOriginalesImagen.forEach(cls => imagenCol.classList.add(cls));
    }
  }

  /* =========================================================
     MATERIAS
  ========================================================= */
  async function cargarMaterias() {
    if (!state.grado_id || !state.seccion_id) {
      showMateriasTableMessage("No se encontró grado y sección en sesión", "text-danger");
      return;
    }

    showMateriasTableMessage("Cargando materias...");

    try {
      if (state.cacheMaterias) {
        state.materias = state.cacheMaterias;
        renderMateriasTable();
        return;
      }

      const result = await fetchJSON(URL_MATERIA, "GET");
      const materias = Array.isArray(result?.data) ? result.data : [];

      state.materias = materias.filter(m => m.estado === true);
      state.cacheMaterias = state.materias;

      renderMateriasTable();
    } catch (error) {
      console.error("Error al cargar materias:", error);
      showMateriasTableMessage(error.message || "Error al cargar materias", "text-danger");
    }
  }

  function renderMateriasTable() {
    if (!tableBodyMaterias) return;

    if (!Array.isArray(state.materias) || state.materias.length === 0) {
      showMateriasTableMessage("No se encontraron materias");
      return;
    }

    tableBodyMaterias.innerHTML = state.materias.map(materia => `
      <tr>
        <td class="text-center">
          <input
            type="checkbox"
            class="form-check-input materia-check"
            value="${escapeHtml(materia.materia_id)}"
          >
        </td>
        <td>${escapeHtml(materia.nombre_materia)}</td>
      </tr>
    `).join("");
  }

  function getSelectedMateriaIds() {
    return Array.from(document.querySelectorAll(".materia-check:checked"))
      .map(check => toInt(check.value, null))
      .filter(id => id !== null);
  }

  /* =========================================================
     REPORTE PRINCIPAL
  ========================================================= */
  async function obtenerReporteListaCotejo() {
    const ciclo_id = toInt(comboCiclo?.value, null);

    if (!ciclo_id) {
      throw new Error("Debe seleccionar el bimestre");
    }

    if (!state.grado_id || !state.seccion_id || !state.anio) {
      throw new Error("No se encontró grado, sección o año en sesión");
    }

    const payload = {
      grado_id: state.grado_id,
      seccion_id: state.seccion_id,
      ciclo_id,
      anio: state.anio
    };

    const cacheKey = getReporteCacheKey(payload);
    if (state.cacheReporte.has(cacheKey)) {
      return state.cacheReporte.get(cacheKey);
    }

    const result = await fetchJSON(URL_LISTA_COTEJO, "POST", payload);
    const data = Array.isArray(result?.data) ? result.data : [];

    state.cacheReporte.set(cacheKey, data);
    return data;
  }

  async function obtenerReporteActitudinal() {
    const ciclo_id = toInt(comboCiclo?.value, null);

    if (!ciclo_id) {
      throw new Error("Debe seleccionar el bimestre");
    }

    if (!state.grado_id || !state.seccion_id || !state.anio) {
      throw new Error("No se encontró grado, sección o año en sesión");
    }

    const payload = {
      grado_id: state.grado_id,
      seccion_id: state.seccion_id,
      ciclo_id,
      anio: state.anio
    };

    const cacheKey = getReporteCacheKey(payload);
    if (state.cacheActitudinal.has(cacheKey)) {
      return state.cacheActitudinal.get(cacheKey);
    }

    const result = await fetchJSON(URL_ACTITUDINAL, "POST", payload);

    const data = {
      message: result?.message || "",
      configuracion: result?.configuracion || {},
      total_alumnos: toInt(result?.total_alumnos, 0),
      alumnos: Array.isArray(result?.alumnos) ? result.alumnos : []
    };

    state.cacheActitudinal.set(cacheKey, data);
    return data;
  }

  function filtrarReportePorMaterias(reporte, materiaIds) {
    if (!Array.isArray(reporte)) return [];

    if (radioTodasMaterias?.checked) {
      return reporte;
    }

    if (!Array.isArray(materiaIds) || materiaIds.length === 0) {
      return [];
    }

    const idsSet = new Set(materiaIds.map(Number));

    return reporte.filter(item => {
      const materia = state.materias.find(
        m => String(m.nombre_materia).trim().toLowerCase() === String(item.nombre_materia).trim().toLowerCase()
      );
      if (!materia) return false;
      return idsSet.has(Number(materia.materia_id));
    });
  }

  function normalizeTipoBucket(tipoTarea) {
    const tipo = String(tipoTarea || "").trim().toLowerCase();

    if (tipo.includes("actitud")) return "actitudinal";
    if (tipo.includes("declar")) return "declarativo";
    if (tipo.includes("examen")) return "procedimental";

    return "procedimental";
  }

  function agruparReportePorMateria(reporteFiltrado) {
    const mapa = new Map();

    reporteFiltrado.forEach(item => {
      const nombreMateria = item.nombre_materia || "Materia";
      const tipoTarea = item.tipo_tarea || "Sin tipo";
      const tareas = Array.isArray(item.tareas) ? item.tareas : [];

      if (!mapa.has(nombreMateria)) {
        mapa.set(nombreMateria, {
          nombre_materia: nombreMateria,
          tareas_por_tipo: {
            procedimental: [],
            actitudinal: [],
            declarativo: []
          },
          alumnosMap: new Map()
        });
      }

      const materiaGroup = mapa.get(nombreMateria);
      const bucket = normalizeTipoBucket(tipoTarea);

      tareas.forEach(tarea => {
        const alumnos = Array.isArray(tarea.alumnos) ? tarea.alumnos : [];

        materiaGroup.tareas_por_tipo[bucket].push({
          actividad_id: tarea.actividad_id,
          nombre_actividad: tarea.nombre_actividad,
          descripcion: tarea.descripcion,
          fecha_entrega: tarea.fecha_entrega,
          puntaje_maximo: toNumber(tarea.puntaje_maximo, 0),
          tipo_tarea: tipoTarea,
          alumnos
        });

        alumnos.forEach(alumno => {
          if (!materiaGroup.alumnosMap.has(alumno.alumno_id)) {
            materiaGroup.alumnosMap.set(alumno.alumno_id, {
              alumno_id: alumno.alumno_id,
              codigo_alumno: alumno.codigo_alumno,
              nombre_completo: alumno.nombre_completo,
              notas_tareas: {},
              notas_actitudinal: {}
            });
          }
        });
      });
    });

    return Array.from(mapa.values()).map(materia => ({
      nombre_materia: materia.nombre_materia,
      tareas_por_tipo: materia.tareas_por_tipo,
      alumnos: Array.from(materia.alumnosMap.values()).sort((a, b) =>
        String(a.nombre_completo).localeCompare(String(b.nombre_completo), "es")
      )
    }));
  }

  function normalizarActitudinal(dataActitudinal) {
    const topicosMap = new Map();

    for (const alumno of (dataActitudinal?.alumnos || [])) {
      for (const detalle of (alumno.detalles || [])) {
        if (!topicosMap.has(detalle.topico_id)) {
          topicosMap.set(detalle.topico_id, {
            configuracion_detalle_id: detalle.configuracion_detalle_id,
            topico_id: detalle.topico_id,
            nombre_topico: detalle.nombre_topico || "Tópico",
            puntaje_maximo_topico: toNumber(detalle.puntaje_maximo_topico, 0)
          });
        }
      }
    }

    return {
      configuracion: dataActitudinal?.configuracion || {},
      topicos: Array.from(topicosMap.values()),
      alumnos: Array.isArray(dataActitudinal?.alumnos) ? dataActitudinal.alumnos : []
    };
  }

  function mergeActitudinalEnMaterias(materiasAgrupadas, actitudinalNormalizado) {
    const topicos = actitudinalNormalizado.topicos || [];
    const alumnosActitudinal = Array.isArray(actitudinalNormalizado.alumnos)
      ? actitudinalNormalizado.alumnos
      : [];

    materiasAgrupadas.forEach(materia => {
      const alumnosMap = new Map(
        (materia.alumnos || []).map(a => [Number(a.alumno_id), a])
      );

      alumnosActitudinal.forEach(alumnoAct => {
        const alumnoId = Number(alumnoAct.alumno_id);

        if (!alumnosMap.has(alumnoId)) {
          alumnosMap.set(alumnoId, {
            alumno_id: alumnoAct.alumno_id,
            codigo_alumno: alumnoAct.codigo_alumno,
            nombre_completo: alumnoAct.nombre_completo,
            notas_tareas: {},
            notas_actitudinal: {}
          });
        }

        const alumnoRef = alumnosMap.get(alumnoId);

        if (!alumnoRef.notas_actitudinal) {
          alumnoRef.notas_actitudinal = {};
        }

        (alumnoAct.detalles || []).forEach(det => {
          alumnoRef.notas_actitudinal[det.topico_id] = toNumber(det.puntaje_obtenido, 0);
        });
      });

      materia.alumnos = Array.from(alumnosMap.values()).sort((a, b) =>
        String(a.nombre_completo).localeCompare(String(b.nombre_completo), "es")
      );

      materia.actitudinal_topicos = topicos;
      materia.configuracion_actitudinal = actitudinalNormalizado.configuracion || {};

      ["procedimental", "declarativo"].forEach(tipo => {
        (materia.tareas_por_tipo[tipo] || []).forEach(tarea => {
          (tarea.alumnos || []).forEach(alumnoNota => {
            const alumnoRef = materia.alumnos.find(a => Number(a.alumno_id) === Number(alumnoNota.alumno_id));
            if (!alumnoRef) return;

            if (!alumnoRef.notas_tareas) {
              alumnoRef.notas_tareas = {};
            }

            alumnoRef.notas_tareas[tarea.actividad_id] = toNumber(alumnoNota.nota_obtenida, 0);
          });
        });
      });
    });

    return materiasAgrupadas;
  }

  function getNotaAlumnoEnTarea(tarea, alumnoId) {
    const alumno = (tarea.alumnos || []).find(a => Number(a.alumno_id) === Number(alumnoId));
    if (!alumno) return "";
    return toNumber(alumno.nota_obtenida, 0);
  }

  function getNotaAlumnoEnTopico(alumno, topicoId) {
    return toNumber(alumno?.notas_actitudinal?.[topicoId], 0);
  }

  function truncateLabel(text, max = 14) {
    const value = String(text || "").trim();
    if (!value) return "";
    return value.length > max ? value.slice(0, max - 1) + "…" : value;
  }

  function sumarArrayNumeros(arr) {
    return (arr || []).reduce((acc, n) => acc + toNumber(n, 0), 0);
  }

  async function construirListas() {
    const ciclo_id = toInt(comboCiclo?.value, null);

    if (!ciclo_id) {
      throw new Error("Debe seleccionar el bimestre");
    }

    const [reporte, reporteActitudinal] = await Promise.all([
      obtenerReporteListaCotejo(),
      obtenerReporteActitudinal()
    ]);

    state.reporte = reporte;
    state.reporteActitudinal = reporteActitudinal;

    const materiaIds = getSelectedMateriaIds();
    const filtrado = filtrarReportePorMaterias(reporte, materiaIds);

    if (!radioTodasMaterias?.checked && materiaIds.length === 0) {
      throw new Error("Debe seleccionar al menos una materia");
    }

    if (!filtrado.length) {
      throw new Error("No se encontraron tareas calificadas para las materias seleccionadas");
    }

    const materiasAgrupadas = agruparReportePorMateria(filtrado);
    const actitudinalNormalizado = normalizarActitudinal(reporteActitudinal);

    return mergeActitudinalEnMaterias(materiasAgrupadas, actitudinalNormalizado);
  }

  /* =========================================================
   BLOQUES INFERIORES
========================================================= */
  function getInferiorRowsActividades(tareas) {
    const lista = Array.isArray(tareas) ? tareas : [];

    return lista.map((tarea, index) => ({
      no: index + 1,
      nombre: tarea?.nombre_actividad || "__________________________",
      punteo: toNumber(tarea?.puntaje_maximo, 0)
    }));
  }

  function getInferiorRowsActitudinal(topicos) {
    const lista = Array.isArray(topicos) ? topicos : [];

    return lista.map((topico, index) => ({
      no: index + 1,
      nombre: topico?.nombre_topico || "__________________________",
      punteo: toNumber(topico?.puntaje_maximo_topico, 0)
    }));
  }

  function renderInferiorBlock(title, rows) {
    const contenido = rows.length
      ? rows.map(row => `
          <div class="inferior-row">
            <div class="inferior-no">${escapeHtml(row.no)}</div>
            <div class="inferior-actividad">${escapeHtml(row.nombre)}</div>
            <div class="inferior-punteo">${escapeHtml(row.punteo)}</div>
          </div>
        `).join("")
      : `
        <div class="inferior-row">
          <div class="inferior-no">—</div>
          <div class="inferior-actividad">Sin datos</div>
          <div class="inferior-punteo">—</div>
        </div>
      `;

    return `
      <div class="inferior-block">
        <div class="inferior-block-title">${escapeHtml(title)}</div>

        <div class="inferior-block-header">
          <div>No.</div>
          <div>Nombre</div>
          <div>Punteo</div>
        </div>

        ${contenido}
      </div>
    `;
  }

  /* =========================================================
     CALCULOS DE FILA
  ========================================================= */
  function calcularTotalProcedimentalAlumno(alumno, procedimentales) {
    return sumarArrayNumeros(
      procedimentales.map(t => alumno?.notas_tareas?.[t.actividad_id] || 0)
    );
  }

  function calcularTotalDeclarativoAlumno(alumno, declarativos) {
    return sumarArrayNumeros(
      declarativos.map(t => alumno?.notas_tareas?.[t.actividad_id] || 0)
    );
  }

  function calcularTotalActitudinalAlumno(alumno, topicos) {
    return sumarArrayNumeros(
      topicos.map(t => alumno?.notas_actitudinal?.[t.topico_id] || 0)
    );
  }

  function calcularNotaFinalAlumno(alumno, procedimentales, declarativos, topicos) {
    return (
      calcularTotalProcedimentalAlumno(alumno, procedimentales) +
      calcularTotalActitudinalAlumno(alumno, topicos) +
      calcularTotalDeclarativoAlumno(alumno, declarativos)
    );
  }

  /* =========================================================
     HTML DE LA LISTA
  ========================================================= */
  function generarHTMLListaCotejo(materiaData) {
    const procedimentales = Array.isArray(materiaData.tareas_por_tipo?.procedimental)
      ? materiaData.tareas_por_tipo.procedimental
      : [];

    const declarativos = Array.isArray(materiaData.tareas_por_tipo?.declarativo)
      ? materiaData.tareas_por_tipo.declarativo
      : [];

    const topicosActitudinal = Array.isArray(materiaData.actitudinal_topicos)
      ? materiaData.actitudinal_topicos
      : [];

    const alumnos = Array.isArray(materiaData.alumnos) ? materiaData.alumnos : [];
    const totalFilas = alumnos.length;

    let filasEstudiantes = "";

    for (let i = 0; i < totalFilas; i++) {
      const alumno = alumnos[i];
      const alumnoId = alumno?.alumno_id ?? null;
      const nombreAlumno = alumno?.nombre_completo ?? "";

      const procNotas = procedimentales.map(t =>
        alumnoId ? getNotaAlumnoEnTarea(t, alumnoId) : ""
      );

      const decNotas = declarativos.map(t =>
        alumnoId ? getNotaAlumnoEnTarea(t, alumnoId) : ""
      );

      const actNotas = topicosActitudinal.map(top =>
        alumnoId ? getNotaAlumnoEnTopico(alumno, top.topico_id) : ""
      );

      const totalProcedimental = calcularTotalProcedimentalAlumno(alumno, procedimentales);
      const totalActitudinal = calcularTotalActitudinalAlumno(alumno, topicosActitudinal);
      const totalDeclarativo = calcularTotalDeclarativoAlumno(alumno, declarativos);
      const notaFinal = calcularNotaFinalAlumno(alumno, procedimentales, declarativos, topicosActitudinal);

      filasEstudiantes += `
  <tr>
    <td class="col-no">${i + 1}.</td>
    <td class="col-nombre nombre-alumno-cell">${escapeHtml(nombreAlumno)}</td>

    ${procedimentales.map((_, idx) => `
      <td class="col-procedimental">${escapeHtml(procNotas[idx] ?? "")}</td>
    `).join("")}
    <td class="col-procedimental procedimental-total">${escapeHtml(totalProcedimental)}</td>

    ${topicosActitudinal.map((_, idx) => `
      <td class="col-actitudinal-cell">${escapeHtml(actNotas[idx] ?? "")}</td>
    `).join("")}
    <td class="col-actitudinal-cell actitudinal-total">${escapeHtml(totalActitudinal)}</td>

    ${declarativos.map((_, idx) => `
      <td class="col-declarativo">${escapeHtml(decNotas[idx] ?? "")}</td>
    `).join("")}
    <td class="col-declarativo declarativo-total">${escapeHtml(totalDeclarativo)}</td>

    <td class="col-final total-final-cell">${escapeHtml(notaFinal)}</td>
  </tr>
`;
    }

    const procHeaders = procedimentales.map((item, index) =>
      truncateLabel(String(index + 1), 14)
    );

    const actHeaders = topicosActitudinal.map((item, index) =>
      truncateLabel(String(index + 1), 14)
    );

    const decHeaders = declarativos.map((item, index) =>
      truncateLabel(String(index + 1), 14)
    );

    const procedimentalRows = getInferiorRowsActividades(procedimentales);
    const declarativoRows = getInferiorRowsActividades(declarativos);
    const actitudinalRows = getInferiorRowsActitudinal(topicosActitudinal);

    const totalColsProcedimental = procedimentales.length + 1;
    const totalColsActitudinal = topicosActitudinal.length + 1;
    const totalColsDeclarativo = declarativos.length + 1;

    return `
      <div class="lista-cotejo-page">
        <div class="lista-header">
          <div class="lista-title">
            <h1>Escuela Oficial Rural Mixta Colonia Linda Vista</h1>
          </div>
          <div class="lista-logo">
            <img src="../../assets/img/LogoEscuela.png" alt="Logo" crossorigin="anonymous">
          </div>
        </div>

        <div class="lista-info">
          <div class="lista-info-row">
            <div class="lista-info-field">
              <label>Docente:</label>
              <span>${escapeHtml(state.docente)}</span>
            </div>
            <div class="lista-info-field">
              <label>Bloque:</label>
              <span>${escapeHtml(getBimestreTexto())}</span>
            </div>
          </div>
          <div class="lista-info-row">
            <div class="lista-info-field">
              <label>CICLO ESCOLAR:</label>
              <span>${escapeHtml(state.anio)}</span>
            </div>
            <div class="lista-info-field">
              <label>ÁREA:</label>
              <span>${escapeHtml(materiaData.nombre_materia)}</span>
            </div>
          </div>
          <div class="lista-info-row">
            <div class="lista-info-field">
              <label>GRADO:</label>
              <span>${escapeHtml(state.grado_id)}</span>
            </div>
            <div class="lista-info-field">
              <label>SECCIÓN:</label>
              <span>${escapeHtml(state.seccion_desc)}</span>
            </div>
          </div>
        </div>

        <div class="lista-table-container">
          <table class="lista-table">
           <thead>
  <tr class="header-main">
    <th colspan="2" class="col-nombres-green" rowspan="2">Nombre del alumno</th>

    <th class="procedimental-main" colspan="${totalColsProcedimental}">
      Procedimentales (Psicomotriz)
    </th>

    <th class="actitudinal-main" colspan="${totalColsActitudinal}">
      Actitudinal (Afectivo)
    </th>

    <th class="declarativo-main" colspan="${totalColsDeclarativo}">
      Declarativos (Cognoscitivo)
    </th>

    <th class="nota-final-main" rowspan="2">Nota final</th>
  </tr>

  <tr class="header-sub">
    <th class="procedimental-sub" colspan="${totalColsProcedimental}">
      Trabajos, proyectos o ejercicios
    </th>
    <th class="actitudinal-sub" colspan="${totalColsActitudinal}">
      Tópicos actitudinales
    </th>
    <th class="declarativo-sub" colspan="${totalColsDeclarativo}">
      Evaluaciones
    </th>
  </tr>

  <tr class="header-sub">
    <th class="col-nombres-green">No</th>
    <th class="nombre-alumno-header" style="text-align:center; text-decoration: underline;">
      Nombre del alumno
    </th>

    ${procedimentales.map((p, idx) => `
      <th
        class="procedimental-num"
        title="${escapeHtml(p?.nombre_actividad || "")}">
        ${escapeHtml(procHeaders[idx] || String(idx + 1))}
      </th>
    `).join("")}
    <th class="procedimental-total">Total</th>

    ${topicosActitudinal.map((a, idx) => `
      <th
        class="actitudinal-num"
        title="${escapeHtml(a?.nombre_topico || "")}">
        ${escapeHtml(actHeaders[idx] || String(idx + 1))}
      </th>
    `).join("")}
    <th class="actitudinal-total">Total</th>

    ${declarativos.map((d, idx) => `
      <th
        class="declarativo-num"
        title="${escapeHtml(d?.nombre_actividad || "")}">
        ${escapeHtml(decHeaders[idx] || String(idx + 1))}
      </th>
    `).join("")}
    <th class="declarativo-total">Total</th>

    <th class="nota-final-sub">100 Pts.</th>
  </tr>
</thead>

            <tbody>
              ${filasEstudiantes}
            </tbody>
          </table>
        </div>

        <div class="lista-bottom-grid">
          ${renderInferiorBlock("Procedimentales", procedimentalRows)}
          ${renderInferiorBlock("Actitudinal", actitudinalRows)}
          ${renderInferiorBlock("Declarativos", declarativoRows)}
        </div>

        <div class="lista-firmas duplicated">
          <div class="lista-firma-row">
            <div class="lista-firma-item">
              <div class="lista-firma-linea"></div>
              <div class="lista-firma-label">Docente</div>
            </div>
            <div class="lista-firma-item">
              <div class="lista-firma-linea"></div>
              <div class="lista-firma-label">Vo. Bo Directora</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* =========================================================
     CSS EMBEBIDO PARA PREVIEW / PDF
  ========================================================= */
  function getListaCotejoStyles() {
    return `
    <style>
      html, body {
        background: #fff;
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }

      .lista-cotejo-page {
        width: 100%;
        max-width: 8.14in;
        min-height: auto;
        background: #fff;
        color: #000;
        font-family: Arial, sans-serif;
        font-size: 8px;
        padding: 0.12in 0.12in;
        box-sizing: border-box;
        page-break-after: always;
        display: block;
        margin: 0 auto 18px auto;
      }

      .lista-cotejo-page:last-child {
        page-break-after: auto;
      }

      .lista-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 4px;
      }

      .lista-title {
        flex: 1;
        text-align: center;
        padding-left: 35px;
      }

      .lista-title h1 {
        margin: 0;
        font-size: 11px;
        font-weight: 700;
      }

      .lista-logo {
        width: 38px;
        height: 38px;
        flex-shrink: 0;
      }

      .lista-logo img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .lista-info {
        font-size: 8px;
        margin-bottom: 4px;
      }

      .lista-info-row {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 2px;
      }

      .lista-info-field {
        flex: 1;
      }

      .lista-info-field label {
        font-weight: 700;
        margin-right: 4px;
      }

      .lista-table-container {
        width: 100%;
        overflow: hidden;
      }

      .lista-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        font-size: 7px;
      }

      .lista-table th,
      .lista-table td {
        border: 1px solid #000;
        padding: 1px 1px;
        vertical-align: middle;
        text-align: center;
        word-break: break-word;
        line-height: 1.1;
      }

      .lista-table .col-no {
        width: 4%;
        background: #90ee90 !important;
      }

      .lista-table .col-nombre {
        width: 20%;
        text-align: left;
        padding-left: 3px;
      }

      .lista-table .col-procedimental,
      .lista-table .col-actitudinal-cell,
      .lista-table .col-declarativo,
      .lista-table .col-final {
        width: 4%;
      }

      .header-main th,
      .header-sub th {
        font-weight: 700;
      }

      /* ===== NOMBRE DEL ALUMNO ===== */
      .col-nombres-green {
        background: #90ee90 !important;
      }

      .nombre-alumno-header {
        background: #ffffff !important;
      }

      .nombre-alumno-cell {
        background: #ffffff !important;
      }

      /* ===== PROCEDIMENTALES ===== */
      .procedimental-main {
        background: #ffeaa7 !important;
      }

      .procedimental-sub {
        background: #ffeaa7 !important;
      }

      .procedimental-num {
        background: #ffeaa7 !important;
      }

      .procedimental-total {
        background: #ffeaa7 !important;
        font-weight: 700;
      }

      /* ===== ACTITUDINAL ===== */
      .actitudinal-main {
        background: #ffb6b9 !important;
      }

      .actitudinal-sub {
        background: #ffb6b9 !important;
      }

      .actitudinal-num {
        background: #ffb6b9 !important;
      }

      .actitudinal-total {
        background: #ffb6b9 !important;
        font-weight: 700;
      }

      /* ===== DECLARATIVOS ===== */
      .declarativo-main {
        background: #c8e6c9 !important;
      }

      .declarativo-sub {
        background: #d9f0da !important;
      }

      .declarativo-num {
        background: #e8f7e8 !important;
      }

      .declarativo-total {
        background: #c8e6c9 !important;
        font-weight: 700;
      }

      /* ===== NOTA FINAL ===== */
      .nota-final-main,
      .nota-final-sub,
      .nota-final-cell,
      .total-final-cell {
        background: #b3d9ff !important;
        font-weight: 700;
      }

      .total-cell {
        font-weight: 700;
      }

      .lista-bottom-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px 14px;
        margin-top: 8px;
      }

      .inferior-block {
        font-size: 8px;
      }

      .inferior-block-title {
        font-weight: 700;
        margin-bottom: 3px;
      }

      .inferior-block-header,
      .inferior-row {
        display: grid;
        grid-template-columns: 32px 1fr 42px;
        gap: 6px;
        align-items: end;
      }

      .inferior-block-header {
        font-weight: 700;
        margin-bottom: 2px;
      }

      .inferior-row {
        margin-bottom: 2px;
      }

      .inferior-no {
        border-bottom: 1px solid #000;
        min-height: 12px;
        line-height: 11px;
        text-align: center;
      }

      .inferior-actividad {
        border-bottom: 1px solid #000;
        min-height: 12px;
        line-height: 11px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .inferior-punteo {
        border-bottom: 1px solid #000;
        min-height: 12px;
        text-align: center;
        line-height: 11px;
      }

      .lista-firmas.duplicated {
        margin-top: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .lista-firma-row {
        display: flex;
        justify-content: space-between;
        gap: 18px;
      }

      .lista-firma-item {
        flex: 1;
        text-align: center;
        font-size: 8px;
      }

      .lista-firma-linea {
        border-bottom: 1px solid #000;
        height: 12px;
        margin-bottom: 3px;
        width: 78%;
        margin-left: auto;
        margin-right: auto;
      }

      .lista-firma-label {
        font-weight: 400;
      }

      @page {
        size: letter portrait;
        margin: 0.18in;
      }

      @media print {
        html, body {
          width: 8.5in;
          height: auto;
          margin: 0;
          padding: 0;
          background: #fff !important;
          font-family: Arial, sans-serif;
          font-size: 9px;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }

        .lista-cotejo-page {
          width: 8.14in;
          min-height: 10.6in;
          margin: 0;
          padding: 0.18in 0.18in;
          box-shadow: none;
          page-break-after: always;
          font-size: 9px;
        }

        .lista-cotejo-page:last-child {
          page-break-after: auto;
        }

        .lista-title h1 {
          font-size: 13px;
        }

        .lista-logo {
          width: 46px;
          height: 46px;
        }

        .lista-info {
          font-size: 9px;
          margin-bottom: 6px;
        }

        .lista-info-row {
          gap: 12px;
          margin-bottom: 3px;
        }

        .lista-table {
          font-size: 8px;
        }

        .lista-table th,
        .lista-table td {
          padding: 2px 2px;
          line-height: 1.15;
        }

        .lista-bottom-grid {
          gap: 10px;
          margin-top: 10px;
        }

        .inferior-block {
          font-size: 9px;
        }

        .inferior-block-header,
        .inferior-row {
          grid-template-columns: 40px 1fr 55px;
          gap: 8px;
        }

        .inferior-no,
        .inferior-actividad,
        .inferior-punteo {
          min-height: 14px;
          line-height: 13px;
        }

        .lista-firmas.duplicated {
          margin-top: 14px;
          gap: 16px;
        }

        .lista-firma-row {
          gap: 24px;
        }

        .lista-firma-item {
          font-size: 9px;
        }

        .lista-firma-linea {
          height: 18px;
        }
      }
    </style>
  `;
  }

  /* =========================================================
     VISTA PREVIA
  ========================================================= */
  async function generarVistaPrevia() {
    try {
      const listas = await construirListas();

      listaDeCotejoContainer.innerHTML =
        getListaCotejoStyles() +
        listas.map(materia => generarHTMLListaCotejo(materia)).join("");

      vistaPreviaContainer.classList.remove("d-none");
      vistaPreviaContainer.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      console.error("Error en vista previa:", error);
      alert(error.message || "No se pudo generar la vista previa");
    }
  }

  /* =========================================================
     PDF
  ========================================================= */
  async function esperarRenderCompleto(elemento) {
    if (!elemento) return;

    const imagenes = Array.from(elemento.querySelectorAll("img"));

    await Promise.all(
      imagenes.map(img => {
        if (img.complete) return Promise.resolve();

        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );

    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (_) { }
    }

    await new Promise(resolve => requestAnimationFrame(() => resolve()));
    await new Promise(resolve => requestAnimationFrame(() => resolve()));
    await new Promise(resolve => setTimeout(resolve, 250));
  }

  function generarDocumentoImpresionListaCotejo(listas) {
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Lista de Cotejo</title>
      ${getListaCotejoStyles()}
      <style>
        html, body {
          margin: 0;
          padding: 0;
          background: #fff;
          color: #000;
          font-family: Arial, sans-serif;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }

        @page {
          size: letter portrait;
          margin: 0.18in;
        }

        @media print {
          html, body {
            width: 8.5in;
            height: auto;
            margin: 0;
            padding: 0;
          }

          .lista-cotejo-page {
            width: 8.14in;
            min-height: 10.6in;
            margin: 0;
            box-shadow: none;
            page-break-after: always;
          }

          .lista-cotejo-page:last-child {
            page-break-after: auto;
          }
        }
      </style>
    </head>
    <body>
      ${listas.map(materia => generarHTMLListaCotejo(materia)).join("")}

      <script>
        window.onload = function () {
          setTimeout(function () {
            window.print();
          }, 500);
        };
      </script>
    </body>
    </html>
  `;
  }

  async function imprimirListaCotejo() {
    try {
      const listas = await construirListas();

      const htmlImpresion = generarDocumentoImpresionListaCotejo(listas);
      const win = window.open("", "_blank", "width=1400,height=900,scrollbars=yes");

      if (!win) {
        throw new Error("El navegador bloqueó la ventana emergente de impresión");
      }

      win.document.open();
      win.document.write(htmlImpresion);
      win.document.close();
    } catch (error) {
      console.error("Error al generar impresión:", error);
      alert(error.message || "No se pudo generar la lista de cotejo");
    }
  }

  /* =========================================================
     EVENTOS
  ========================================================= */
  radioMateriaEspecifica?.addEventListener("change", actualizarModoSeleccion);
  radioTodasMaterias?.addEventListener("change", actualizarModoSeleccion);

  btnVistaPrevia?.addEventListener("click", generarVistaPrevia);
  btnGenerar?.addEventListener("click", imprimirListaCotejo);

  /* =========================================================
     INIT
  ========================================================= */
  async function init() {
    const sesion = getSessionData();
    state.anio = sesion.anio;
    state.grado_id = sesion.grado_id;
    state.seccion_id = sesion.seccion_id;
    state.seccion_desc = sesion.seccion_desc;
    state.docente = sesion.docente;

    actualizarModoSeleccion();
    await cargarMaterias();
  }

  init();
});