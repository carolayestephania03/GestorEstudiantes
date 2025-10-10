// Script para controlar la Lista de Cotejo
document.addEventListener('DOMContentLoaded', function() {
  // Referencias a elementos del DOM
  const materiaEspecifica = document.getElementById('materiaEspecifica');
  const todasMaterias = document.getElementById('todasMaterias');
  const selectMateriaContainer = document.getElementById('selectMateriaContainer');
  const selectMateria = document.getElementById('selectMateria');
  const btnVistaPrevia = document.getElementById('btnVistaPrevia');
  const btnImprimir = document.getElementById('btnImprimir');

  // Datos de ejemplo (se usarán hasta conectar con la BD)
  // NOTA: Las materias variarán según el grado que el maestro imparta
  // Al conectar con la BD, estas se obtendrán del endpoint:
  // GET ${ENV.API_URL}/materia?grado={grado_id}&seccion={seccion_id}
  const materiasEjemplo = [
    { materia_id: 1, nombre_materia: 'Matemáticas' },
    { materia_id: 2, nombre_materia: 'Comunicación y Lenguaje' },
    { materia_id: 3, nombre_materia: 'Expresión Artística' }
  ];

  const alumnosEjemplo = [
    'Abadillo Moscoso Jadelin Yaleshka',
    'Aguilar Arenas Brenda Gabriela Yolanda',
    'Alonzo Gonzalez Kimberly Daniela',
    'Canales Luque Kristopher Jener',
    'Carias Calderon Héctor Amilcar Josué',
    'Estrada Méndez Ana Sofía',
    'García López Carlos Eduardo',
    'Hernández Pérez María José',
    'López Ramírez Diego Alejandro',
    'Martínez Sánchez Laura Patricia'
  ];

  // ========== Inicialización ==========
  function init() {
    cargarMaterias();
    configurarEventListeners();
  }

  // ========== Cargar Materias desde la Base de Datos ==========
  async function cargarMaterias() {
    try {
      // TODO: Implementar obtención del grado y sección del maestro
      // Por ahora se obtienen todas las materias, pero debería filtrarse por grado
      // Ejemplo: const grado = obtenerGradoMaestro();
      // Ejemplo: const seccion = obtenerSeccionMaestro();
      // Ejemplo URL: `${ENV.API_URL}/materia?grado=${grado}&seccion=${seccion}`
      
      const response = await fetch(`${ENV.API_URL}/materia`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al cargar las materias');
      }

      const data = await response.json();
      
      // Limpiar el select
      selectMateria.innerHTML = '<option value="">Seleccionar materia</option>';
      
      // Agregar las materias al select
      // Las materias varían según el grado del maestro
      if (data.data && Array.isArray(data.data)) {
        data.data.forEach(materia => {
          const option = document.createElement('option');
          option.value = materia.materia_id;
          option.textContent = materia.nombre_materia;
          selectMateria.appendChild(option);
        });
      }
    } catch (error) {
      console.error('Error al cargar materias, usando datos de ejemplo:', error);
      // Usar datos de ejemplo si falla la conexión
      cargarMateriasEjemplo();
    }
  }

  // Cargar materias de ejemplo
  function cargarMateriasEjemplo() {
    selectMateria.innerHTML = '<option value="">Seleccionar materia</option>';
    materiasEjemplo.forEach(materia => {
      const option = document.createElement('option');
      option.value = materia.materia_id;
      option.textContent = materia.nombre_materia;
      selectMateria.appendChild(option);
    });
  }

  // ========== Configurar Event Listeners ==========
  function configurarEventListeners() {
    // Event listeners para los radio buttons
    materiaEspecifica.addEventListener('change', toggleMateriaSelector);
    todasMaterias.addEventListener('change', toggleMateriaSelector);

    // Event listeners para los botones
    btnVistaPrevia.addEventListener('click', generarVistaPrevia);
    btnImprimir.addEventListener('click', imprimirListaCotejo);
  }

  // ========== Función para mostrar/ocultar el selector de materia ==========
  function toggleMateriaSelector() {
    if (materiaEspecifica.checked) {
      selectMateriaContainer.classList.remove('hidden');
    } else {
      selectMateriaContainer.classList.add('hidden');
    }
  }

  // ========== Generar Vista Previa ==========
  function generarVistaPrevia() {
    // Validar selección
    if (materiaEspecifica.checked && !selectMateria.value) {
      alert('Por favor, selecciona una materia');
      return;
    }

    const vistaPreviaContainer = document.getElementById('vistaPreviaListaCotejo');
    vistaPreviaContainer.innerHTML = '';

    if (materiaEspecifica.checked) {
      // Vista previa de una materia específica
      const materiaId = selectMateria.value;
      const materiaNombre = selectMateria.options[selectMateria.selectedIndex].text;
      const html = generarHTMLListaCotejo(materiaNombre);
      vistaPreviaContainer.innerHTML = html;
    } else {
      // Vista previa de todas las materias
      materiasEjemplo.forEach(materia => {
        const html = generarHTMLListaCotejo(materia.nombre_materia);
        vistaPreviaContainer.innerHTML += html;
      });
    }

    // Scroll hacia la vista previa
    vistaPreviaContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ========== Imprimir Lista de Cotejo ==========
  async function imprimirListaCotejo() {
    // Validar selección
    if (materiaEspecifica.checked && !selectMateria.value) {
      alert('Por favor, selecciona una materia');
      return;
    }

    // Crear contenedor temporal para el PDF
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    document.body.appendChild(tempContainer);

    let materiasAImprimir = [];

    if (materiaEspecifica.checked) {
      // Imprimir una materia específica
      const materiaNombre = selectMateria.options[selectMateria.selectedIndex].text;
      materiasAImprimir.push(materiaNombre);
    } else {
      // Imprimir todas las materias del grado del maestro
      // Usando datos de ejemplo por ahora (3 materias)
      // Al conectar con la BD, esto obtendrá las materias del grado específico
      materiasAImprimir = materiasEjemplo.map(m => m.nombre_materia);
    }

    // Generar HTML para todas las materias
    materiasAImprimir.forEach(materiaNombre => {
      tempContainer.innerHTML += generarHTMLListaCotejo(materiaNombre);
    });

    // Configuración para html2pdf
    const opt = {
      margin: 0,
      filename: `Lista_Cotejo_${materiasAImprimir.length > 1 ? 'Todas_Materias' : materiasAImprimir[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'in', 
        format: 'letter', 
        orientation: 'landscape' 
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      // Generar el PDF
      await html2pdf().set(opt).from(tempContainer).save();
      
      // Limpiar
      document.body.removeChild(tempContainer);
      
      console.log('PDF generado exitosamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF');
      document.body.removeChild(tempContainer);
    }
  }

  // ========== Funciones de utilidad para implementación futura ==========

  /**
   * Obtiene los datos para generar la lista de cotejo
   * @param {number|null} materiaId - ID de la materia (null para todas)
   * @returns {Promise} Promesa con los datos de la lista
   */
  async function obtenerDatosListaCotejo(materiaId = null) {
    try {
      const url = materiaId 
        ? `${ENV.API_URL}/lista-cotejo/materia/${materiaId}`
        : `${ENV.API_URL}/lista-cotejo/todas`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al obtener datos de la lista de cotejo');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener datos:', error);
      throw error;
    }
  }

  /**
   * Genera el HTML para la vista previa de la lista de cotejo
   * @param {string} materiaNombre - Nombre de la materia
   * @returns {string} HTML generado
   */
  function generarHTMLListaCotejo(materiaNombre) {
    // Generar 30 filas de estudiantes (10 reales + 20 vacías)
    let filasEstudiantes = '';
    
    for (let i = 0; i < 30; i++) {
      const nombreAlumno = i < alumnosEjemplo.length ? alumnosEjemplo[i] : '';
      filasEstudiantes += `
        <tr>
          <td class="col-no">${i + 1}.</td>
          <td class="col-nombre">${nombreAlumno}</td>
          <!-- Procedimentales (6 columnas) -->
          <td class="col-procedimental"></td>
          <td class="col-procedimental"></td>
          <td class="col-procedimental"></td>
          <td class="col-procedimental"></td>
          <td class="col-procedimental"></td>
          <td class="col-procedimental"></td>
          <td class="col-procedimental">Total</td>
          <!-- Actitudinal (7 columnas) -->
          <td class="col-actitudinal-cell"></td>
          <td class="col-actitudinal-cell"></td>
          <td class="col-actitudinal-cell"></td>
          <td class="col-actitudinal-cell"></td>
          <td class="col-actitudinal-cell"></td>
          <td class="col-actitudinal-cell"></td>
          <td class="col-actitudinal-cell">Total</td>
          <!-- Declarativos (3 columnas) -->
          <td class="col-declarativo"></td>
          <td class="col-declarativo"></td>
          <td class="col-declarativo">Total</td>
          <!-- Nota final -->
          <td class="col-final"></td>
        </tr>
      `;
    }

    return `
      <div class="lista-cotejo-page">
        <!-- Header -->
        <div class="lista-header">
          <div class="lista-title">
            <h1>Escuela Oficial Rural Mixta Colonia Linda Vista</h1>
          </div>
          <div class="lista-logo">
            <img src="../../assets/img/LogoEscuela.png" alt="Logo">
          </div>
        </div>

        <!-- Información -->
        <div class="lista-info">
          <div class="lista-info-row">
            <div class="lista-info-field">
              <label>Docente:</label>
              <span>_____________________________________</span>
            </div>
            <div class="lista-info-field">
              <label>Bloque:</label>
              <span>_____________________________________</span>
            </div>
          </div>
          <div class="lista-info-row">
            <div class="lista-info-field">
              <label>CICLO ESCOLAR:</label>
              <span>____________________________</span>
            </div>
            <div class="lista-info-field">
              <label>ÁREA:</label>
              <span>${materiaNombre}</span>
            </div>
          </div>
          <div class="lista-info-row">
            <div class="lista-info-field">
              <label>GRADO:</label>
              <span>____________________________</span>
            </div>
            <div class="lista-info-field">
              <label>SECCIÓN:</label>
              <span>____________</span>
            </div>
          </div>
        </div>

        <!-- Tabla -->
        <div class="lista-table-container">
          <table class="lista-table">
            <!-- Encabezado principal -->
            <thead>
              <tr class="header-main">
                <th colspan="2" class="col-nombres" rowspan="2">Nombre del alumno</th>
                <th class="col-procedimentales">Procedimentales (Psicomotriz)<br>40 Pts.</th>
                <th class="col-actitudinal">Actitudinal (Afectivo) 20 pts.</th>
                <th class="col-declarativos">Declarativos<br>(Cognoscitivo)</th>
                <th class="col-nota-final" rowspan="2">Nota final</th>
              </tr>
              <tr class="header-sub">
                <th class="sub-procedimentales" colspan="7">Trabajos, proyectos o ejercicios<br>40 Pts.</th>
                <th class="sub-actitudinal" colspan="7"></th>
                <th class="sub-declarativos" colspan="3">40 Pts.</th>
              </tr>
              <tr class="header-sub">
                <th class="col-nombres">No</th>
                <th class="col-nombres" style="text-align: center; text-decoration: underline;">Nombre del alumno</th>
                <th class="sub-procedimentales">1</th>
                <th class="sub-procedimentales">2</th>
                <th class="sub-procedimentales">3</th>
                <th class="sub-procedimentales">4</th>
                <th class="sub-procedimentales">5</th>
                <th class="sub-procedimentales">6</th>
                <th class="sub-procedimentales">Total</th>
                <th class="sub-actitudinal"></th>
                <th class="sub-actitudinal"></th>
                <th class="sub-actitudinal"></th>
                <th class="sub-actitudinal"></th>
                <th class="sub-actitudinal"></th>
                <th class="sub-actitudinal"></th>
                <th class="sub-actitudinal">Total</th>
                <th class="sub-declarativos"></th>
                <th class="sub-declarativos"></th>
                <th class="sub-declarativos">Total</th>
                <th class="sub-nota-final">100 Pts.</th>
              </tr>
            </thead>
            <!-- Cuerpo de la tabla -->
            <tbody>
              ${filasEstudiantes}
            </tbody>
          </table>
        </div>

        <!-- Firmas -->
        <div class="lista-firmas">
          <div class="lista-firma-item">
            <div class="lista-firma-linea"></div>
            <div class="lista-firma-label">Firma Docente</div>
          </div>
          <div class="lista-firma-item">
            <div class="lista-firma-linea"></div>
            <div class="lista-firma-label">Vo.Bo. Directora</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Imprime el documento
   */
  function ejecutarImpresion() {
    window.print();
  }

  // Inicializar la aplicación
  init();
});

