// Función para obtener las materias desde la API
async function obtenerMaterias() {
    try {
        const response = await fetch('http://localhost:8001/materia', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        return data.data; // Retorna el array de materias
    } catch (error) {
        console.error('Error al obtener las materias:', error);
        return []; // Retorna array vacío en caso de error
    }
}

// Función para crear una tarjeta de materia
function crearTarjetaMateria(materia) {
    return `
        <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6 mb-4">
            <div class="card card-info">
                <div class="card-img-container">
                    <img
                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80"
                        alt="${materia.nombre_materia}">
                </div>
                <div class="card-body">
                    <h3>${materia.nombre_materia}</h3>
                    <p class="card-text">${materia.descripcion_materia}</p>
                </div>
            </div>
        </div>
    `;
}

// Función principal para cargar y mostrar las materias
async function cargarMaterias() {
    const materias = await obtenerMaterias();
    const container = document.getElementById('tarjetas_materias');
    
    if (!container) {
        console.error('No se encontró el contenedor con id "tarjetas_materias"');
        return;
    }
    
    if (materias.length === 0) {
        container.innerHTML = '<p class="text-center">No se encontraron materias.</p>';
        return;
    }

    // Crear el HTML de todas las tarjetas
    const tarjetasHTML = materias.map(materia => crearTarjetaMateria(materia)).join('');
    
    // Insertar las tarjetas en el contenedor
    container.innerHTML = tarjetasHTML;
}

// Ejecutar cuando el documento esté listo
document.addEventListener('DOMContentLoaded', function() {
    cargarMaterias();
});