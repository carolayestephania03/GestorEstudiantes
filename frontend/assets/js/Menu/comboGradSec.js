// 🔹 Obtener elementos con verificación
const comboGrado = document.getElementById('combo_grado_direc');
const comboSeccion = document.getElementById('combo_seccion_direc');
const comboMateria = document.getElementById('combo_materia');

// =========================
// Contexto desde sessionStorage (key: "userData")
// =========================
let userData = null;

try {
    const raw = sessionStorage.getItem('userData');
    userData = raw ? JSON.parse(raw) : null;
} catch (e) {
    console.warn('userData inválido en sessionStorage:', e);
    userData = null;
}

const ROL = (userData?.rol_id || '').trim().toUpperCase();
const GRADO_TXT = (userData?.maestro_grado_actual || 'Primero').trim();
const SECCION_TXT = (userData?.maestro_seccion_actual || 'A').trim();

console.log('ComboGradoSec - ROL:', ROL, 'GRADO_TXT:', GRADO_TXT, 'SECCION_TXT:', SECCION_TXT);

// Utilidad: seleccionar opción por texto visible
function seleccionarPorTexto(selectEl, texto) {
    if (!selectEl) return false;
    const target = (texto || '').trim().toLowerCase();

    for (let i = 0; i < selectEl.options.length; i++) {
        const opt = selectEl.options[i];
        const optText = (opt.textContent || '').trim().toLowerCase();
        if (optText === target) {
            selectEl.selectedIndex = i;
            return true;
        }
    }
    return false;
}

function ActivarComBoBox(rol) {
    const r = (rol || '').trim().toUpperCase();

    console.log('ActivarComBoBox - ROL recibido:', r);

    if (r === 'M') {
        // Maestro: bloquear ambos
        comboGrado.disabled = true;
        comboSeccion.disabled = true;
    } else if (r === 'D') {
        // Director: habilitar ambos
        comboGrado.disabled = false;
        comboSeccion.disabled = false;
    } else {
        // Por defecto: habilitar (o si prefieres, bloquear)
        comboGrado.disabled = false;
        comboSeccion.disabled = false;
    }
}

// =========================
// Obtener grados y secciones desde el servidor
// =========================
async function fetchGrado() {
    try {
        const r = await fetch('http://localhost:8001/grado', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        if (!r.ok) throw new Error('Grado HTTP ' + r.status);

        const json = await r.json();
        const grados = Array.isArray(json.data) ? json.data : [];

        while (comboGrado.options.length > 1) {
            comboGrado.remove(1);
        }

        grados.forEach(grado => {
            if (grado.estado === true) {
                const option = document.createElement('option');
                option.value = grado.grado_id;
                option.textContent = grado.grado_des;
                comboGrado.appendChild(option);
            }
        });

        // ✅ Selección automática por sessionStorage
        seleccionarPorTexto(comboGrado, GRADO_TXT);

        return grados;

    } catch (error) {
        console.error('Error al obtener grados:', error);
        throw error;
    }
}

async function fetchSeccion() {
    try {
        const r = await fetch('http://localhost:8001/seccion', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        if (!r.ok) throw new Error('Seccion HTTP ' + r.status);

        const json = await r.json();
        const secciones = Array.isArray(json.data) ? json.data : [];

        while (comboSeccion.options.length > 1) {
            comboSeccion.remove(1);
        }

        secciones.forEach(seccion => {
            if (seccion.estado === true) {
                const option = document.createElement('option');
                option.value = seccion.seccion_id;
                option.textContent = seccion.seccion_des;
                comboSeccion.appendChild(option);
            }
        });

        // ✅ Selección automática por sessionStorage
        seleccionarPorTexto(comboSeccion, SECCION_TXT);

        return secciones;

    } catch (error) {
        console.error('Error al obtener seccion:', error);
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    // 1) Cargar combos
    await fetchGrado();
    await fetchSeccion();

    // 2) Reafirmar selección por si el DOM tardó en pintar opciones
    seleccionarPorTexto(comboGrado, GRADO_TXT);
    seleccionarPorTexto(comboSeccion, SECCION_TXT);

    ActivarComBoBox(ROL);
});
