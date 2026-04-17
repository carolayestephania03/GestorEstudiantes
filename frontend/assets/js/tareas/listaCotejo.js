(() => {
    'use strict';

    // =========================================================
    // Reglas de materias (materia_id)
    // =========================================================
    const PrimeroATercero = [1, 2, 3, 4, 5];
    const CuartoASexto = [1, 2, 6, 7, 5, 4, 8];
    const Fisica = [9];
    const Computacion = [10];

    // =========================================================
    // DOM
    // =========================================================
    const selGrado = document.getElementById('combo_grado_direc');
    const selSeccion = document.getElementById('combo_seccion_direc');
    const selCiclo = document.getElementById('combo_ciclo_direc');
    const selMateria = document.getElementById('combo_materia');
    const btnVer = document.getElementById('VisualizarInfo');

    // Materia
    const badgeMateria = document.querySelector('.badge.bg-label-primary');
    const tituloMateria = document.getElementById('tituloMateriaCard');
    const table = document.getElementById('tablaNotasMateria');
    const thead = table ? table.querySelector('thead') : null;
    const tbody = table ? table.querySelector('tbody') : null;
    const tfoot = table ? table.querySelector('tfoot') : null;

    // Actitudinal
    const tablaActitudinal = document.getElementById('tablaNotasActitudinal');
    const tbodyActitudinal = document.getElementById('tbodyNotasActitudinal');
    const tablaActitudinalThead = tablaActitudinal ? tablaActitudinal.querySelector('thead') : null;
    const trSubcolsActitudinal = document.getElementById('trSubcolsActitudinal');
    const thGrupoActitudinal = document.getElementById('thGrupoActitudinal');

    // Botones configuración
    const btnConfigNotasMateria = document.getElementById('btnConfigNotasMateria');
    const btnConfigNotasActitudinal = document.getElementById('btnConfigNotasActitudinal');

    // Modal
    const modalConfiguracionNotasEl = document.getElementById('modalConfiguracionNotas');
    const modalConfiguracionNotas = modalConfiguracionNotasEl ? new bootstrap.Modal(modalConfiguracionNotasEl) : null;

    const modalGrado = document.getElementById('modal_grado_alumno');
    const modalSeccion = document.getElementById('modal_seccion_alumno');
    const modalBimestre = document.getElementById('modal_bimestre_alumno');

    const modalPondDeclarativo = document.getElementById('modal_ponderacion_declarativo');
    const modalPondProcedimental = document.getElementById('modal_ponderacion_procedimental');
    const modalPondActitudinal = document.getElementById('modal_ponderacion_actitudinal');

    const modalHiddenCiclo = document.getElementById('modal_ciclo_id');
    const modalHiddenGrado = document.getElementById('modal_grado_id');
    const modalHiddenSeccion = document.getElementById('modal_seccion_id');
    const modalHiddenAnio = document.getElementById('modal_anio');

    const tableBodyModalTopicosActitudinal = document.getElementById('tableBodyModalTopicosActitudinal');
    const btnGuardarAlumno = document.getElementById('btnGuardarAlumno');
    const btnNextAlumno = document.getElementById('btnNextAlumno');
    const stepModalAlumno = document.getElementById('step-2-alumno');

    // =========================================================
    // userData (sessionStorage)
    // =========================================================
    let userData = null;
    try {
        const raw = sessionStorage.getItem('userData');
        userData = raw ? JSON.parse(raw) : null;
    } catch {
        userData = null;
    }

    const ROL = (userData?.rol_id || '').trim().toUpperCase();
    const ANIO = Number(userData?.maestro_anio_actual ?? new Date().getFullYear());

    // =========================================================
    // Estado temporal
    // =========================================================
    const estadoNotasConfig = {
        puntaje_maximo_actitudinal: 0,
        puntaje_maximo_declarativo: 0,
        puntaje_maximo_procedimental: 0,
        topicos: []
    };

    const estadoMateriaActual = {
        materia_id: 0,
        nombre_materia: '',
        cols: { 1: [], 2: [] },
        titles: { 1: 'Tareas', 2: 'Procedimentales' }
    };

    // =========================================================
    // Helpers
    // =========================================================
    function toInt(x, def = 0) {
        const n = parseInt(x, 10);
        return Number.isFinite(n) ? n : def;
    }

    function toNumber(val, def = 0) {
        const n = Number(val);
        return Number.isFinite(n) ? n : def;
    }

    function safeText(s) {
        return String(s ?? '').replace(/[&<>"']/g, (c) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[c]));
    }

    function normalizeName(value) {
        return String(value || '').trim().toLowerCase();
    }

    function initCardToggles() {
        document.querySelectorAll('.btn-toggle-card').forEach(btn => {
            const targetSelector = btn.getAttribute('data-bs-target');
            const icon = btn.querySelector('.icon-toggle');
            const target = targetSelector ? document.querySelector(targetSelector) : null;

            if (!target || !icon) return;

            target.addEventListener('shown.bs.collapse', () => {
                icon.textContent = 'keyboard_arrow_up';
            });

            target.addEventListener('hidden.bs.collapse', () => {
                icon.textContent = 'keyboard_arrow_down';
            });
        });
    }

    function getMateriasPermitidas(gradoId, rol) {
        const r = (rol || '').trim().toUpperCase();
        if (r === 'F') return new Set(Fisica);
        if (r === 'C') return new Set(Computacion);
        if (gradoId >= 1 && gradoId <= 3) return new Set(PrimeroATercero);
        if (gradoId >= 4 && gradoId <= 6) return new Set(CuartoASexto);
        return new Set();
    }

    function getRealColspan() {
        if (!thead) return 1;
        const tr = thead.querySelector('tr');
        if (!tr) return 1;

        let total = 0;
        tr.querySelectorAll('th').forEach(th => {
            total += th.colSpan ? Number(th.colSpan) : 1;
        });

        return Math.max(1, total);
    }

    function setLoading(msg = 'Cargando...') {
        const cs = getRealColspan();
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="${cs}" class="text-center text-muted py-4">${safeText(msg)}</td></tr>`;
        }
        if (tfoot) tfoot.innerHTML = '';
    }

    function setNoDisponible(msg = 'Datos no disponibles') {
        const cs = getRealColspan();
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="${cs}" class="text-center text-muted py-4">${safeText(msg)}</td></tr>`;
        }
        if (tfoot) tfoot.innerHTML = '';
    }

    function setLoadingActitudinal(msg = 'Cargando...') {
        if (tbodyActitudinal) {
            tbodyActitudinal.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">${safeText(msg)}</td></tr>`;
        }
    }

    function setNoDisponibleActitudinal(msg = 'Datos no disponibles') {
        if (tbodyActitudinal) {
            tbodyActitudinal.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">${safeText(msg)}</td></tr>`;
        }
    }

    function sumarInputsFila(tr, selector) {
        let total = 0;
        tr.querySelectorAll(selector).forEach(inp => {
            const n = Number(inp.value);
            if (Number.isFinite(n)) total += n;
        });
        return total;
    }

    function recalcTotalRow(tr) {
        const total = sumarInputsFila(tr, 'input.nota-input');
        const tdTotal = tr.querySelector('.total-cell');
        if (tdTotal) tdTotal.textContent = String(Number(total.toFixed(2)));
    }

    function recalcTotalRowActitudinal(tr) {
        const total = sumarInputsFila(tr, 'input.nota-actitudinal');
        const tdTotal = tr.querySelector('.total-cell-actitudinal');
        if (tdTotal) tdTotal.textContent = String(Number(total.toFixed(2)));
    }

    function validarMaximoFilaMateria(tr) {
        const totalDeclarativo = [...tr.querySelectorAll('input.nota-input[data-tipo="1"]')].reduce((acc, inp) => {
            const n = Number(inp.value);
            return acc + (Number.isFinite(n) ? n : 0);
        }, 0);

        const totalProcedimental = [...tr.querySelectorAll('input.nota-input[data-tipo="2"]')].reduce((acc, inp) => {
            const n = Number(inp.value);
            return acc + (Number.isFinite(n) ? n : 0);
        }, 0);

        if (totalDeclarativo > estadoNotasConfig.puntaje_maximo_declarativo) {
            alert(`La suma declarativa no puede ser mayor a ${estadoNotasConfig.puntaje_maximo_declarativo}.`);
            return false;
        }

        if (totalProcedimental > estadoNotasConfig.puntaje_maximo_procedimental) {
            alert(`La suma procedimental no puede ser mayor a ${estadoNotasConfig.puntaje_maximo_procedimental}.`);
            return false;
        }

        let excedeActividad = false;
        tr.querySelectorAll('input.nota-input').forEach(inp => {
            const maxActividad = toNumber(inp.dataset.maxActividad, 0);
            const actual = toNumber(inp.value, 0);
            if (maxActividad > 0 && actual > maxActividad) {
                excedeActividad = true;
            }
        });

        if (excedeActividad) {
            alert('Una o más notas superan el puntaje máximo de la actividad.');
            return false;
        }

        return true;
    }

    function validarMaximoFilaActitudinal(tr) {
        const total = sumarInputsFila(tr, 'input.nota-actitudinal');

        if (total > estadoNotasConfig.puntaje_maximo_actitudinal) {
            alert(`La suma actitudinal no puede ser mayor a ${estadoNotasConfig.puntaje_maximo_actitudinal}.`);
            return false;
        }

        let excedeTopico = false;
        tr.querySelectorAll('input.nota-actitudinal').forEach(inp => {
            const maxTopico = toNumber(inp.dataset.maxTopico, 0);
            const actual = toNumber(inp.value, 0);
            if (actual > maxTopico) {
                excedeTopico = true;
            }
        });

        if (excedeTopico) {
            alert('Uno o más tópicos superan el puntaje máximo permitido.');
            return false;
        }

        return true;
    }

    function snapshotFilaMateria(tr) {
        const data = [];
        tr.querySelectorAll('input.nota-input').forEach(inp => {
            data.push({
                actividad_id: toInt(inp.dataset.actividadId, 0),
                value: inp.value
            });
        });
        tr.dataset.snapshot = JSON.stringify(data);
    }

    function restoreFilaMateria(tr) {
        const raw = tr.dataset.snapshot;
        if (!raw) return;

        let data = [];
        try {
            data = JSON.parse(raw);
        } catch {
            data = [];
        }

        const map = new Map(data.map(x => [Number(x.actividad_id), x.value]));

        tr.querySelectorAll('input.nota-input').forEach(inp => {
            const actividadId = toInt(inp.dataset.actividadId, 0);
            inp.value = map.has(actividadId) ? map.get(actividadId) : '';
        });

        recalcTotalRow(tr);
    }

    function snapshotFilaActitudinal(tr) {
        const data = [];
        tr.querySelectorAll('input.nota-actitudinal').forEach(inp => {
            data.push({
                topico_id: toInt(inp.dataset.topicoId, 0),
                value: inp.value
            });
        });
        tr.dataset.snapshot = JSON.stringify(data);
    }

    function restoreFilaActitudinal(tr) {
        const raw = tr.dataset.snapshot;
        if (!raw) return;

        let data = [];
        try {
            data = JSON.parse(raw);
        } catch {
            data = [];
        }

        const map = new Map(data.map(x => [Number(x.topico_id), x.value]));

        tr.querySelectorAll('input.nota-actitudinal').forEach(inp => {
            const topicoId = toInt(inp.dataset.topicoId, 0);
            inp.value = map.has(topicoId) ? map.get(topicoId) : '0';
        });

        recalcTotalRowActitudinal(tr);
    }

    function setModoEdicionMateria(tr, editando) {
        const btnEditar = tr.querySelector('.btn-editar');
        const btnCancelar = tr.querySelector('.btn-cancelar');

        tr.querySelectorAll('input.nota-input').forEach(inp => {
            inp.disabled = !editando;
        });

        if (btnEditar) {
            btnEditar.dataset.editando = editando ? '1' : '0';
            btnEditar.classList.toggle('btn-outline-primary', !editando);
            btnEditar.classList.toggle('btn-warning', editando);
            btnEditar.textContent = editando ? 'Actualizar' : 'Editar';
        }

        if (btnCancelar) {
            btnCancelar.classList.toggle('d-none', !editando);
        }
    }

    function setModoEdicionActitudinal(tr, editando) {
        const btnEditar = tr.querySelector('.btn-editar-actitudinal');
        const btnCancelar = tr.querySelector('.btn-cancelar-actitudinal');

        tr.querySelectorAll('input.nota-actitudinal').forEach(inp => {
            inp.disabled = !editando;
        });

        if (btnEditar) {
            btnEditar.dataset.editando = editando ? '1' : '0';
            btnEditar.classList.toggle('btn-outline-primary', !editando);
            btnEditar.classList.toggle('btn-warning', editando);
            btnEditar.textContent = editando ? 'Actualizar' : 'Editar';
        }

        if (btnCancelar) {
            btnCancelar.classList.toggle('d-none', !editando);
        }
    }

    function construirPayloadFilaMateria(tr) {
        const alumno_id = toInt(tr.dataset.alumnoId, 0);

        const actividades = [...tr.querySelectorAll('input.nota-input')]
            .map(inp => ({
                actividad_id: toInt(inp.dataset.actividadId, 0),
                puntaje_obtenido: toNumber(inp.value, 0),
                comentarios: ''
            }))
            .filter(x => x.actividad_id > 0);

        return { alumno_id, actividades };
    }

    function construirPayloadFilaActitudinal(tr) {
        const alumno_id = toInt(tr.dataset.alumnoId, 0);

        return {
            ciclo_id: Math.max(1, toInt(selCiclo?.value, 1)),
            grado_id: toInt(selGrado?.value, 0),
            seccion_id: toInt(selSeccion?.value, 0),
            anio: ANIO,
            alumnos: [
                {
                    alumno_id,
                    detalles: [...tr.querySelectorAll('input.nota-actitudinal')]
                        .map(inp => ({
                            topico_id: toInt(inp.dataset.topicoId, 0),
                            puntaje_obtenido: toNumber(inp.value, 0),
                            observacion: ''
                        }))
                        .filter(x => x.topico_id > 0)
                }
            ]
        };
    }

    // =========================================================
    // API calls
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

    async function getJSON(url) {
        const r = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        if (!r.ok) throw new Error(`${url} HTTP ${r.status}`);
        return r.json();
    }

    async function guardarCalificacionMateria(payload) {
        const json = await postJSON('http://localhost:8001/calificacion/guardarCalificacion', payload);
        return json || {};
    }

    async function guardarActitudinal(payload) {
        const json = await postJSON('http://localhost:8001/Actitudinal/GuardarActitudinal', payload);
        return json || {};
    }

    async function fetchActividadesPorTipo(payload) {
        const json = await postJSON('http://localhost:8001/actividad/ActividadesPorTipo', payload);
        return Array.isArray(json.data) ? json.data : [];
    }

    async function fetchActividadesCalificadasPorAlumno(payload) {
        const json = await postJSON('http://localhost:8001/actividad/ActividadesCalificadasPorAlumno', payload);
        return Array.isArray(json.data) ? json.data : [];
    }

    async function fetchActitudinal(payload) {
        const json = await postJSON('http://localhost:8001/Actitudinal/obtenerActitudinal', payload);
        return json || {};
    }

    async function fetchTopicosActitudinal() {
        const json = await getJSON('http://localhost:8001/Actitudinal/topicosActitudinal');
        return Array.isArray(json.data) ? json.data : [];
    }

    async function guardarConfiguracionNotas(payload) {
        const json = await postJSON('http://localhost:8001/Actitudinal/ConfigurarNotas', payload);
        return json || {};
    }

    // =========================================================
    // Normalizadores de actividades
    // =========================================================
    function getTipoIdDesdeTexto(nombreTipo) {
        const txt = normalizeName(nombreTipo);

        if (txt.includes('declar')) return 1;
        if (txt.includes('tarea')) return 1;
        if (txt.includes('proced')) return 2;

        return 0;
    }

    function buildColumnsFromPorTipo(materiaObj, califMateria = null) {
        const cols = { 1: [], 2: [] };
        const titles = { 1: 'Tareas', 2: 'Procedimentales' };

        const mapByKey = {
            1: new Map(),
            2: new Map()
        };

        const tipos = Array.isArray(materiaObj?.tipos_actividad) ? materiaObj.tipos_actividad : [];
        tipos.forEach(tipo => {
            const tipoId = toInt(tipo?.tipo_actividad_id, 0) || getTipoIdDesdeTexto(tipo?.tipo_actividad);
            if (![1, 2].includes(tipoId)) return;

            const tipoNombre = String(tipo?.tipo_actividad || '').trim();
            if (tipoNombre) titles[tipoId] = tipoNombre;

            const actividades = Array.isArray(tipo?.actividades) ? tipo.actividades : [];
            actividades.forEach((a, idx) => {
                const key = normalizeName(a?.nombre_actividad) || `tmp_${tipoId}_${idx}`;
                if (!mapByKey[tipoId].has(key)) {
                    mapByKey[tipoId].set(key, {
                        idx: mapByKey[tipoId].size + 1,
                        actividad_id: toInt(a?.actividad_id, 0),
                        nombre: a?.nombre_actividad || `Act ${idx + 1}`,
                        puntaje_maximo: toNumber(a?.puntaje_maximo, 0),
                        fecha_entrega: a?.fecha_entrega ?? null,
                        estado: a?.estado_actividad ?? '',
                        tipo_actividad_id: tipoId
                    });
                }
            });
        });

        const actividadesCalificadas = Array.isArray(califMateria?.actividades) ? califMateria.actividades : [];
        actividadesCalificadas.forEach((a, idx) => {
            const key = normalizeName(a?.nombre_actividad) || `cal_${idx}`;
            let tipoId = 0;

            const nombre = normalizeName(a?.nombre_actividad);
            if (mapByKey[1].has(key)) tipoId = 1;
            if (mapByKey[2].has(key)) tipoId = 2;

            if (!tipoId) {
                if (nombre.includes('tarea') || nombre.includes('declar')) tipoId = 1;
                else tipoId = 2;
            }

            if (![1, 2].includes(tipoId)) return;

            if (!mapByKey[tipoId].has(key)) {
                mapByKey[tipoId].set(key, {
                    idx: mapByKey[tipoId].size + 1,
                    actividad_id: toInt(a?.actividad_id, 0),
                    nombre: a?.nombre_actividad || `Act ${idx + 1}`,
                    puntaje_maximo: toNumber(a?.puntaje_maximo, 0),
                    fecha_entrega: a?.fecha_entrega ?? null,
                    estado: '',
                    tipo_actividad_id: tipoId
                });
            } else {
                const ref = mapByKey[tipoId].get(key);
                if (!toInt(ref?.actividad_id, 0)) {
                    ref.actividad_id = toInt(a?.actividad_id, 0);
                }
                if (!toNumber(ref?.puntaje_maximo, 0)) {
                    ref.puntaje_maximo = toNumber(a?.puntaje_maximo, 0);
                }
            }
        });

        cols[1] = [...mapByKey[1].values()].map((x, i) => ({ ...x, idx: i + 1 }));
        cols[2] = [...mapByKey[2].values()].map((x, i) => ({ ...x, idx: i + 1 }));

        return { cols, titles };
    }

    function buildCalifMap(califData) {
        const map = new Map();

        for (const materia of (califData || [])) {
            const materiaId = toInt(materia?.materia_id, 0);
            if (!materiaId) continue;

            const byActId = new Map();
            const byActName = new Map();
            const actividades = Array.isArray(materia?.actividades) ? materia.actividades : [];

            actividades.forEach(act => {
                const actId = toInt(act?.actividad_id, 0);
                const actName = normalizeName(act?.nombre_actividad);

                const alumnoMap = new Map();
                const alumnos = Array.isArray(act?.alumnos) ? act.alumnos : [];

                alumnos.forEach(al => {
                    const alumnoId = toInt(al?.alumno_id, 0);
                    if (!alumnoId) return;
                    alumnoMap.set(alumnoId, toNumber(al?.puntaje_obtenido, 0));
                });

                if (actId) byActId.set(actId, alumnoMap);
                if (actName) byActName.set(actName, alumnoMap);
            });

            map.set(materiaId, { byActId, byActName });
        }

        return map;
    }

    function buildAlumnosListForMateria(califDataMateria) {
        const map = new Map();
        const actividades = Array.isArray(califDataMateria?.actividades) ? califDataMateria.actividades : [];

        actividades.forEach(act => {
            const alumnos = Array.isArray(act?.alumnos) ? act.alumnos : [];
            alumnos.forEach(al => {
                const alumnoId = toInt(al?.alumno_id, 0);
                if (!alumnoId) return;

                const nombre = `${al?.alumno_nombre ?? ''} ${al?.alumno_apellido ?? ''}`.trim() || `Alumno ${alumnoId}`;
                map.set(alumnoId, {
                    alumno_id: alumnoId,
                    nombre,
                    codigo_alumno: al?.codigo_alumno ?? ''
                });
            });
        });

        const lista = [...map.values()];
        lista.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
        return lista;
    }

    function obtenerTopicosActivosDesdeRespuesta(resp) {
        const alumnos = Array.isArray(resp?.alumnos) ? resp.alumnos : [];
        const mapa = new Map();

        alumnos.forEach(al => {
            const detalles = Array.isArray(al?.detalles) ? al.detalles : [];

            detalles.forEach(det => {
                const topicoId = toInt(det?.topico_id, 0);
                if (!topicoId) return;

                if (!mapa.has(topicoId)) {
                    mapa.set(topicoId, {
                        topico_id: topicoId,
                        nombre_topico: det?.nombre_topico || `Tópico ${topicoId}`,
                        puntaje_maximo_topico: toNumber(det?.puntaje_maximo_topico, 0),
                        configuracion_detalle_id: toInt(det?.configuracion_detalle_id, 0)
                    });
                }
            });
        });

        return [...mapa.values()].sort((a, b) => a.topico_id - b.topico_id);
    }

    // =========================================================
    // Render encabezado materia
    // =========================================================
    function renderThead({ cols, titles }) {
        if (!thead) return;

        const n1 = cols[1].length;
        const n2 = cols[2].length;

        const colSpan1 = Math.max(1, n1);
        const colSpan2 = Math.max(1, n2);

        const t1 = safeText(titles?.[1] || 'Tareas');
        const t2 = safeText(titles?.[2] || 'Procedimentales');

        const tr1 = `
            <tr>
                <th rowspan="2" class="text-nowrap">No.</th>
                <th rowspan="2" class="text-nowrap">Nombre</th>
                <th colspan="${colSpan1}" class="text-center text-nowrap">${t1}</th>
                <th colspan="${colSpan2}" class="text-center text-nowrap">${t2}</th>
                <th colspan="1" class="text-center text-nowrap">Total</th>
                <th rowspan="2" class="text-center text-nowrap">Acciones</th>
            </tr>
        `;

        const acts1 = (n1 ? cols[1] : [{ idx: 1, nombre: 'Act 1' }])
            .map(a => `<th class="text-center text-nowrap" title="${safeText(a.nombre)}">Act ${a.idx}</th>`)
            .join('');

        const acts2 = (n2 ? cols[2] : [{ idx: 1, nombre: 'Act 1' }])
            .map(a => `<th class="text-center text-nowrap" title="${safeText(a.nombre)}">Act ${a.idx}</th>`)
            .join('');

        const tr2 = `
            <tr>
                ${acts1}
                ${acts2}
                <th class="text-center text-nowrap">Cantidad</th>
            </tr>
        `;

        thead.innerHTML = tr1 + tr2;
    }

    // =========================================================
    // Render cuerpo materia
    // =========================================================
    function renderTbody(alumnos, cols) {
        if (!tbody) return;

        const list1 = cols[1].length ? cols[1] : [];
        const list2 = cols[2].length ? cols[2] : [];
        const allActs = [
            ...list1.map(x => ({ ...x, tipo_actividad_id: 1 })),
            ...list2.map(x => ({ ...x, tipo_actividad_id: 2 }))
        ];

        if (!allActs.length) {
            tbody.innerHTML = `<tr><td colspan="999" class="text-center text-muted py-4">Datos no disponibles</td></tr>`;
            return;
        }

        const rows = (alumnos || []).map((al, i) => {
            const cells = allActs.map(act => `
                <td class="text-center">
                    <input
                        class="form-control form-control-sm text-center nota-input"
                        type="number"
                        min="0"
                        step="0.01"
                        value=""
                        disabled
                        data-actividad-id="${safeText(act.actividad_id)}"
                        data-actividad-name="${safeText(act.nombre)}"
                        data-tipo="${safeText(act.tipo_actividad_id)}"
                        data-max-actividad="${safeText(toNumber(act.puntaje_maximo, 0))}"
                        title="${safeText(act.nombre)}"
                    >
                </td>
            `).join('');

            return `
                <tr data-alumno-id="${safeText(al.alumno_id)}">
                    <td class="text-nowrap">${i + 1}</td>
                    <td class="text-nowrap">${safeText(al.nombre)}</td>
                    ${cells}
                    <td class="text-center fw-bold total-cell">0</td>
                    <td class="text-center text-nowrap">
                        <div class="d-flex gap-1 justify-content-center">
                            <button type="button" class="btn btn-sm btn-outline-primary btn-editar" data-editando="0">
                                Editar
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-secondary btn-cancelar d-none">
                                Cancelar
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = rows;

        tbody.querySelectorAll('input.nota-input').forEach(inp => {
            inp.addEventListener('input', () => {
                const maxActividad = toNumber(inp.dataset.maxActividad, 0);
                let actual = toNumber(inp.value, 0);

                if (actual < 0) {
                    actual = 0;
                    inp.value = 0;
                }

                if (maxActividad > 0 && actual > maxActividad) {
                    alert(`El puntaje no puede ser mayor a ${maxActividad} para esta actividad.`);
                    inp.value = maxActividad;
                }

                const tr = inp.closest('tr');
                if (!tr) return;
                recalcTotalRow(tr);
            });
        });

        tbody.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', async () => {
                const tr = btn.closest('tr');
                if (!tr) return;

                const editando = btn.dataset.editando === '1';

                if (!editando) {
                    snapshotFilaMateria(tr);
                    setModoEdicionMateria(tr, true);
                    return;
                }

                if (!validarMaximoFilaMateria(tr)) return;

                const confirmar = confirm('¿Desea actualizar las notas de este alumno?');
                if (!confirmar) return;

                try {
                    const payload = construirPayloadFilaMateria(tr);

                    if (!payload.alumno_id || !payload.actividades.length) {
                        alert('No se encontraron actividades válidas para guardar.');
                        return;
                    }

                    await guardarCalificacionMateria(payload);

                    setModoEdicionMateria(tr, false);
                    snapshotFilaMateria(tr);
                    alert('Notas guardadas correctamente.');
                } catch (error) {
                    console.error('Error guardarCalificacionMateria:', error);
                    alert('No fue posible guardar las notas del alumno.');
                }
            });
        });

        tbody.querySelectorAll('.btn-cancelar').forEach(btn => {
            btn.addEventListener('click', () => {
                const tr = btn.closest('tr');
                if (!tr) return;

                restoreFilaMateria(tr);
                setModoEdicionMateria(tr, false);
            });
        });
    }

    function fillNotasFromCalifMap(materiaId, califMap) {
        if (!tbody) return;

        const materiaData = califMap.get(materiaId);

        tbody.querySelectorAll('tr[data-alumno-id]').forEach(tr => {
            const alumnoId = toInt(tr.getAttribute('data-alumno-id'), 0);
            if (!alumnoId) return;

            tr.querySelectorAll('input.nota-input').forEach(inp => {
                const actividadId = toInt(inp.dataset.actividadId, 0);
                const actividadName = normalizeName(inp.dataset.actividadName);

                let score = 0;

                if (materiaData?.byActId?.has(actividadId)) {
                    score = toNumber(materiaData.byActId.get(actividadId)?.get(alumnoId), 0);
                } else if (materiaData?.byActName?.has(actividadName)) {
                    score = toNumber(materiaData.byActName.get(actividadName)?.get(alumnoId), 0);
                }

                inp.value = score ? String(score) : '0';
            });

            recalcTotalRow(tr);
            snapshotFilaMateria(tr);
        });
    }

    // =========================================================
    // Combo materia
    // =========================================================
    function setMateriaOptions(permitidas, dataPorTipo, dataCalificadas = []) {
        if (!selMateria) return;

        const prev = selMateria.value;
        while (selMateria.options.length > 1) selMateria.remove(1);

        const unique = new Map();

        (dataPorTipo || []).forEach(m => {
            const id = toInt(m?.materia_id, 0);
            if (!id || !permitidas.has(id)) return;
            unique.set(id, m?.nombre_materia || `Materia ${id}`);
        });

        (dataCalificadas || []).forEach(m => {
            const id = toInt(m?.materia_id, 0);
            if (!id || !permitidas.has(id)) return;
            if (!unique.has(id)) {
                unique.set(id, m?.nombre_materia || `Materia ${id}`);
            }
        });

        for (const [id, nombre] of unique.entries()) {
            const opt = document.createElement('option');
            opt.value = String(id);
            opt.textContent = nombre;
            selMateria.appendChild(opt);
        }

        if (prev && [...selMateria.options].some(o => o.value === prev)) {
            selMateria.value = prev;
        } else if (selMateria.options.length > 1) {
            selMateria.value = selMateria.options[1].value;
        } else {
            selMateria.value = '';
        }
    }

    // =========================================================
    // Render actitudinal
    // =========================================================
    function renderTheadActitudinal(topicos = []) {
        if (!tablaActitudinalThead || !trSubcolsActitudinal || !thGrupoActitudinal) return;

        const lista = Array.isArray(topicos) ? topicos : [];
        const totalTopicos = Math.max(1, lista.length);

        thGrupoActitudinal.colSpan = totalTopicos;
        thGrupoActitudinal.textContent = 'Actitudinal';

        trSubcolsActitudinal.innerHTML = `
            ${lista.length
                ? lista.map((t) => `
                    <th class="text-center text-nowrap" title="${safeText(t.nombre_topico)}">
                        ${safeText(t.nombre_topico)}
                    </th>
                `).join('')
                : `<th class="text-center text-nowrap">Sin tópicos</th>`
            }
            <th class="text-center text-nowrap">Cantidad</th>
        `;
    }

    function renderTbodyActitudinal(alumnos = [], topicos = []) {
        if (!tbodyActitudinal) return;

        const listaTopicos = Array.isArray(topicos) ? topicos : [];
        const listaAlumnos = Array.isArray(alumnos) ? alumnos : [];

        if (!listaAlumnos.length) {
            const colspan = listaTopicos.length + 4;
            tbodyActitudinal.innerHTML = `
                <tr>
                    <td colspan="${colspan}" class="text-center text-muted py-4">
                        Datos no disponibles
                    </td>
                </tr>
            `;
            return;
        }

        const rows = listaAlumnos.map((al, index) => {
            const detalles = Array.isArray(al?.detalles) ? al.detalles : [];
            const detalleMap = new Map(detalles.map(det => [toInt(det?.topico_id, 0), det]));

            const celdas = listaTopicos.map(topico => {
                const det = detalleMap.get(toInt(topico.topico_id, 0));
                const puntajeObtenido = det ? toNumber(det?.puntaje_obtenido, 0) : 0;
                const puntajeMaximoTopico = det
                    ? toNumber(det?.puntaje_maximo_topico, 0)
                    : toNumber(topico?.puntaje_maximo_topico, 0);

                const configuracionDetalleId = det ? toInt(det?.configuracion_detalle_id, 0) : 0;

                return `
                    <td class="text-center">
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="${safeText(puntajeMaximoTopico)}"
                            class="form-control form-control-sm text-center nota-actitudinal"
                            disabled
                            value="${safeText(puntajeObtenido)}"
                            data-topico-id="${safeText(topico.topico_id)}"
                            data-configuracion-detalle-id="${safeText(configuracionDetalleId)}"
                            data-max-topico="${safeText(puntajeMaximoTopico)}"
                        >
                    </td>
                `;
            }).join('');

            const total = listaTopicos.reduce((acc, topico) => {
                const det = detalleMap.get(toInt(topico.topico_id, 0));
                return acc + (det ? toNumber(det?.puntaje_obtenido, 0) : 0);
            }, 0);

            return `
                <tr data-alumno-id="${safeText(al.alumno_id)}">
                    <td class="text-nowrap">${index + 1}</td>
                    <td class="text-nowrap">${safeText(al.nombre_completo || '')}</td>
                    ${celdas}
                    <td class="text-center fw-bold total-cell-actitudinal">${safeText(Number(total.toFixed(2)))}</td>
                    <td class="text-center text-nowrap">
                        <div class="d-flex gap-1 justify-content-center">
                            <button type="button"
                                class="btn btn-sm btn-outline-primary btn-editar-actitudinal"
                                data-editando="0">
                                Editar
                            </button>
                            <button type="button"
                                class="btn btn-sm btn-outline-secondary btn-cancelar-actitudinal d-none">
                                Cancelar
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        const colspan = listaTopicos.length + 4;
        tbodyActitudinal.innerHTML = rows || `
            <tr>
                <td colspan="${colspan}" class="text-center text-muted py-4">
                    Datos no disponibles
                </td>
            </tr>
        `;

        tbodyActitudinal.querySelectorAll('.nota-actitudinal').forEach(inp => {
            inp.addEventListener('input', () => {
                const maxTopico = Number(inp.dataset.maxTopico || 0);
                let actual = Number(inp.value || 0);

                if (actual > maxTopico) {
                    alert(`El puntaje no puede ser mayor a ${maxTopico} para este tópico.`);
                    actual = maxTopico;
                    inp.value = maxTopico;
                }

                if (actual < 0) {
                    actual = 0;
                    inp.value = 0;
                }

                const tr = inp.closest('tr');
                if (tr) recalcTotalRowActitudinal(tr);
            });
        });

        tbodyActitudinal.querySelectorAll('.btn-editar-actitudinal').forEach(btn => {
            btn.addEventListener('click', async () => {
                const tr = btn.closest('tr');
                if (!tr) return;

                const editando = btn.dataset.editando === '1';

                if (!editando) {
                    snapshotFilaActitudinal(tr);
                    setModoEdicionActitudinal(tr, true);
                    return;
                }

                if (!validarMaximoFilaActitudinal(tr)) return;

                const confirmar = confirm('¿Desea actualizar las notas actitudinales de este alumno?');
                if (!confirmar) return;

                try {
                    const payload = construirPayloadFilaActitudinal(tr);
                    await guardarActitudinal(payload);

                    setModoEdicionActitudinal(tr, false);
                    snapshotFilaActitudinal(tr);
                    alert('Notas actitudinales guardadas correctamente.');
                } catch (error) {
                    console.error('Error guardarActitudinal:', error);
                    alert('No fue posible guardar las notas actitudinales del alumno.');
                }
            });
        });

        tbodyActitudinal.querySelectorAll('.btn-cancelar-actitudinal').forEach(btn => {
            btn.addEventListener('click', () => {
                const tr = btn.closest('tr');
                if (!tr) return;

                restoreFilaActitudinal(tr);
                setModoEdicionActitudinal(tr, false);
            });
        });

        tbodyActitudinal.querySelectorAll('tr[data-alumno-id]').forEach(tr => {
            snapshotFilaActitudinal(tr);
        });
    }
        // =========================================================
    // Modal topicos / configuración
    // =========================================================
    function renderTopicosModal(topicos = []) {
        if (!tableBodyModalTopicosActitudinal) return;

        const topicosActivos = (topicos || []).filter(t => toInt(t?.estado, 1) === 1);

        const rows = topicosActivos.map((t, i) => {
            const topicoGuardado = estadoNotasConfig.topicos.find(x => Number(x.topico_id) === Number(t.topico_id));

            return `
                <tr>
                    <td class="text-center">${i + 1}</td>
                    <td>${safeText(t.nombre_topico)}</td>
                    <td>${safeText(t.descripcion || '')}</td>
                    <td>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            class="form-control form-control-sm input-topico-puntaje"
                            data-topico-id="${safeText(t.topico_id)}"
                            value="${safeText(topicoGuardado?.puntaje_topico ?? 0)}"
                        >
                    </td>
                    <td>
                        <input
                            type="number"
                            step="1"
                            min="1"
                            class="form-control form-control-sm input-topico-orden"
                            data-topico-id="${safeText(t.topico_id)}"
                            value="${safeText(topicoGuardado?.orden ?? (i + 1))}"
                        >
                    </td>
                </tr>
            `;
        }).join('');

        tableBodyModalTopicosActitudinal.innerHTML = rows || `
            <tr>
                <td colspan="5" class="text-center text-muted">No hay tópicos activos disponibles</td>
            </tr>
        `;
    }

    async function abrirModalConfiguracionNotas(tipo = 'actitudinal') {
        try {
            const grado_id = toInt(selGrado?.value, 0);
            const seccion_id = toInt(selSeccion?.value, 0);
            const ciclo_id = Math.max(1, toInt(selCiclo?.value, 1));

            modalHiddenGrado.value = grado_id;
            modalHiddenSeccion.value = seccion_id;
            modalHiddenCiclo.value = ciclo_id;
            modalHiddenAnio.value = ANIO;

            if (modalGrado) modalGrado.value = String(grado_id || '');
            if (modalSeccion) modalSeccion.value = String(seccion_id || '');
            if (modalBimestre) modalBimestre.value = String(ciclo_id || '');

            if (modalPondDeclarativo) modalPondDeclarativo.value = estadoNotasConfig.puntaje_maximo_declarativo || 0;
            if (modalPondProcedimental) modalPondProcedimental.value = estadoNotasConfig.puntaje_maximo_procedimental || 0;
            if (modalPondActitudinal) modalPondActitudinal.value = estadoNotasConfig.puntaje_maximo_actitudinal || 0;

            if (stepModalAlumno) stepModalAlumno.classList.remove('d-none');
            if (btnGuardarAlumno) btnGuardarAlumno.classList.remove('d-none');
            if (btnNextAlumno) btnNextAlumno.classList.add('d-none');

            const topicos = await fetchTopicosActitudinal();
            renderTopicosModal(topicos);

            modalConfiguracionNotas?.show();
        } catch (error) {
            console.error('Error abrirModalConfiguracionNotas:', error);
            alert('No fue posible cargar la configuración de notas.');
        }
    }

    function construirPayloadConfiguracionNotas() {
        const grado_id = toInt(modalGrado?.value || modalHiddenGrado?.value, 0);
        const seccion_id = toInt(modalSeccion?.value || modalHiddenSeccion?.value, 0);
        const ciclo_id = toInt(modalBimestre?.value || modalHiddenCiclo?.value, 0);

        const puntaje_maximo_actitudinal = toNumber(modalPondActitudinal?.value, 0);
        const puntaje_maximo_declarativo = toNumber(modalPondDeclarativo?.value, 0);
        const puntaje_maximo_procedimental = toNumber(modalPondProcedimental?.value, 0);

        const topicos = [...document.querySelectorAll('#tableBodyModalTopicosActitudinal tr')].map((tr, index) => {
            const inputPuntaje = tr.querySelector('.input-topico-puntaje');
            const inputOrden = tr.querySelector('.input-topico-orden');

            return {
                topico_id: toInt(inputPuntaje?.dataset.topicoId, 0),
                puntaje_topico: toNumber(inputPuntaje?.value, 0),
                orden: toInt(inputOrden?.value, index + 1)
            };
        }).filter(x => x.topico_id > 0);

        return {
            grado_id,
            seccion_id,
            ciclo_id,
            anio: ANIO,
            puntaje_maximo_actitudinal,
            puntaje_maximo_declarativo,
            puntaje_maximo_procedimental,
            topicos
        };
    }

    function validarConfiguracionNotas(payload) {
        if (!payload.grado_id || !payload.seccion_id || !payload.ciclo_id || !payload.anio) {
            alert('Faltan datos académicos para configurar las notas.');
            return false;
        }

        const total = Number(
            (toNumber(payload.puntaje_maximo_actitudinal, 0) +
            toNumber(payload.puntaje_maximo_declarativo, 0) +
            toNumber(payload.puntaje_maximo_procedimental, 0)).toFixed(2)
        );

        if (total !== 100) {
            alert('La suma de Actitudinal + Declarativo + Procedimental debe ser igual a 100.');
            return false;
        }

        const sumaTopicos = Number(payload.topicos.reduce((acc, t) => acc + toNumber(t.puntaje_topico, 0), 0).toFixed(2));
        const maxActitudinal = Number(toNumber(payload.puntaje_maximo_actitudinal, 0).toFixed(2));

        if (sumaTopicos !== maxActitudinal) {
            alert(`La suma de los tópicos actitudinales debe ser igual a ${maxActitudinal}.`);
            return false;
        }

        const topicosDuplicados = new Set();
        for (const t of payload.topicos) {
            if (topicosDuplicados.has(t.topico_id)) {
                alert('No se permiten tópicos repetidos.');
                return false;
            }
            topicosDuplicados.add(t.topico_id);
        }

        return true;
    }

    async function guardarDesdeModalConfiguracionNotas() {
        try {
            const payload = construirPayloadConfiguracionNotas();

            if (!validarConfiguracionNotas(payload)) return;

            const confirmar = confirm('¿Desea guardar la configuración de notas?');
            if (!confirmar) return;

            await guardarConfiguracionNotas(payload);

            estadoNotasConfig.puntaje_maximo_actitudinal = payload.puntaje_maximo_actitudinal;
            estadoNotasConfig.puntaje_maximo_declarativo = payload.puntaje_maximo_declarativo;
            estadoNotasConfig.puntaje_maximo_procedimental = payload.puntaje_maximo_procedimental;
            estadoNotasConfig.topicos = payload.topicos;

            alert('Configuración de notas guardada correctamente.');
            modalConfiguracionNotas?.hide();

            await cargarTabla({ useSelectedCiclo: true });
            await cargarTablaActitudinal({ useSelectedCiclo: true });
        } catch (error) {
            console.error('Error guardarDesdeModalConfiguracionNotas:', error);
            alert('No fue posible guardar la configuración de notas.');
        }
    }

    // =========================================================
    // Carga tabla materia
    // =========================================================
    async function cargarTabla({ useSelectedCiclo = false } = {}) {
        if (!table || !thead || !tbody) return;

        const grado_id = toInt(selGrado?.value, 0);
        const seccion_id = toInt(selSeccion?.value, 0);

        if (!grado_id || !seccion_id) {
            setNoDisponible('Seleccione grado y sección.');
            return;
        }

        const ciclo_id = useSelectedCiclo ? Math.max(1, toInt(selCiclo?.value, 1)) : 1;
        if (selCiclo) selCiclo.value = String(ciclo_id);

        const payload = {
            grado_id,
            seccion_id,
            ciclo_id,
            anio: ANIO
        };

        setLoading('Cargando tabla de calificaciones...');

        try {
            const [porTipo, calif] = await Promise.all([
                fetchActividadesPorTipo(payload),
                fetchActividadesCalificadasPorAlumno(payload)
            ]);

            try {
                const actitudinalResp = await fetchActitudinal(payload);
                const config = actitudinalResp?.configuracion || {};

                estadoNotasConfig.puntaje_maximo_actitudinal = toNumber(
                    config.puntaje_maximo_actitudinal ?? config.puntaje_actitudinal,
                    0
                );
                estadoNotasConfig.puntaje_maximo_declarativo = toNumber(
                    config.puntaje_maximo_declarativo ?? config.puntaje_declarativo,
                    0
                );
                estadoNotasConfig.puntaje_maximo_procedimental = toNumber(
                    config.puntaje_maximo_procedimental ?? config.puntaje_procedimental,
                    0
                );
            } catch (e) {
                console.warn('No se pudo sincronizar la configuración de notas:', e);
            }

            const permitidas = getMateriasPermitidas(grado_id, ROL);
            setMateriaOptions(permitidas, porTipo, calif);

            const materiaSel = toInt(selMateria?.value, 0);
            if (!materiaSel) {
                setNoDisponible('Datos no disponibles');
                return;
            }

            const nombreMatSel =
                (porTipo || []).find(x => toInt(x?.materia_id, 0) === materiaSel)?.nombre_materia ||
                (calif || []).find(x => toInt(x?.materia_id, 0) === materiaSel)?.nombre_materia ||
                'Materia';

            if (tituloMateria) tituloMateria.textContent = nombreMatSel;
            if (badgeMateria) badgeMateria.textContent = 'Materia';

            const porTipoMateria = (porTipo || []).find(x => toInt(x?.materia_id, 0) === materiaSel) || null;
            const califMateria = (calif || []).find(x => toInt(x?.materia_id, 0) === materiaSel) || null;

            const { cols, titles } = buildColumnsFromPorTipo(porTipoMateria, califMateria);

            estadoMateriaActual.materia_id = materiaSel;
            estadoMateriaActual.nombre_materia = nombreMatSel;
            estadoMateriaActual.cols = cols;
            estadoMateriaActual.titles = titles;

            const totalActs = (cols[1]?.length || 0) + (cols[2]?.length || 0);
            if (!totalActs) {
                renderThead({
                    cols: { 1: [], 2: [] },
                    titles: { 1: 'Tareas', 2: 'Procedimentales' }
                });
                setNoDisponible('Datos no disponibles');
                return;
            }

            renderThead({ cols, titles });

            const alumnos = califMateria ? buildAlumnosListForMateria(califMateria) : [];

            if (!alumnos.length) {
                renderTbody([], cols);
                setNoDisponible('Datos no disponibles');
                return;
            }

            renderTbody(alumnos, cols);

            const califMap = buildCalifMap(calif || []);
            fillNotasFromCalifMap(materiaSel, califMap);

            if (tfoot) tfoot.innerHTML = '';
        } catch (e) {
            console.error('Error cargarTabla:', e);
            setNoDisponible('Datos no disponibles');
        }
    }

    // =========================================================
    // Carga tabla actitudinal
    // =========================================================
    async function cargarTablaActitudinal({ useSelectedCiclo = false } = {}) {
        const grado_id = toInt(selGrado?.value, 0);
        const seccion_id = toInt(selSeccion?.value, 0);

        if (!grado_id || !seccion_id) {
            setNoDisponibleActitudinal('Seleccione grado y sección.');
            return;
        }

        const ciclo_id = useSelectedCiclo ? Math.max(1, toInt(selCiclo?.value, 1)) : 1;

        if (selCiclo && !useSelectedCiclo) {
            selCiclo.value = '1';
        }

        const payload = {
            anio: ANIO,
            grado_id,
            seccion_id,
            ciclo_id
        };

        setLoadingActitudinal('Cargando actitudinal...');

        try {
            const resp = await fetchActitudinal(payload);

            const configuracion = resp?.configuracion || {};
            const alumnos = Array.isArray(resp?.alumnos) ? resp.alumnos : [];
            const topicosActivos = obtenerTopicosActivosDesdeRespuesta(resp);

            estadoNotasConfig.puntaje_maximo_actitudinal = toNumber(
                configuracion?.puntaje_maximo_actitudinal ?? configuracion?.puntaje_actitudinal,
                0
            );
            estadoNotasConfig.puntaje_maximo_declarativo = toNumber(
                configuracion?.puntaje_maximo_declarativo ?? configuracion?.puntaje_declarativo,
                0
            );
            estadoNotasConfig.puntaje_maximo_procedimental = toNumber(
                configuracion?.puntaje_maximo_procedimental ?? configuracion?.puntaje_procedimental,
                0
            );

            estadoNotasConfig.topicos = topicosActivos.map((t, i) => ({
                topico_id: t.topico_id,
                nombre_topico: t.nombre_topico,
                puntaje_topico: toNumber(t.puntaje_maximo_topico, 0),
                orden: i + 1
            }));

            renderTheadActitudinal(topicosActivos);
            renderTbodyActitudinal(alumnos, topicosActivos);
        } catch (error) {
            console.error('Error cargarTablaActitudinal:', error);
            setNoDisponibleActitudinal('Datos no disponibles');
        }
    }

    // =========================================================
    // Esperar combos listos
    // =========================================================
    let initDone = false;

    function esperarCombosListosYcargar(maxIntentos = 40) {
        let i = 0;

        const t = setInterval(async () => {
            i++;

            if (selCiclo) selCiclo.value = '1';

            const g = toInt(selGrado?.value, 0);
            const s = toInt(selSeccion?.value, 0);

            if (g > 0 && s > 0) {
                clearInterval(t);
                await cargarTabla({ useSelectedCiclo: false });
                await cargarTablaActitudinal({ useSelectedCiclo: false });
                initDone = true;
                return;
            }

            if (i >= maxIntentos) {
                clearInterval(t);
                setNoDisponible('Seleccione grado y sección.');
                setNoDisponibleActitudinal('Seleccione grado y sección.');
            }
        }, 200);
    }

    // =========================================================
    // Listeners auxiliares modal
    // =========================================================
    function initModalValidaciones() {
        if (tableBodyModalTopicosActitudinal) {
            tableBodyModalTopicosActitudinal.addEventListener('input', (e) => {
                const target = e.target;
                if (!target) return;

                if (target.classList.contains('input-topico-puntaje')) {
                    const sumaTopicos = [...tableBodyModalTopicosActitudinal.querySelectorAll('.input-topico-puntaje')]
                        .reduce((acc, inp) => acc + toNumber(inp.value, 0), 0);

                    const maxActitudinal = toNumber(modalPondActitudinal?.value, 0);

                    if (maxActitudinal > 0 && sumaTopicos > maxActitudinal) {
                        alert(`La suma de los tópicos no puede ser mayor a ${maxActitudinal}.`);
                        target.value = 0;
                    }
                }
            });
        }

        modalPondActitudinal?.addEventListener('input', () => {
            const sumaTopicos = [...document.querySelectorAll('.input-topico-puntaje')]
                .reduce((acc, inp) => acc + toNumber(inp.value, 0), 0);

            const maxActitudinal = toNumber(modalPondActitudinal?.value, 0);
            if (maxActitudinal > 0 && sumaTopicos > maxActitudinal) {
                alert(`La suma actual de tópicos (${sumaTopicos}) supera el nuevo máximo actitudinal (${maxActitudinal}).`);
            }
        });
    }

    // =========================================================
    // Bootstrap + listeners
    // =========================================================
    document.addEventListener('DOMContentLoaded', () => {
        if (selCiclo) selCiclo.value = '1';

        setLoading('Cargando...');
        setLoadingActitudinal('Cargando...');
        initCardToggles();
        initModalValidaciones();

        esperarCombosListosYcargar();

        selGrado?.addEventListener('change', async () => {
            if (selCiclo) selCiclo.value = '1';
            await cargarTabla({ useSelectedCiclo: false });
            await cargarTablaActitudinal({ useSelectedCiclo: false });
        });

        selSeccion?.addEventListener('change', async () => {
            if (selCiclo) selCiclo.value = '1';
            await cargarTabla({ useSelectedCiclo: false });
            await cargarTablaActitudinal({ useSelectedCiclo: false });
        });

        btnConfigNotasMateria?.addEventListener('click', async () => {
            await abrirModalConfiguracionNotas('materia');
        });

        btnConfigNotasActitudinal?.addEventListener('click', async () => {
            await abrirModalConfiguracionNotas('actitudinal');
        });

        btnGuardarAlumno?.addEventListener('click', async () => {
            await guardarDesdeModalConfiguracionNotas();
        });

        btnVer?.addEventListener('click', async () => {
            await cargarTabla({ useSelectedCiclo: true });
            await cargarTablaActitudinal({ useSelectedCiclo: true });
        });

        selMateria?.addEventListener('change', async () => {
            if (!initDone) return;
            await cargarTabla({ useSelectedCiclo: true });
        });
    });

})();