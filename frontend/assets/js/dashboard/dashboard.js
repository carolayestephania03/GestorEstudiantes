(() => {
  'use strict';

  // ====== reglas de materias (materia_id) ======
  const PrimeroATercero = [1, 2, 3, 4, 5];
  const CuartoASexto   = [1, 2, 6, 7, 5, 4, 8];
  const Fisica         = [9];
  const Computacion    = [10];

  // ====== elementos DOM (sin chocar con otros scripts) ======
  const selGrado   = document.getElementById('combo_grado_direc');
  const selSeccion = document.getElementById('combo_seccion_direc');
  const selCiclo   = document.getElementById('combo_ciclo_direc');
  const contCards  = document.getElementById('tarjetas_materias');

  // OJO: tu HTML no trae id en el botón; si ya lo agregaste, perfecto.
  // Si NO tienes id="VisualizarInfo", entonces ponlo en el HTML o cambia este selector.
  const btnVer     = document.getElementById('VisualizarInfo'); // botón "Ver" (opcional)

  // ====== userData (sessionStorage) ======
  let userData = null;
  try {
    const raw = sessionStorage.getItem('userData');
    userData = raw ? JSON.parse(raw) : null;
  } catch {
    userData = null;
  }
  const ROL = (userData?.rol_id || '').trim().toUpperCase();
  const ANIO = new Date().getFullYear();

  // ====== ciclo fijo inicial ======
  const CICLO_INICIAL = 1;

  // =========================================================
  // Cache (memoria + sessionStorage)
  // =========================================================
  const NOTAS_CACHE_KEY = 'cache_notas_grado_sec';

  const NotasCache = {
    _mem: new Map(),
    _makeKey(p) { return `g${p.grado_id}_s${p.seccion_id}_c${p.ciclo_id}_a${p.anio}`; },

    get(p) {
      const k = this._makeKey(p);
      if (this._mem.has(k)) return this._mem.get(k);

      try {
        const raw = sessionStorage.getItem(NOTAS_CACHE_KEY);
        if (!raw) return null;
        const obj = JSON.parse(raw);
        if (!obj || !obj[k]) return null;
        this._mem.set(k, obj[k]);
        return obj[k];
      } catch {
        return null;
      }
    },

    set(p, value) {
      const k = this._makeKey(p);
      this._mem.set(k, value);

      try {
        const raw = sessionStorage.getItem(NOTAS_CACHE_KEY);
        const obj = raw ? JSON.parse(raw) : {};
        obj[k] = value;
        sessionStorage.setItem(NOTAS_CACHE_KEY, JSON.stringify(obj));
      } catch {
        // si falla sessionStorage, queda en memoria
      }
    }
  };

  // =========================================================
  // Helpers
  // =========================================================
  function toInt(x, def = 0) {
    const n = parseInt(x, 10);
    return Number.isFinite(n) ? n : def;
  }

  function getMateriasPermitidas(gradoId, rol) {
    const r = (rol || '').trim().toUpperCase();
    if (r === 'F') return new Set(Fisica);
    if (r === 'C') return new Set(Computacion);
    if (gradoId >= 1 && gradoId <= 3) return new Set(PrimeroATercero);
    if (gradoId >= 4 && gradoId <= 6) return new Set(CuartoASexto);
    return new Set();
  }

  // ====== imágenes ======
  function slugifyMateria(nombre='') {
    return String(nombre)
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, '_')
      .trim();
  }

  const IMG_MAP = {
    matematicas: 'matematicas.png',
    comunicacion_y_lenguaje: 'comunicacion_lenguaje.png',
    educacion_fisica: 'educacion_fisica.png',
    expresion_artistica: 'expresion_artistica.png',
    formacion_ciudadana: 'formacion_ciudadana.png',
    ciencias_naturales: 'ciencias_social_natural.png',
    ciencias_sociales: 'ciencias_social_natural.png',
    ciencias_naturales_y_tecnologia: 'ciencias_social_natural.png',
    ciencias_social_y_natural: 'ciencias_social_natural.png',
    computacion: 'computacion.png'
  };

  function getMateriaImage(nombreMateria) {
    const slug = slugifyMateria(nombreMateria || '');
    if (IMG_MAP[slug]) return `/assets/img/materias/${IMG_MAP[slug]}`;

    if (/matemat/i.test(nombreMateria)) return '/assets/img/materias/matematicas.png';
    if (/comunic/i.test(nombreMateria)) return '/assets/img/materias/comunicacion_lenguaje.png';
    if (/fisic/i.test(nombreMateria)) return '/assets/img/materias/educacion_fisica.png';
    if (/artist/i.test(nombreMateria)) return '/assets/img/materias/expresion_artistica.png';
    if (/ciudadan/i.test(nombreMateria)) return '/assets/img/materias/formacion_ciudadana.png';
    if (/ciencia|social/i.test(nombreMateria)) return '/assets/img/materias/ciencias_social_natural.png';
    if (/computacion/i.test(nombreMateria)) return '/assets/img/materias/computacion.png';
    return '/assets/img/materias/matematicas.png';
  }

  function safeAttr(s) {
    return String(s ?? '').replace(/"/g, '&quot;');
  }

  // =========================================================
  // API: /actividad/NotasGradoSec
  // =========================================================
  async function fetchNotasGradoSec(payload) {
    const r = await fetch('http://localhost:8001/actividad/NotasGradoSec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    if (!r.ok) throw new Error('NotasGradoSec HTTP ' + r.status);
    const json = await r.json();
    return Array.isArray(json.data) ? json.data : [];
  }

  // =========================================================
  // Tarjetas (MISMA estética que antes)
  // =========================================================
  function cardMateriaTemplateFromNotas(item) {
    const pendientes = toInt(item.total_pendientes);
    const nombre = item.nombre_materia || 'Materia';
    const img = getMateriaImage(nombre);

    return `
      <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6 mb-4">
        <div class="card card-info position-relative h-100">
          <div class="card-img-container">
            <img src="${img}" alt="${safeAttr(nombre)}">
          </div>
          <div class="card-body d-flex flex-column align-items-start">
            <h3 class="h6 mb-2 text-uppercase text-muted">${nombre}</h3>
            <div class="display-5 fw-bold ${pendientes>0 ? 'text-danger' : 'text-success'} lh-1">
              ${pendientes}
            </div>
            <div class="small text-secondary mt-1">tareas pendientes</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderTarjetas(lista) {
    if (!contCards) return;

    if (!lista || !lista.length) {
      contCards.innerHTML = '<p class="text-center">No se encontraron materias.</p>';
      return;
    }

    lista.sort((a, b) => toInt(b.total_pendientes) - toInt(a.total_pendientes));
    contCards.innerHTML = lista.map(cardMateriaTemplateFromNotas).join('');
  }

  // =========================================================
  // Ciclo: inicial fijo 1, pero con botón "Ver" usa seleccionado
  // =========================================================
  function getCicloId(initialLoad) {
    if (initialLoad) {
      if (selCiclo) selCiclo.value = String(CICLO_INICIAL);
      return CICLO_INICIAL;
    }
    const c = toInt(selCiclo?.value, CICLO_INICIAL);
    return c > 0 ? c : CICLO_INICIAL;
  }

  async function cargarDashboard(initialLoad = true) {
    const grado_id = toInt(selGrado?.value, 0);
    const seccion_id = toInt(selSeccion?.value, 0);
    const ciclo_id = getCicloId(initialLoad);

    if (!grado_id || !seccion_id) {
      if (contCards) {
        contCards.innerHTML = `<p class="text-center text-muted">Seleccione grado y sección para visualizar.</p>`;
      }
      return;
    }

    const payload = { grado_id, seccion_id, ciclo_id, anio: ANIO };

    try {
      let data = NotasCache.get(payload);
      if (!data) {
        data = await fetchNotasGradoSec(payload);
        NotasCache.set(payload, data);
      }

      const permitidas = getMateriasPermitidas(grado_id, ROL);
      const filtrada = (data || []).filter(m => permitidas.has(toInt(m.materia_id)));

      renderTarjetas(filtrada);

    } catch (e) {
      console.error('Error cargarDashboard:', e);
      if (contCards) {
        contCards.innerHTML = '<p class="text-center text-danger">No fue posible cargar las materias.</p>';
      }
    }
  }

  // Esperar a que los combos tengan valores (porque se llenan async en comboGradSec.js)
  function esperarCombosListosYcargar(maxIntentos = 40) {
    let i = 0;
    const t = setInterval(() => {
      i++;

      const g = toInt(selGrado?.value, 0);
      const s = toInt(selSeccion?.value, 0);

      if (g > 0 && s > 0) {
        clearInterval(t);
        // ✅ primera carga usa ciclo 1
        cargarDashboard(true);
        return;
      }

      if (i >= maxIntentos) {
        clearInterval(t);
        if (selCiclo) selCiclo.value = String(CICLO_INICIAL);
        if (contCards) contCards.innerHTML = `<p class="text-center text-muted">Seleccione grado y sección para visualizar.</p>`;
      }
    }, 200);
  }

  // =========================================================
  // Bootstrap
  // =========================================================
  document.addEventListener('DOMContentLoaded', () => {
    if (contCards) contCards.innerHTML = `<p class="text-center text-muted">Cargando materias...</p>`;

    // ✅ primera carga: set ciclo 1
    if (selCiclo) selCiclo.value = String(CICLO_INICIAL);

    // Auto-carga inicial
    esperarCombosListosYcargar();

    // Si cambian grado/sección, volvemos a modo inicial (ciclo 1)
    selGrado?.addEventListener('change', () => cargarDashboard(true));
    selSeccion?.addEventListener('change', () => cargarDashboard(true));

    // ✅ Botón Ver: respeta ciclo elegido
    btnVer?.addEventListener('click', () => cargarDashboard(false));
  });

})();
