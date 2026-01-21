(() => {
  'use strict';

  // ====== reglas de materias (materia_id) ======
  const PrimeroATercero = [1, 2, 3, 4, 5];
  const CuartoASexto   = [1, 2, 6, 7, 5, 4, 8];
  const Fisica         = [9];
  const Computacion    = [10];

  // ====== DOM ======
  const selGrado   = document.getElementById('combo_grado_direc');
  const selSeccion = document.getElementById('combo_seccion_direc');
  const selCiclo   = document.getElementById('combo_ciclo_direc');
  const btnVer     = document.getElementById('VisualizarInfo'); // tu botón "Ver" (si existe)

  const honorTbody = document.querySelector('.table-honor tbody');
  const rendCont   = document.querySelector('.subject-container');

  // ====== año ======
  const ANIO = new Date().getFullYear();

  // ====== userData (sessionStorage) ======
  let userData = null;
  try {
    const raw = sessionStorage.getItem('userData');
    userData = raw ? JSON.parse(raw) : null;
  } catch {
    userData = null;
  }
  const ROL = (userData?.rol_id || '').trim().toUpperCase();

  // ====== helpers ======
  const toInt = (x, def = 0) => {
    const n = parseInt(x, 10);
    return Number.isFinite(n) ? n : def;
  };
  const toFloat = (x, def = 0) => {
    const n = parseFloat(x);
    return Number.isFinite(n) ? n : def;
  };
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

  // ====== API ======
  async function fetchCalificaciones(payload) {
    const r = await fetch('http://localhost:8001/actividad/CalificacionesGradoSec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    if (!r.ok) throw new Error('CalificacionesGradoSec HTTP ' + r.status);
    const json = await r.json();
    return Array.isArray(json.data) ? json.data : [];
  }

  // =========================================================
  // (1) Cuadro de honor
  // =========================================================
  function renderHonorNoDisponible() {
    if (!honorTbody) return;
    honorTbody.innerHTML = `
      <tr><td colspan="3" class="text-center text-muted">Datos no disponibles</td></tr>
    `;
  }

  function honorRowTemplate(pos, nombre, promedio) {
    const medalClass = pos === 1 ? 'gold' : pos === 2 ? 'silver' : pos === 3 ? 'bronze' : '';
    const medalIcon = pos <= 3 ? `<i class="bi bi-award ${medalClass} medal"></i>` : '';
    return `
      <tr>
        <td>${pos}° ${medalIcon}</td>
        <td>${safeText(nombre)}</td>
        <td>${safeText(promedio)}</td>
      </tr>
    `;
  }

  function buildHonor(califDataFiltrada) {
    const map = new Map(); // alumno_id -> {nombre,total}

    for (const materia of califDataFiltrada) {
      const alumnos = Array.isArray(materia.alumnos) ? materia.alumnos : [];
      for (const a of alumnos) {
        const id = toInt(a.alumno_id, 0);
        if (!id) continue;

        const nombre = (a.alumno_nombre_completo || '—').trim() || '—';
        const punt = toFloat(a.puntaje_obtenido_total, 0);

        if (!map.has(id)) map.set(id, { nombre, total: 0 });
        map.get(id).total += punt;
      }
    }

    const lista = Array.from(map.values());
    if (!lista.length) return null;

    lista.sort((a, b) => b.total - a.total);

    return lista.slice(0, 5).map((x, i) => ({
      pos: i + 1,
      nombre: x.nombre,
      promedio: x.total.toFixed(2) // total (no hay promedio real en API)
    }));
  }

  function renderHonor(top) {
    if (!honorTbody) return;
    if (!top || !top.length) return renderHonorNoDisponible();
    honorTbody.innerHTML = top.map(r => honorRowTemplate(r.pos, r.nombre, r.promedio)).join('');
  }

  // =========================================================
  // (2) Rendimiento por materia
  // =========================================================
  function progressColor(pct) {
    if (pct >= 85) return 'bg-success';
    if (pct >= 70) return 'bg-primary';
    if (pct >= 50) return 'bg-warning';
    return 'bg-danger';
  }

  function iconByMateria(nombre) {
    const n = (nombre || '').toLowerCase();
    if (n.includes('matemat')) return 'bi bi-calculator stats-icon';
    if (n.includes('lenguaje') || n.includes('comunic')) return 'bi bi-book stats-icon';
    if (n.includes('ciencia') || n.includes('social')) return 'bi bi-flask stats-icon';
    if (n.includes('artist')) return 'bi bi-palette stats-icon';
    if (n.includes('fisic')) return 'bi bi-bicycle stats-icon';
    if (n.includes('comput')) return 'bi bi-pc-display stats-icon';
    return 'bi bi-bar-chart stats-icon';
  }

  function rendimientoItemTemplate(nombre, pct) {
    const pctRound = Math.round(pct);
    const cls = progressColor(pctRound);
    const icon = iconByMateria(nombre);

    return `
      <div class="subject-name">
        <i class="${icon}"></i> ${safeText(nombre)}
      </div>
      <div class="progress">
        <div class="progress-bar ${cls}" role="progressbar" style="width: ${pctRound}%">
          <span>${pctRound}%</span>
        </div>
      </div>
    `;
  }

  function renderRendimientoNoDisponible() {
    if (!rendCont) return;
    rendCont.innerHTML = `<p class="text-muted mb-0">Datos no disponibles</p>`;
  }

  function renderRendimiento(califDataFiltrada) {
    if (!rendCont) return;

    if (!Array.isArray(califDataFiltrada) || !califDataFiltrada.length) {
      return renderRendimientoNoDisponible();
    }

    const items = califDataFiltrada.map(m => {
      const nombre = m.nombre_materia || 'Materia';
      const alumnos = Array.isArray(m.alumnos) ? m.alumnos : [];
      const total = alumnos.length;
      const aprobados = alumnos.filter(a => toFloat(a.puntaje_obtenido_total, 0) > 0).length;
      const pct = total > 0 ? (aprobados / total) * 100 : NaN;
      return { nombre, pct: Number.isFinite(pct) ? pct : null, total };
    });

    const hayAlumnos = items.some(x => x.total > 0);
    if (!hayAlumnos) return renderRendimientoNoDisponible();

    items.sort((a, b) => (b.pct ?? -1) - (a.pct ?? -1));

    rendCont.innerHTML = items.map(it => {
      const pct = it.pct === null ? 0 : it.pct;
      return rendimientoItemTemplate(it.nombre, pct);
    }).join('');
  }

  // =========================================================
  // Orquestación
  // - initialLoad=true  => ciclo forzado a 1
  // - initialLoad=false => ciclo tomado del combo
  // =========================================================
  function getCicloId(initialLoad) {
    if (initialLoad) {
      if (selCiclo) selCiclo.value = '1';
      return 1;
    }
    // botón "Ver": usa lo elegido
    const c = toInt(selCiclo?.value, 1);
    return c > 0 ? c : 1;
  }

  async function cargarSeccionHonorYRendimiento(initialLoad = true) {
    const grado_id = toInt(selGrado?.value, 0);
    const seccion_id = toInt(selSeccion?.value, 0);
    const ciclo_id = getCicloId(initialLoad);
    const anio = ANIO;

    if (!grado_id || !seccion_id) {
      renderHonorNoDisponible();
      renderRendimientoNoDisponible();
      return;
    }

    const payload = { grado_id, seccion_id, ciclo_id, anio };

    try {
      const data = await fetchCalificaciones(payload);

      const permitidas = getMateriasPermitidas(grado_id, ROL);
      const dataFiltrada = (data || []).filter(m => permitidas.has(toInt(m.materia_id)));

      const top = buildHonor(dataFiltrada);
      renderHonor(top);

      renderRendimiento(dataFiltrada);

    } catch (e) {
      console.error('Error cargando CalificacionesGradoSec:', e);
      renderHonorNoDisponible();
      renderRendimientoNoDisponible();
    }
  }

  // Esperar combos listos para auto-carga inicial (ciclo=1)
  function esperarCombosListos(maxIntentos = 40) {
    let i = 0;
    const t = setInterval(() => {
      i++;

      const g = toInt(selGrado?.value, 0);
      const s = toInt(selSeccion?.value, 0);

      if (g > 0 && s > 0) {
        clearInterval(t);
        // ✅ carga inicial con ciclo 1
        cargarSeccionHonorYRendimiento(true);
        return;
      }

      if (i >= maxIntentos) {
        clearInterval(t);
        // ciclo 1 por defecto aunque no haya selección aún
        if (selCiclo) selCiclo.value = '1';
        renderHonorNoDisponible();
        renderRendimientoNoDisponible();
      }
    }, 200);
  }

  // Bootstrap
  document.addEventListener('DOMContentLoaded', () => {
    // Estado inicial visible
    renderHonorNoDisponible();
    renderRendimientoNoDisponible();

    // ✅ primera carga: ciclo 1
    if (selCiclo) selCiclo.value = '1';

    // auto-carga cuando combos estén listos
    esperarCombosListos();

    // Si el director cambia grado/sección, volvemos a "modo inicial" (ciclo 1)
    selGrado?.addEventListener('change', () => cargarSeccionHonorYRendimiento(true));
    selSeccion?.addEventListener('change', () => cargarSeccionHonorYRendimiento(true));

    // ✅ botón "Ver": usa el ciclo seleccionado por el usuario
    btnVer?.addEventListener('click', () => cargarSeccionHonorYRendimiento(false));
  });

})();
