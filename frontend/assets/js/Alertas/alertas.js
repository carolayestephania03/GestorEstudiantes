(() => {
  'use strict';

  /* ================== REGLAS DE MATERIAS ================== */
  const PrimeroATercero = [1, 2, 3, 4, 5];
  const CuartoASexto   = [1, 2, 6, 7, 5, 4, 8];
  const Fisica         = [9];
  const Computacion    = [10];

  /* ================== DOM ================== */
  const selGrado   = document.getElementById('combo_grado_direc');
  const selSeccion = document.getElementById('combo_seccion_direc');
  const selCiclo   = document.getElementById('combo_ciclo_direc');
  const btnVer     = document.getElementById('VisualizarInfo');

  const wrap7  = document.getElementById('alerta-7-dias');
  const wrap14 = document.getElementById('alerta-14-dias');
  const wrap21 = document.getElementById('alerta-21-dias');

  if (!wrap7 || !wrap14 || !wrap21) return;

  /* ================== USER DATA ================== */
  let userData = null;
  try {
    userData = JSON.parse(sessionStorage.getItem('userData'));
  } catch {
    userData = null;
  }

  const ROL  = (userData?.rol_id || '').toUpperCase();
  const ANIO = new Date().getFullYear();
  const CICLO_DEFAULT = 1;

  /* ================== HELPERS ================== */
  const toInt = (v, d = 0) => Number.isFinite(parseInt(v, 10)) ? parseInt(v, 10) : d;

  const safe = (t) =>
    String(t ?? '').replace(/[&<>"']/g, c =>
      ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])
    );

  const fmtFecha = (f) => f ? new Date(f).toLocaleDateString('es-GT') : '';

  function getMateriasPermitidas(gradoId) {
    if (ROL === 'F') return new Set(Fisica);
    if (ROL === 'C') return new Set(Computacion);
    if (gradoId >= 1 && gradoId <= 3) return new Set(PrimeroATercero);
    if (gradoId >= 4 && gradoId <= 6) return new Set(CuartoASexto);
    return new Set();
  }

  function limpiar() {
    wrap7.innerHTML  = '';
    wrap14.innerHTML = '';
    wrap21.innerHTML = '';
  }

  /* ================== CARD ================== */
  function cardActividad(a) {
    return `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="card h-100 shadow border-0">
          <div class="card-header bg-light d-flex justify-content-between">
            <span class="badge bg-primary">${safe(a.nombre_materia)}</span>
            <small>Puntaje: <strong>${safe(a.puntaje_maximo)}</strong></small>
          </div>

          <div class="card-body">
            <h5 class="card-title text-primary">
              ${safe(a.nombre_actividad)}
            </h5>
            <p class="card-text text-muted">
              ${safe(a.descripcion)}
            </p>
          </div>

          <div class="card-footer bg-white border-0">
            <small class="text-muted">
              Creación: ${fmtFecha(a.fecha_creacion)}
            </small><br>
            <small class="text-danger">
              Entrega: ${fmtFecha(a.fecha_entrega)}
            </small>
          </div>
        </div>
      </div>
    `;
  }

  /* ================== FETCH ================== */
  async function fetchActividades(payload) {
    const r = await fetch(
      'http://localhost:8001/actividad/ActividadesAgrupadasPorAviso',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    return Array.isArray(j.data) ? j.data : [];
  }

  /* ================== RENDER ================== */
  function render(data, permitidas) {
    limpiar();

    data.forEach(grupo => {
      const aviso = toInt(grupo.aviso_actividad);
      if (aviso === 0) return;

      let contenedor = null;
      if (aviso === 1) contenedor = wrap7;
      if (aviso === 2) contenedor = wrap14;
      if (aviso === 3) contenedor = wrap21;
      if (!contenedor) return;

      grupo.actividades.forEach(a => {
        const materiaId = toInt(a.materia_id);
        if (!permitidas.has(materiaId)) return;

        contenedor.insertAdjacentHTML('beforeend', cardActividad(a));
      });
    });
  }

  /* ================== ORQUESTACIÓN ================== */
  async function cargar() {
    const grado_id   = toInt(selGrado?.value);
    const seccion_id = toInt(selSeccion?.value);
    const ciclo_id   = toInt(selCiclo?.value, CICLO_DEFAULT);

    if (!grado_id || !seccion_id) return;

    const permitidas = getMateriasPermitidas(grado_id);

    try {
      const data = await fetchActividades({
        grado_id,
        seccion_id,
        ciclo_id,
        anio: ANIO
      });

      render(data, permitidas);
    } catch (e) {
      console.error('Error cargando alertas:', e);
      limpiar();
    }
  }

  /* ================== INIT ================== */
  document.addEventListener('DOMContentLoaded', () => {
    if (selCiclo) selCiclo.value = String(CICLO_DEFAULT);

    setTimeout(() => cargar(), 300);

    btnVer?.addEventListener('click', cargar);

    selGrado?.addEventListener('change', cargar);
    selSeccion?.addEventListener('change', cargar);
    selCiclo?.addEventListener('change', cargar);
  });

})();
