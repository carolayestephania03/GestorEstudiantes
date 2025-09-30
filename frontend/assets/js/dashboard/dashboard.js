// ========== utils de contexto ==========
function getContext() {
  const d = document.body?.dataset || {};
  const anio = Number(d.anio ?? 2025);
  const grado = Number(d.grado ?? 1);
  const seccion = Number(d.seccion ?? 1);
  return { anio, grado, seccion };
}
function toInt(x, def = 0) {
  const n = parseInt(x, 10);
  return Number.isFinite(n) ? n : def;
}
function toFloat(x, def = 0) {
  const n = parseFloat(x);
  return Number.isFinite(n) ? n : def;
}

// ========== utilidades de imagen por materia ==========
function slugifyMateria(nombre='') {
  return String(nombre)
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita acentos
    .replace(/[^a-z0-9\s]/g, ' ')                     // quita signos
    .replace(/\s+/g, '_')                             // espacios -> _
    .trim();
}
const IMG_MAP = {
  'matematicas': 'matematicas.png',
  'comunicacion_y_lenguaje': 'comunicacion_lenguaje.png',
  'educacion_fisica': 'educacion_fisica.png',
  'expresion_artistica': 'expresion_artistica.png',
  'formacion_ciudadana': 'formacion_ciudadana.png',
  'ciencias_naturales': 'ciencias_social_natural.png',
  'ciencias_sociales': 'ciencias_social_natural.png',
  'ciencias_naturales_y_tecnologia': 'ciencias_social_natural.png',
  'ciencias_social_natural': 'ciencias_social_natural.png',
  'computacion': 'computacion.png'
};
function getMateriaImage(nombreMateria) {
  const slug = slugifyMateria(nombreMateria || '');
  const tries = [
    slug,
    slug.replace(/__+/g, '_'),
    slug.replace(/_y_/g, '_')
  ];
  for (const t of tries) {
    if (IMG_MAP[t]) return `/assets/img/materias/${IMG_MAP[t]}`;
  }
  // Heurísticas sencillas:
  if (/matemat/i.test(nombreMateria)) return '/assets/img/materias/matematicas.png';
  if (/comunic/i.test(nombreMateria)) return '/assets/img/materias/comunicacion_lenguaje.png';
  if (/fisic/i.test(nombreMateria)) return '/assets/img/materias/educacion_fisica.png';
  if (/artist/i.test(nombreMateria)) return '/assets/img/materias/expresion_artistica.png';
  if (/ciudadan/i.test(nombreMateria)) return '/assets/img/materias/formacion_ciudadana.png';
  if (/ciencia|social/i.test(nombreMateria)) return '/assets/img/materias/ciencias_social_natural.png';
  // Fallback
  return '/assets/img/materias/matematicas.png';
}

// ========== (1) Tarjetas de tareas pendientes ==========
async function fetchMaterias() {
  const r = await fetch('http://localhost:8001/materia', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  if (!r.ok) throw new Error('Materias HTTP ' + r.status);
  const json = await r.json();
  return Array.isArray(json.data) ? json.data : [];
}
// Resumen de pendientes/cumplidas por materia (para badges)
async function fetchPendCum(ctx) {
  const r = await fetch('http://localhost:8001/materia/ActividadesPenyCum', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ anio: ctx.anio, grado: ctx.grado, seccion: ctx.seccion })
  });
  if (!r.ok) throw new Error('ActividadesPenyCum HTTP ' + r.status);
  const json = await r.json();
  return Array.isArray(json.data) ? json.data : [];
}
function mapPendientesPorMateria(penCum) {
  // key: materia_id -> {pendientes, cumplidas, total, nombre}
  const map = new Map();
  penCum.forEach(row => {
    const id = toInt(row.materia_id);
    map.set(id, {
      pendientes: toInt(row.actividades_pendientes),
      cumplidas: toInt(row.actividades_cumplidas),
      total: toInt(row.actividades_total),
      nombre: row.nombre_materia || ''
    });
  });
  return map;
}
function cardMateriaTemplate(materia, resumen) {
  const pendientes = resumen?.pendientes ?? 0;
  const img = getMateriaImage(materia.nombre_materia);

  return `
    <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6 mb-4">
      <div class="card card-info position-relative h-100">
        <div class="card-img-container">
          <img src="${img}" alt="${(materia.nombre_materia||'').replace(/"/g,'&quot;')}">
        </div>
        <div class="card-body d-flex flex-column align-items-start">
          <h3 class="h6 mb-2 text-uppercase text-muted">${materia.nombre_materia || 'Materia'}</h3>
          <div class="display-5 fw-bold ${pendientes>0 ? 'text-danger' : 'text-success'} lh-1">
            ${pendientes}
          </div>
          <div class="small text-secondary mt-1">tareas pendientes</div>
        </div>
      </div>
    </div>
  `;
}
async function renderTarjetasPendientes() {
  const ctx = getContext();
  const container = document.getElementById('tarjetas_materias');
  if (!container) return;

  try {
    const [materias, penCum] = await Promise.all([fetchMaterias(), fetchPendCum(ctx)]);
    const resumenMap = mapPendientesPorMateria(penCum);

    // Regla de visibilidad según grado
    let lista = materias.slice(); // copia
    if (ctx.grado >= 1 && ctx.grado <= 3) {
      lista = lista.slice(0, 8);
    } // 4-6: todas

    if (lista.length === 0) {
      container.innerHTML = '<p class="text-center">No se encontraron materias.</p>';
      return;
    }

    const html = lista.map(m => cardMateriaTemplate(m, resumenMap.get(toInt(m.materia_id)))).join('');
    container.innerHTML = html;
  } catch (e) {
    console.error('Error tarjetas pendientes:', e);
    container.innerHTML = '<p class="text-center text-danger">No fue posible cargar las materias.</p>';
  }
}

// ========== (2) Cuadro de honor ==========
async function fetchCuadroHonor(ctx) {
  const r = await fetch('http://localhost:8001/calificacion/promedioAlumnos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ anio: ctx.anio, grado: ctx.grado, seccion: ctx.seccion })
  });
  if (!r.ok) throw new Error('promedioAlumnos HTTP ' + r.status);
  const json = await r.json();
  return Array.isArray(json.data) ? json.data : [];
}
function honorRowTemplate(item, idx) {
  const pos = idx + 1;
  const medalClass = pos === 1 ? 'gold' : pos === 2 ? 'silver' : pos === 3 ? 'bronze' : '';
  const medalIcon = pos <= 3 ? `<i class="bi bi-award ${medalClass} medal"></i>` : '';
  const nombre = `${item.nombre_alumno ?? ''} ${item.apellido_alumno ?? ''}`.trim() || '—';
  const promedio = (toFloat(item.promedio_general)).toFixed(2);
  return `
    <tr>
      <td>${pos}° ${medalIcon}</td>
      <td>${nombre}</td>
      <td>${promedio}</td>
    </tr>
  `;
}
async function renderCuadroHonor() {
  const ctx = getContext();
  const tbody = document.querySelector('.table-honor tbody');
  if (!tbody) return;

  try {
    const lista = await fetchCuadroHonor(ctx);
    lista.sort((a, b) => toFloat(b.promedio_general) - toFloat(a.promedio_general));
    const rows = lista.map((it, i) => honorRowTemplate(it, i)).join('');
    tbody.innerHTML = rows || `<tr><td colspan="3" class="text-center">Sin datos</td></tr>`;
  } catch (e) {
    console.error('Error cuadro de honor:', e);
    tbody.innerHTML = `<tr><td colspan="3" class="text-center text-danger">No fue posible cargar el cuadro de honor.</td></tr>`;
  }
}

// ========== (3) Rendimiento por materia (progreso) ==========
function progressColor(pct) {
  if (pct >= 85) return 'bg-success';
  if (pct >= 70) return 'bg-primary';
  if (pct >= 50) return 'bg-warning';
  return 'bg-danger';
}
function progressItemTemplate(nombre, pct) {
  const pctTxt = `${Math.round(pct)}%`;
  const cls = progressColor(pct);
  return `
    <div class="subject-name mb-1">
      ${nombre}
    </div>
    <div class="progress mb-3" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pct)}">
      <div class="progress-bar ${cls}" style="width:${Math.min(100, Math.max(0, pct))}%">
        <span>${pctTxt}</span>
      </div>
    </div>
  `;
}
async function renderRendimiento() {
  const ctx = getContext();
  const cont = document.querySelector('.subject-container');
  if (!cont) return;

  try {
    const data = await fetchPendCum(ctx); // ya devuelve cumplidas/total por materia
    if (data.length === 0) {
      cont.innerHTML = '<p class="text-muted">Sin datos.</p>';
      return;
    }
    const html = data.map(row => {
      const total = Math.max(0, toInt(row.actividades_total));
      const done = Math.max(0, toInt(row.actividades_cumplidas));
      const pct = total > 0 ? (done / total) * 100 : 0;
      const nombre = row.nombre_materia || 'Materia';
      return progressItemTemplate(nombre, pct);
    }).join('');
    cont.innerHTML = html;
  } catch (e) {
    console.error('Error rendimiento:', e);
    cont.innerHTML = '<p class="text-danger">No fue posible cargar el rendimiento.</p>';
  }
}

// ========== bootstrap de la página ==========
document.addEventListener('DOMContentLoaded', () => {
  renderTarjetasPendientes();
  renderCuadroHonor();
  renderRendimiento();
});
