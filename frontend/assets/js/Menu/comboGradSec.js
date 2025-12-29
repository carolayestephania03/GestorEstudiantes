// 🔹 Obtener elementos con verificación
const comboGrado = document.getElementById('combo_grado_direc');
const comboSeccion = document.getElementById('combo_seccion_direc');
const comboMateria = document.getElementById('combo_materia');

// Obtener grados y secciones desde el servidor
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

        return secciones;

    } catch (error) {
        console.error('Error al obtener seccion:', error);
        throw error;
    }
}

async function fetchMateria() {
    try {
        const r = await fetch('http://localhost:8001/materia', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        if (!r.ok) throw new Error('Materia HTTP ' + r.status);

        const json = await r.json();
        const materias = Array.isArray(json.data) ? json.data : [];

        while (comboMateria.options.length > 1) {
            comboMateria.remove(1);
        }

        materias.forEach(materia => {
            if (materia.estado === true) {
                const option = document.createElement('option');
                option.value = materia.materia_id;
                option.textContent = materia.nombre_materia;
                comboMateria.appendChild(option);
            }
        });

        return materias;

    } catch (error) {
        console.error('Error al obtener materias:', error);
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    fetchGrado();
    fetchSeccion();
    fetchMateria();
});