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

    // Contenedores dentro de la card de la tabla
    const badgeMateria = document.querySelector('.badge.bg-label-primary'); // "Materia"
    const tituloMateria = document.querySelector('.card.card-custom h3');   // "Matemáticas"

    const table = document.querySelector('table.table');
    const thead = table ? table.querySelector('thead') : null;
    const tbody = table ? table.querySelector('tbody') : null;
    const tfoot = table ? table.querySelector('tfoot') : null;

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
    // Helpers
    // =========================================================
    function toInt(x, def = 0) {
        const n = parseInt(x, 10);
        return Number.isFinite(n) ? n : def;
    }

    function safeText(s) {
        return String(s ?? '').replace(/[&<>"']/g, (c) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));
    }

    function getMateriasPermitidas(gradoId, rol) {
        const r = (rol || '').trim().toUpperCase();
        if (r === 'F') return new Set(Fisica);
        if (r === 'C') return new Set(Computacion);
        if (gradoId >= 1 && gradoId <= 3) return new Set(PrimeroATercero);
        if (gradoId >= 4 && gradoId <= 6) return new Set(CuartoASexto);
        return new Set();
    }

    function getIdsSeleccion({ forceCiclo = null } = {}) {
        const grado_id = toInt(selGrado?.value, 0);
        const seccion_id = toInt(selSeccion?.value, 0);

        // ciclo: default 1 al cargar, pero si el usuario elige y presiona Ver, usamos ese
        const cicloSel = forceCiclo != null ? forceCiclo : Math.max(1, toInt(selCiclo?.value, 1));
        const ciclo_id = cicloSel;

        return { grado_id, seccion_id, ciclo_id, anio: ANIO };
    }

    function setLoading(msg = 'Cargando...') {
        if (tbody) tbody.innerHTML = `<tr><td colspan="999" class="text-center text-muted py-4">${safeText(msg)}</td></tr>`;
    }

    function setNoDisponible(msg = 'Datos no disponibles') {
        if (tbody) tbody.innerHTML = `<tr><td colspan="999" class="text-center text-muted py-4">${safeText(msg)}</td></tr>`;
        if (tfoot) tfoot.innerHTML = '';
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

    async function fetchActividadesPorTipo(payload) {
        const json = await postJSON('http://localhost:8001/actividad/ActividadesPorTipo', payload);
        return Array.isArray(json.data) ? json.data : [];
    }

    async function fetchActividadesCalificadasPorAlumno(payload) {
        const json = await postJSON('http://localhost:8001/actividad/ActividadesCalificadasPorAlumno', payload);
        return Array.isArray(json.data) ? json.data : [];
    }

    // =========================================================
    // Normalizadores (data model)
    // =========================================================
    // ActividadesPorTipo -> estructura por materia:
    // materia: {materia_id, nombre_materia, tipos_actividad:[{tipo_actividad_id, actividades:[{actividad_id?, nombre_actividad,...}]}]}
    function buildColumnsFromPorTipo(materiaObj) {
        const cols = { 1: [], 2: [], 3: [] }; // tipo -> [{idx, actividad_id, nombre, ...}]
        const titles = { 1: 'Tipo 1', 2: 'Tipo 2', 3: 'Tipo 3' }; // nombre real por tipo

        const tipos = Array.isArray(materiaObj?.tipos_actividad) ? materiaObj.tipos_actividad : [];

        for (const t of tipos) {
            const tipoId = toInt(t?.tipo_actividad_id, 0);
            if (![1, 2, 3].includes(tipoId)) continue;

            const tipoNombre = String(t?.tipo_actividad || '').trim();
            if (tipoNombre) titles[tipoId] = tipoNombre;

            const acts = Array.isArray(t?.actividades) ? t.actividades : [];
            cols[tipoId] = acts.map((a, i) => ({
                idx: i + 1,
                actividad_id: toInt(a?.actividad_id, 0),
                nombre: a?.nombre_actividad || `Act ${i + 1}`,
                puntaje_maximo: a?.puntaje_maximo ?? '',
                fecha_entrega: a?.fecha_entrega ?? null,
                estado: a?.estado_actividad ?? ''
            }));
        }

        return { cols, titles };
    }


    // ActividadesCalificadasPorAlumno -> map:
    // materia_id -> (actividad_id -> (alumno_id -> puntaje_obtenido))
    function buildCalifMap(califData) {
        const map = new Map(); // materia_id -> { byActId: Map, byActName: Map }

        for (const m of (califData || [])) {
            const mid = toInt(m?.materia_id, 0);
            if (!mid) continue;

            const byActId = new Map();   // actId -> Map(alumnoId -> puntaje)
            const byActName = new Map(); // actName -> Map(alumnoId -> puntaje)

            const acts = Array.isArray(m?.actividades) ? m.actividades : [];
            for (const a of acts) {
                const actId = toInt(a?.actividad_id, 0);
                const actName = String(a?.nombre_actividad || '').trim();

                const alumMap = new Map();
                const alumnos = Array.isArray(a?.alumnos) ? a.alumnos : [];
                for (const al of alumnos) {
                    const aid = toInt(al?.alumno_id, 0);
                    if (!aid) continue;
                    const score = al?.puntaje_obtenido;
                    const num = Number(score);
                    alumMap.set(aid, Number.isFinite(num) ? num : null);
                }

                if (actId) byActId.set(actId, alumMap);
                if (actName) byActName.set(actName.toLowerCase(), alumMap);
            }

            map.set(mid, { byActId, byActName });
        }

        return map;
    }

    // Para filas de alumnos: tomamos la lista desde calificaciones (más confiable para alumnos del grado/sección)
    function buildAlumnosListForMateria(califDataMateria) {
        // Une alumnos de todas las actividades, preservando orden por apellido/nombre
        const map = new Map(); // alumno_id -> {nombreCompleto}
        const acts = Array.isArray(califDataMateria?.actividades) ? califDataMateria.actividades : [];
        for (const act of acts) {
            const alumnos = Array.isArray(act?.alumnos) ? act.alumnos : [];
            for (const al of alumnos) {
                const id = toInt(al?.alumno_id, 0);
                if (!id) continue;
                const nombre = `${al?.alumno_nombre ?? ''} ${al?.alumno_apellido ?? ''}`.trim() || `Alumno ${id}`;
                map.set(id, { alumno_id: id, nombre });
            }
        }

        const lista = [...map.values()];
        lista.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
        return lista;
    }

    // =========================================================
    // Render: THEAD (2 filas)
    // =========================================================
    function renderThead({ cols, titles }) {
        if (!thead) return;

        const n1 = cols[1].length;
        const n2 = cols[2].length;
        const n3 = cols[3].length;

        const colSpan1 = Math.max(1, n1);
        const colSpan2 = Math.max(1, n2);
        const colSpan3 = Math.max(1, n3);

        // ✅ usar nombre real del tipo (si no viene, cae al fallback)
        const t1 = safeText(titles?.[1] || 'Tipo 1');
        const t2 = safeText(titles?.[2] || 'Tipo 2');
        const t3 = safeText(titles?.[3] || 'Tipo 3');

        // Fila 1 (grupos)
        const tr1 = `
    <tr>
      <th rowspan="2" class="text-nowrap">No.</th>
      <th rowspan="2" class="text-nowrap">Nombre</th>

      <th colspan="${colSpan1}" class="text-center text-nowrap">${t1}</th>
      <th colspan="${colSpan2}" class="text-center text-nowrap">${t2}</th>
      <th colspan="${colSpan3}" class="text-center text-nowrap">${t3}</th>

      <th colspan="1" class="text-center text-nowrap">Total</th>
      <th rowspan="2" class="text-center text-nowrap">Acciones</th>
    </tr>
  `;

        // Fila 2 (subcolumnas Act 1..n)
        const acts1 = (n1 ? cols[1] : [{ idx: 1, nombre: 'Act 1', actividad_id: 0 }])
            .map(a => `<th class="text-center text-nowrap" title="${safeText(a.nombre)}">Act ${a.idx}</th>`).join('');

        const acts2 = (n2 ? cols[2] : [{ idx: 1, nombre: 'Act 1', actividad_id: 0 }])
            .map(a => `<th class="text-center text-nowrap" title="${safeText(a.nombre)}">Act ${a.idx}</th>`).join('');

        const acts3 = (n3 ? cols[3] : [{ idx: 1, nombre: 'Act 1', actividad_id: 0 }])
            .map(a => `<th class="text-center text-nowrap" title="${safeText(a.nombre)}">Act ${a.idx}</th>`).join('');

        const tr2 = `
    <tr>
      ${acts1}
      ${acts2}
      ${acts3}
      <th class="text-center text-nowrap">Cantidad</th>
    </tr>
  `;

        thead.innerHTML = tr1 + tr2;
    }


    // =========================================================
    // Render: TBODY (inputs disabled; Editar habilita)
    // =========================================================
    function renderTbody(alumnos, cols) {
        if (!tbody) return;

        const list1 = cols[1].length ? cols[1] : [{ idx: 1, nombre: 'Act 1', actividad_id: 0 }];
        const list2 = cols[2].length ? cols[2] : [{ idx: 1, nombre: 'Act 1', actividad_id: 0 }];
        const list3 = cols[3].length ? cols[3] : [{ idx: 1, nombre: 'Act 1', actividad_id: 0 }];

        const allActs = [...list1, ...list2, ...list3];

        const rows = (alumnos || []).map((al, i) => {
            const cells = allActs.map(act => `
        <td class="text-center">
          <input
            class="form-control form-control-sm text-center nota-input"
            type="number"
            min="0"
            step="1"
            value=""
            disabled
            data-actividad-id="${safeText(act.actividad_id)}"
            data-actividad-name="${safeText(act.nombre)}"
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
            <button type="button" class="btn btn-sm btn-outline-primary btn-editar">Editar</button>
          </td>
        </tr>
      `;
        }).join('');

        tbody.innerHTML = rows || `<tr><td colspan="999" class="text-center text-muted py-4">Datos no disponibles</td></tr>`;

        // Listener Editar (habilita inputs de esa fila)
        tbody.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', () => {
                const tr = btn.closest('tr');
                if (!tr) return;
                tr.querySelectorAll('input.nota-input').forEach(inp => { inp.disabled = false; });
                btn.classList.remove('btn-outline-primary');
                btn.classList.add('btn-primary');
                btn.textContent = 'Editando';
            });
        });

        // Recalcular total cuando editen
        tbody.querySelectorAll('input.nota-input').forEach(inp => {
            inp.addEventListener('input', () => {
                const tr = inp.closest('tr');
                if (!tr) return;
                recalcTotalRow(tr);
            });
        });
    }

    function recalcTotalRow(tr) {
        const inputs = tr.querySelectorAll('input.nota-input');
        let sum = 0;
        inputs.forEach(inp => {
            const n = Number(inp.value);
            if (Number.isFinite(n)) sum += n;
        });
        const tdTotal = tr.querySelector('.total-cell');
        if (tdTotal) tdTotal.textContent = String(sum);
    }

    // =========================================================
    // Fill calificaciones: solo donde exista calificación
    // =========================================================
    function fillNotasFromCalifMap(materiaId, cols, califMap) {
        if (!tbody) return;

        const m = califMap.get(materiaId);
        if (!m) {
            // no hay calificaciones para esa materia
            tbody.querySelectorAll('tr[data-alumno-id]').forEach(tr => {
                tr.querySelectorAll('input.nota-input').forEach(inp => { inp.value = ''; });
                recalcTotalRow(tr);
            });
            return;
        }

        const byActId = m.byActId;
        const byActName = m.byActName;

        // Para cada fila/alumno, llenar por cada actividad de la tabla
        tbody.querySelectorAll('tr[data-alumno-id]').forEach(tr => {
            const alumnoId = toInt(tr.getAttribute('data-alumno-id'), 0);
            if (!alumnoId) return;

            tr.querySelectorAll('input.nota-input').forEach(inp => {
                const actId = toInt(inp.getAttribute('data-actividad-id'), 0);
                const actName = String(inp.getAttribute('data-actividad-name') || '').trim().toLowerCase();

                let score = null;

                // Preferir por actividad_id si está disponible
                if (actId && byActId.has(actId)) {
                    score = byActId.get(actId)?.get(alumnoId);
                } else if (actName && byActName.has(actName)) {
                    // fallback por nombre (si PorTipo no trae actividad_id)
                    score = byActName.get(actName)?.get(alumnoId);
                }

                // Regla: si no está calificada, dejar vacío (no 0)
                if (score == null) {
                    inp.value = '';
                } else {
                    inp.value = String(score);
                }
            });

            recalcTotalRow(tr);
        });
    }

    // =========================================================
    // Combo Materia: llenar permitidas (y default a 1 si existe)
    // =========================================================
    function setMateriaOptions(permitidas, dataPorTipo) {
        if (!selMateria) return;

        const prev = selMateria.value;

        // limpiar dejando placeholder
        while (selMateria.options.length > 1) selMateria.remove(1);

        const unique = new Map(); // id->nombre
        for (const m of (dataPorTipo || [])) {
            const id = toInt(m?.materia_id, 0);
            if (!id) continue;
            if (!permitidas.has(id)) continue;
            unique.set(id, m?.nombre_materia || `Materia ${id}`);
        }

        for (const [id, nombre] of unique.entries()) {
            const opt = document.createElement('option');
            opt.value = String(id);
            opt.textContent = nombre;
            selMateria.appendChild(opt);
        }

        // default: materia_id=1 si existe, si no, primera permitida
        const has1 = [...selMateria.options].some(o => o.value === '1');
        const firstReal = selMateria.options.length > 1 ? selMateria.options[1].value : '';

        if (prev && [...selMateria.options].some(o => o.value === prev)) {
            selMateria.value = prev;
        } else if (has1) {
            selMateria.value = '1';
        } else {
            selMateria.value = firstReal || '';
        }
    }

    // =========================================================
    // Orquestación principal: cargar tabla
    // - Al cargar página: ciclo=1 + materia=1 (si existe) AUTO
    // - Si cambian ciclo/materia: NO auto; solo con botón Ver
    // =========================================================
    let initDone = false;

    async function cargarTabla({ useSelectedCiclo = false } = {}) {
        if (!table || !thead || !tbody) return;

        const grado_id = toInt(selGrado?.value, 0);
        const seccion_id = toInt(selSeccion?.value, 0);

        if (!grado_id || !seccion_id) {
            setNoDisponible('Seleccione grado y sección.');
            return;
        }

        // ciclo
        const ciclo_id = useSelectedCiclo ? Math.max(1, toInt(selCiclo?.value, 1)) : 1;
        if (selCiclo) selCiclo.value = String(ciclo_id);

        const payload = { grado_id, seccion_id, ciclo_id, anio: ANIO };

        setLoading('Cargando tabla de calificaciones...');

        try {
            const [porTipo, calif] = await Promise.all([
                fetchActividadesPorTipo(payload),
                fetchActividadesCalificadasPorAlumno(payload)
            ]);

            const permitidas = getMateriasPermitidas(grado_id, ROL);

            // Combo materia: llenarlo con PorTipo (permitidas) y aplicar default
            setMateriaOptions(permitidas, porTipo);

            // Materia seleccionada
            const materiaSel = toInt(selMateria?.value, 0);
            if (!materiaSel) {
                setNoDisponible('Datos no disponibles');
                return;
            }

            // Set título materia
            const nombreMatSel =
                (porTipo || []).find(x => toInt(x?.materia_id) === materiaSel)?.nombre_materia
                || (calif || []).find(x => toInt(x?.materia_id) === materiaSel)?.nombre_materia
                || 'Materia';

            if (tituloMateria) tituloMateria.textContent = nombreMatSel;
            if (badgeMateria) badgeMateria.textContent = 'Materia';

            // Tomar estructura de actividades desde PorTipo (regla: mostrar TODAS)
            const porTipoMateria = (porTipo || []).find(x => toInt(x?.materia_id) === materiaSel);

            if (!porTipoMateria) {
                renderThead({ cols: { 1: [], 2: [], 3: [] }, titles: { 1: 'Tipo 1', 2: 'Tipo 2', 3: 'Tipo 3' } });
                setNoDisponible('Datos no disponibles');
                return;
            }

            // ✅ columnas + títulos (nombre real)
            const { cols, titles } = buildColumnsFromPorTipo(porTipoMateria);

            // ✅ render thead
            renderThead({ cols, titles });

            // ✅ alumnos
            const califMateria = (calif || []).find(x => toInt(x?.materia_id) === materiaSel);
            const alumnos = califMateria ? buildAlumnosListForMateria(califMateria) : [];

            if (!alumnos.length) {
                renderTbody([], cols);
                setNoDisponible('Datos no disponibles');
                return;
            }

            // ✅ render tbody (vacío primero)
            renderTbody(alumnos, cols);

            // ✅ llenar calificaciones
            const califMap = buildCalifMap(calif || []);
            fillNotasFromCalifMap(materiaSel, cols, califMap);

            if (tfoot) tfoot.innerHTML = '';

        } catch (e) {
            console.error('Error cargarTabla:', e);
            setNoDisponible('Datos no disponibles');
        }
    }

    function getRealColspan() {
        if (!thead) return 1;

        // Tomar la primera fila del thead y sumar colspans (incluye los th con rowspan)
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
        if (tbody) tbody.innerHTML = `<tr><td colspan="${cs}" class="text-center text-muted py-4">${safeText(msg)}</td></tr>`;
        if (tfoot) tfoot.innerHTML = '';
    }

    function setNoDisponible(msg = 'Datos no disponibles') {
        const cs = getRealColspan();
        if (tbody) tbody.innerHTML = `<tr><td colspan="${cs}" class="text-center text-muted py-4">${safeText(msg)}</td></tr>`;
        if (tfoot) tfoot.innerHTML = '';
    }

    // Esperar combos listos (se llenan async por comboGradSec.js)
    function esperarCombosListosYcargar(maxIntentos = 40) {
        let i = 0;
        const t = setInterval(() => {
            i++;

            // defaults al inicio
            if (selCiclo) selCiclo.value = '1';

            const g = toInt(selGrado?.value, 0);
            const s = toInt(selSeccion?.value, 0);

            if (g > 0 && s > 0) {
                clearInterval(t);
                cargarTabla({ useSelectedCiclo: false }); // 👈 auto: ciclo 1
                initDone = true;
                return;
            }

            if (i >= maxIntentos) {
                clearInterval(t);
                setNoDisponible('Seleccione grado y sección.');
            }
        }, 200);
    }

    // =========================================================
    // Bootstrap + listeners
    // =========================================================
    document.addEventListener('DOMContentLoaded', () => {
        // Estado inicial
        if (selCiclo) selCiclo.value = '1';
        setLoading('Cargando...');

        // Auto carga al inicio
        esperarCombosListosYcargar();

        // Si cambian grado/sección, recargar automáticamente a ciclo 1
        selGrado?.addEventListener('change', () => {
            if (selCiclo) selCiclo.value = '1';
            cargarTabla({ useSelectedCiclo: false });
        });

        selSeccion?.addEventListener('change', () => {
            if (selCiclo) selCiclo.value = '1';
            cargarTabla({ useSelectedCiclo: false });
        });

        // Si cambian materia: no recargues automático (según tu regla); requiere Ver
        // selMateria?.addEventListener('change', () => {});

        // Si cambian bimestre: no recargues automático; requiere Ver
        // selCiclo?.addEventListener('change', () => {});

        // Botón Ver: usa el ciclo seleccionado + materia seleccionada
        btnVer?.addEventListener('click', () => {
            cargarTabla({ useSelectedCiclo: true });
        });
    });

})();
