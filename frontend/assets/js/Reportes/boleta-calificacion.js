// Datos de ejemplo - estos vendrán del backend
const materiasPorGrado = {
  1: [
    "Comunicación y Lenguaje",
    "Matemáticas", 
    "Medio Natural y Social",
    "Expresión Artística",
    "Educación Física",
    "Formación Ciudadana"
  ],
  2: [
    "Comunicación y Lenguaje",
    "Matemáticas",
    "Medio Natural y Social", 
    "Expresión Artística",
    "Educación Física",
    "Formación Ciudadana"
  ],
  3: [
    "Comunicación y Lenguaje",
    "Matemáticas",
    "Medio Natural y Social",
    "Expresión Artística", 
    "Educación Física",
    "Formación Ciudadana"
  ],
  4: [
    "Comunicación y Lenguaje",
    "Matemáticas",
    "Medio Natural y Social",
    "Expresión Artística",
    "Educación Física", 
    "Formación Ciudadana"
  ],
  5: [
    "Comunicación y Lenguaje",
    "Matemáticas",
    "Medio Natural y Social",
    "Expresión Artística",
    "Educación Física",
    "Formación Ciudadana"
  ],
  6: [
    "Comunicación y Lenguaje",
    "Matemáticas",
    "Medio Natural y Social",
    "Expresión Artística",
    "Educación Física",
    "Formación Ciudadana"
  ]
};

// Datos de ejemplo de estudiantes - estos vendrán del backend
const estudiantesEjemplo = [
  {
    id: 1,
    nombre: "Juan Pérez García",
    grado: "1",
    calificaciones: {
      "Comunicación y Lenguaje": { unidad1: 85, unidad2: 90, unidad3: 88, unidad4: 92, final: 89 },
      "Matemáticas": { unidad1: 78, unidad2: 82, unidad3: 85, unidad4: 88, final: 83 },
      "Medio Natural y Social": { unidad1: 90, unidad2: 87, unidad3: 91, unidad4: 89, final: 89 },
      "Expresión Artística": { unidad1: 88, unidad2: 85, unidad3: 90, unidad4: 87, final: 88 },
      "Educación Física": { unidad1: 92, unidad2: 89, unidad3: 91, unidad4: 90, final: 91 },
      "Formación Ciudadana": { unidad1: 85, unidad2: 88, unidad3: 86, unidad4: 89, final: 87 }
    }
  },
  {
    id: 2,
    nombre: "María López Rodríguez",
    grado: "2",
    calificaciones: {
      "Comunicación y Lenguaje": { unidad1: 92, unidad2: 88, unidad3: 90, unidad4: 91, final: 90 },
      "Matemáticas": { unidad1: 85, unidad2: 89, unidad3: 87, unidad4: 90, final: 88 },
      "Medio Natural y Social": { unidad1: 88, unidad2: 91, unidad3: 89, unidad4: 92, final: 90 },
      "Expresión Artística": { unidad1: 90, unidad2: 87, unidad3: 89, unidad4: 88, final: 89 },
      "Educación Física": { unidad1: 89, unidad2: 92, unidad3: 88, unidad4: 91, final: 90 },
      "Formación Ciudadana": { unidad1: 87, unidad2: 90, unidad3: 88, unidad4: 89, final: 89 }
    }
  },
  {
    id: 3,
    nombre: "Carlos Hernández Martínez",
    grado: "3",
    calificaciones: {
      "Comunicación y Lenguaje": { unidad1: 80, unidad2: 85, unidad3: 82, unidad4: 87, final: 84 },
      "Matemáticas": { unidad1: 75, unidad2: 80, unidad3: 78, unidad4: 83, final: 79 },
      "Medio Natural y Social": { unidad1: 88, unidad2: 85, unidad3: 90, unidad4: 87, final: 88 },
      "Expresión Artística": { unidad1: 85, unidad2: 82, unidad3: 87, unidad4: 84, final: 85 },
      "Educación Física": { unidad1: 90, unidad2: 87, unidad3: 89, unidad4: 88, final: 89 },
      "Formación Ciudadana": { unidad1: 83, unidad2: 86, unidad3: 84, unidad4: 87, final: 85 }
    }
  },
  {
    id: 4,
    nombre: "Ana García Sánchez",
    grado: "4",
    calificaciones: {
      "Comunicación y Lenguaje": { unidad1: 95, unidad2: 92, unidad3: 94, unidad4: 93, final: 94 },
      "Matemáticas": { unidad1: 90, unidad2: 93, unidad3: 91, unidad4: 94, final: 92 },
      "Medio Natural y Social": { unidad1: 93, unidad2: 95, unidad3: 92, unidad4: 94, final: 94 },
      "Expresión Artística": { unidad1: 92, unidad2: 90, unidad3: 94, unidad4: 91, final: 92 },
      "Educación Física": { unidad1: 94, unidad2: 91, unidad3: 93, unidad4: 92, final: 93 },
      "Formación Ciudadana": { unidad1: 91, unidad2: 94, unidad3: 92, unidad4: 93, final: 93 }
    }
  },
  {
    id: 5,
    nombre: "Luis Rodríguez Pérez",
    grado: "5",
    calificaciones: {
      "Comunicación y Lenguaje": { unidad1: 87, unidad2: 90, unidad3: 88, unidad4: 91, final: 89 },
      "Matemáticas": { unidad1: 82, unidad2: 85, unidad3: 84, unidad4: 87, final: 85 },
      "Medio Natural y Social": { unidad1: 89, unidad2: 87, unidad3: 91, unidad4: 88, final: 89 },
      "Expresión Artística": { unidad1: 86, unidad2: 89, unidad3: 87, unidad4: 90, final: 88 },
      "Educación Física": { unidad1: 91, unidad2: 88, unidad3: 90, unidad4: 89, final: 90 },
      "Formación Ciudadana": { unidad1: 88, unidad2: 91, unidad3: 89, unidad4: 90, final: 90 }
    }
  }
];

// Función para generar la boleta individual
function generarBoletaIndividual(datosAlumno) {
  const {
    nombreAlumno = "NOMBRE DEL ALUMNO",
    grado = "1",
    calificaciones = {},
    observaciones = "",
    nombreMaestro = "NOMBRE DEL MAESTRO",
    nombreDirector = "NOMBRE DEL DIRECTOR"
  } = datosAlumno;

  const materias = materiasPorGrado[grado] || materiasPorGrado[1];
  
  let tablaMaterias = '';
  materias.forEach(materia => {
    const calif = calificaciones[materia] || {};
    tablaMaterias += `
      <tr>
        <td class="area-column">${materia}</td>
        <td class="unidad-column">${calif.unidad1 || ''}</td>
        <td class="unidad-column">${calif.unidad2 || ''}</td>
        <td class="unidad-column">${calif.unidad3 || ''}</td>
        <td class="unidad-column">${calif.unidad4 || ''}</td>
        <td class="final-column">${calif.final || ''}</td>
      </tr>
    `;
  });

  // Calcular promedio
  const promedios = materias.map(materia => {
    const calif = calificaciones[materia] || {};
    const valores = [calif.unidad1, calif.unidad2, calif.unidad3, calif.unidad4].filter(v => v && !isNaN(v));
    return valores.length > 0 ? (valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(1) : '';
  });
  
  const promedioGeneral = promedios.filter(p => p).length > 0 
    ? (promedios.filter(p => p).reduce((a, b) => a + parseFloat(b), 0) / promedios.filter(p => p).length).toFixed(1)
    : '';

  return `
    <div class="boleta-container">
      <!-- Header -->
      <div class="boleta-header">
        <div class="boleta-logo">
          <img src="/frontend/assets/img/LogoEscuela.png" alt="Logo Escuela" class="logo-image">
        </div>
        <div class="boleta-title-section">
          <div class="boleta-school-name">ESCUELA OFICIAL RURAL MIXTA COLONIA LINDA VISTA</div>
        </div>
      </div>

      <!-- Título principal -->
      <div class="boleta-main-title">RESUMEN DE AVANCE DE LOS APRENDIZAJES</div>

      <!-- Información del alumno -->
      <div style="margin: 15px 0; font-weight: bold;">
        <div>Alumno: ${nombreAlumno}</div>
        <div>Grado: ${grado}°</div>
      </div>

      <!-- Tabla de calificaciones -->
      <table class="boleta-table">
        <thead>
          <tr>
            <th class="area-column">AREAS CURRICULARES</th>
            <th colspan="4" style="text-align: center;">UNIDADES</th>
            <th class="final-column">NOTA FINAL</th>
          </tr>
          <tr>
            <th class="area-column"></th>
            <th class="unidad-column">1</th>
            <th class="unidad-column">2</th>
            <th class="unidad-column">3</th>
            <th class="unidad-column">4</th>
            <th class="final-column"></th>
          </tr>
        </thead>
        <tbody>
          ${tablaMaterias}
          <tr>
            <td class="area-column"><strong>PROMEDIO</strong></td>
            <td class="unidad-column"></td>
            <td class="unidad-column"></td>
            <td class="unidad-column"></td>
            <td class="unidad-column"></td>
            <td class="final-column"><strong>${promedioGeneral}</strong></td>
          </tr>
        </tbody>
      </table>

      <!-- Footer -->
      <div class="boleta-footer">
        <div class="boleta-footer-left">
          <div style="margin-top: 20px;"><strong>FIRMA DE MAESTRO:</strong></div>
          <div class="boleta-signature-line"></div>
          <div style="margin-top: 15px;"><strong>FIRMA DE DIRECTOR:</strong></div>
          <div class="boleta-signature-line"></div>
        </div>
        <div class="boleta-footer-right">
          <div class="boleta-seal">SELLO</div>
        </div>
      </div>
    </div>
  `;
}

// Función para generar boleta con datos completos
function generarBoleta(datosAlumno) {
  return generarBoletaIndividual(datosAlumno);
}

// Función para generar página con dos boletas
function generarPaginaDoble(estudiante1, estudiante2) {
  const boleta1 = generarBoletaIndividualConFecha(estudiante1);
  const boleta2 = estudiante2 ? generarBoletaIndividualConFecha(estudiante2) : '';
  
  return `
    <div class="boleta-doble-container">
      ${boleta1}
      ${boleta2}
    </div>
  `;
}

// Función para generar boleta individual con fecha y firmas lado a lado
function generarBoletaIndividualConFecha(datosAlumno) {
  const {
    nombreAlumno = "NOMBRE DEL ALUMNO",
    grado = "1",
    calificaciones = {},
    observaciones = "",
    nombreMaestro = "NOMBRE DEL MAESTRO",
    nombreDirector = "NOMBRE DEL DIRECTOR"
  } = datosAlumno;

  const materias = materiasPorGrado[grado] || materiasPorGrado[1];
  
  let tablaMaterias = '';
  materias.forEach(materia => {
    const calif = calificaciones[materia] || {};
    tablaMaterias += `
      <tr>
        <td class="area-column">${materia}</td>
        <td class="unidad-column">${calif.unidad1 || ''}</td>
        <td class="unidad-column">${calif.unidad2 || ''}</td>
        <td class="unidad-column">${calif.unidad3 || ''}</td>
        <td class="unidad-column">${calif.unidad4 || ''}</td>
        <td class="final-column">${calif.final || ''}</td>
      </tr>
    `;
  });

  // Calcular promedio
  const promedios = materias.map(materia => {
    const calif = calificaciones[materia] || {};
    const valores = [calif.unidad1, calif.unidad2, calif.unidad3, calif.unidad4].filter(v => v && !isNaN(v));
    return valores.length > 0 ? (valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(1) : '';
  });
  
  const promedioGeneral = promedios.filter(p => p).length > 0 
    ? (promedios.filter(p => p).reduce((a, b) => a + parseFloat(b), 0) / promedios.filter(p => p).length).toFixed(1)
    : '';

  // Obtener fecha actual
  const fecha = new Date().toLocaleDateString('es-GT');

  return `
    <div class="boleta-container">
      <!-- Header -->
      <div class="boleta-header">
        <div class="boleta-logo">
          <img src="/frontend/assets/img/LogoEscuela.png" alt="Logo Escuela" class="logo-image">
        </div>
        <div class="boleta-title-section">
          <div class="boleta-school-name">ESCUELA OFICIAL RURAL MIXTA COLONIA LINDA VISTA</div>
        </div>
      </div>

      <!-- Título principal -->
      <div class="boleta-main-title">RESUMEN DE AVANCE DE LOS APRENDIZAJES</div>

      <!-- Información del alumno -->
      <div style="margin: 15px 0; font-weight: bold;">
        <div>Alumno: ${nombreAlumno}</div>
        <div>Grado: ${grado}°</div>
      </div>

      <!-- Tabla de calificaciones -->
      <table class="boleta-table">
        <thead>
          <tr>
            <th class="area-column">AREAS CURRICULARES</th>
            <th colspan="4" style="text-align: center;">UNIDADES</th>
            <th class="final-column">NOTA FINAL</th>
          </tr>
          <tr>
            <th class="area-column"></th>
            <th class="unidad-column">1</th>
            <th class="unidad-column">2</th>
            <th class="unidad-column">3</th>
            <th class="unidad-column">4</th>
            <th class="final-column"></th>
          </tr>
        </thead>
        <tbody>
          ${tablaMaterias}
          <tr>
            <td class="area-column"><strong>PROMEDIO</strong></td>
            <td class="unidad-column"></td>
            <td class="unidad-column"></td>
            <td class="unidad-column"></td>
            <td class="unidad-column"></td>
            <td class="final-column"><strong>${promedioGeneral}</strong></td>
          </tr>
        </tbody>
      </table>

      <!-- Footer -->
      <div class="boleta-footer">
        <div class="boleta-footer-left">
          <div class="boleta-signature-section">
            <div><strong>FIRMA DE MAESTRO:</strong></div>
            <div class="boleta-signature-line"></div>
          </div>
          <div class="boleta-signature-section">
            <div><strong>FIRMA DE DIRECTOR:</strong></div>
            <div class="boleta-signature-line"></div>
          </div>
        </div>
        <div class="boleta-footer-right">
          <div class="boleta-seal">SELLO</div>
        </div>
      </div>
    </div>
  `;
}

// Función para mostrar vista previa
function mostrarVistaPrevia() {
  const tipoImpresion = document.querySelector('input[name="tipoImpresion"]:checked').value;
  const alumno = document.getElementById('selectAlumno').value;

  if (tipoImpresion === 'especifico' && !alumno) {
    alert('Por favor seleccione un alumno');
    return;
  }

  let boletaHTML = '';

  if (tipoImpresion === 'especifico') {
    // Vista previa de un estudiante específico
    const estudiante = estudiantesEjemplo.find(e => e.nombre === alumno);
    if (estudiante) {
      const datosAlumno = {
        ...estudiante,
        observaciones: "Alumno con buen rendimiento académico",
        nombreMaestro: "Prof. María González",
        nombreDirector: "Lic. Carlos Pérez"
      };
      boletaHTML = generarBoleta(datosAlumno);
    }
  } else {
    // Vista previa de todos los estudiantes (mostrar solo los primeros 2)
    const estudiantes = estudiantesEjemplo.slice(0, 2);
    boletaHTML = generarPaginaDoble(estudiantes[0], estudiantes[1]);
  }

  document.getElementById('boletaContainer').innerHTML = boletaHTML;
  document.getElementById('vistaPreviaContainer').style.display = 'block';
}

// Función para imprimir boleta individual
function imprimirBoletaIndividual(estudiante) {
  const datosAlumno = {
    ...estudiante,
    observaciones: "Alumno con buen rendimiento académico",
    nombreMaestro: "Prof. María González",
    nombreDirector: "Lic. Carlos Pérez"
  };

  const boletaHTML = generarBoleta(datosAlumno);
  
  // Crear ventana de impresión
  const ventanaImpresion = window.open('', '_blank');
  ventanaImpresion.document.write(`
    <html>
      <head>
        <title>Boleta de Calificaciones</title>
        <link rel="stylesheet" href="/frontend/assets/css/Reportes/boleta-calificacion.css">
        <style>
          body { margin: 0; padding: 0; }
          .boleta-container {
            width: 8.5in;
            height: 5.5in;
            background: white;
            padding: 0.4in;
            font-family: Arial, sans-serif;
            font-size: 11px;
            line-height: 1.1;
            display: flex;
            flex-direction: column;
            border: 2px solid #000;
            position: relative;
            margin: 0 auto;
          }
          .boleta-header {
            display: flex;
            align-items: flex-start;
            margin-bottom: 20px;
            position: relative;
          }
          .boleta-logo {
            width: 60px;
            height: 60px;
            border: 2px solid #333;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            padding: 5px;
            overflow: hidden;
            position: absolute;
            top: 0;
            left: 0;
          }
          .boleta-logo .logo-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
            border-radius: 50%;
          }
          .boleta-title-section {
            flex: 1;
            margin-left: 80px;
            text-align: center;
          }
          .boleta-school-name {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 5px;
            text-transform: uppercase;
            line-height: 1.2;
          }
          .boleta-main-title {
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            margin-top: 10px;
            text-transform: uppercase;
          }
          .boleta-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            flex-shrink: 0;
          }
          .boleta-table th,
          .boleta-table td {
            border: 1px solid #000;
            padding: 6px;
            text-align: center;
            vertical-align: middle;
          }
          .boleta-table th {
            background-color: #f0f0f0;
            font-weight: bold;
          }
          .boleta-table .area-column {
            text-align: left;
            width: 40%;
          }
          .boleta-table .unidad-column {
            width: 12%;
          }
          .boleta-table .final-column {
            width: 12%;
          }
          .boleta-footer {
            display: flex;
            justify-content: space-between;
            margin-top: auto;
            padding-top: 10px;
          }
          .boleta-footer-left {
            flex: 1;
            display: flex;
            gap: 30px;
          }
          .boleta-footer-right {
            flex: 1;
            text-align: right;
          }
          .boleta-signature-section {
            flex: 1;
          }
          .boleta-signature-line {
            border-bottom: 1px solid #000;
            margin-top: 5px;
            height: 20px;
            width: 100%;
          }
          .boleta-seal {
            margin-top: 20px;
            font-weight: bold;
          }
          @media print {
            body { 
              margin: 0; 
              padding: 0; 
              background: white;
            }
            .boleta-container {
              width: 8.5in;
              height: 5.5in;
              margin: 0;
              padding: 0.4in;
              box-shadow: none;
              border: 2px solid #000;
            }
          }
        </style>
      </head>
      <body>
        ${boletaHTML}
        <script>
          // Imprimir automáticamente y cerrar la ventana
          window.onload = function() {
            setTimeout(function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 1000);
            }, 500);
          };
        </script>
      </body>
    </html>
  `);
  ventanaImpresion.document.close();
}

// Función para generar un solo PDF con todas las boletas
async function generarPDFTodasBoletas() {
  // Agrupar estudiantes de 2 en 2 para las páginas
  const paginas = [];
  for (let i = 0; i < estudiantesEjemplo.length; i += 2) {
    const estudiante1 = estudiantesEjemplo[i];
    const estudiante2 = estudiantesEjemplo[i + 1];
    paginas.push({ estudiante1, estudiante2, numero: Math.floor(i / 2) + 1 });
  }

  // Generar HTML completo con todas las páginas
  let htmlCompleto = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Boletas de Calificaciones</title>
        <meta charset="utf-8">
        <link rel="stylesheet" href="/frontend/assets/css/Reportes/boleta-calificacion.css">
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            font-family: Arial, sans-serif;
            background: white;
          }
          .boleta-doble-container {
            width: 8.5in;
            height: 11in;
            background: white;
            padding: 0.5in;
            font-family: Arial, sans-serif;
            font-size: 11px;
            line-height: 1.1;
            display: flex;
            flex-direction: column;
            gap: 0.5in;
            box-sizing: border-box;
            page-break-after: always;
            border: 2px solid #000;
            position: relative;
          }
          .boleta-doble-container:last-child {
            page-break-after: avoid;
          }
          .boleta-doble-container .boleta-container {
            width: 100%;
            height: 5.2in;
            border: 1px solid #ccc;
            padding: 0.3in;
            margin: 0;
            box-shadow: none;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
          }
          .boleta-doble-container .boleta-container:first-child {
            border-bottom: 2px solid #333;
          }
          .boleta-header {
            display: flex;
            align-items: flex-start;
            margin-bottom: 15px;
            position: relative;
          }
          .boleta-logo {
            width: 60px;
            height: 60px;
            border: 2px solid #333;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            padding: 5px;
            overflow: hidden;
            flex-shrink: 0;
            position: absolute;
            top: 0;
            left: 0;
          }
          .boleta-logo .logo-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
            border-radius: 50%;
          }
          .boleta-title-section {
            flex: 1;
            margin-left: 80px;
            text-align: center;
          }
          .boleta-school-name {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 5px;
            text-transform: uppercase;
            line-height: 1.2;
          }
          .boleta-main-title {
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            margin-top: 10px;
            text-transform: uppercase;
          }
          .boleta-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            flex-shrink: 0;
          }
          .boleta-table th,
          .boleta-table td {
            border: 1px solid #000;
            padding: 6px;
            text-align: center;
            vertical-align: middle;
          }
          .boleta-table th {
            background-color: #f0f0f0;
            font-weight: bold;
          }
          .boleta-table .area-column {
            text-align: left;
            width: 40%;
          }
          .boleta-table .unidad-column {
            width: 12%;
          }
          .boleta-table .final-column {
            width: 12%;
          }
          .boleta-footer {
            display: flex;
            justify-content: space-between;
            margin-top: auto;
            padding-top: 10px;
          }
          .boleta-footer-left {
            flex: 1;
            display: flex;
            gap: 30px;
          }
          .boleta-footer-right {
            flex: 1;
            text-align: right;
          }
          .boleta-signature-section {
            flex: 1;
          }
          .boleta-signature-line {
            border-bottom: 1px solid #000;
            margin-top: 5px;
            height: 20px;
            width: 100%;
          }
          .boleta-seal {
            margin-top: 20px;
            font-weight: bold;
          }
          @media print {
            body { 
              margin: 0; 
              padding: 0; 
              background: white;
            }
            .boleta-doble-container {
              width: 8.5in;
              height: 11in;
              margin: 0;
              padding: 0.5in;
              box-shadow: none;
              border: none;
              page-break-after: always;
            }
            .boleta-doble-container:last-child {
              page-break-after: avoid;
            }
            .boleta-doble-container .boleta-container {
              width: 100%;
              height: 5.2in;
              padding: 0.3in;
              margin: 0;
              box-shadow: none;
              border: 1px solid #ccc;
            }
          }
        </style>
      </head>
      <body>
  `;

  // Agregar cada página al HTML
  paginas.forEach(pagina => {
    const datosAlumno1 = {
      ...pagina.estudiante1,
      observaciones: "Alumno con buen rendimiento académico",
      nombreMaestro: "Prof. María González",
      nombreDirector: "Lic. Carlos Pérez"
    };

    const datosAlumno2 = pagina.estudiante2 ? {
      ...pagina.estudiante2,
      observaciones: "Alumno con buen rendimiento académico",
      nombreMaestro: "Prof. María González",
      nombreDirector: "Lic. Carlos Pérez"
    } : null;

    htmlCompleto += generarPaginaDoble(datosAlumno1, datosAlumno2);
  });

  htmlCompleto += `
      </body>
    </html>
  `;

  // Crear ventana de impresión
  const ventanaImpresion = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
  ventanaImpresion.document.write(htmlCompleto);
  ventanaImpresion.document.close();
  
  // Imprimir automáticamente y cerrar la ventana
  setTimeout(function() {
    ventanaImpresion.print();
    setTimeout(function() {
      ventanaImpresion.close();
    }, 1000);
  }, 500);
}

// Función principal para imprimir
function imprimirBoleta() {
  const tipoImpresion = document.querySelector('input[name="tipoImpresion"]:checked').value;
  const alumno = document.getElementById('selectAlumno').value;

  if (tipoImpresion === 'especifico') {
    if (!alumno) {
      alert('Por favor seleccione un alumno');
      return;
    }
    const estudiante = estudiantesEjemplo.find(e => e.nombre === alumno);
    if (estudiante) {
      imprimirBoletaIndividual(estudiante);
    }
  } else {
    // Generar un solo PDF con todas las boletas
    generarPDFTodasBoletas();
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Cargar alumnos de ejemplo
  const selectAlumno = document.getElementById('selectAlumno');
  
  estudiantesEjemplo.forEach(estudiante => {
    const option = document.createElement('option');
    option.value = estudiante.nombre;
    option.textContent = estudiante.nombre;
    selectAlumno.appendChild(option);
  });

  // Event listeners para los botones
  document.getElementById('btnVistaPrevia').addEventListener('click', mostrarVistaPrevia);
  document.getElementById('btnGenerarBoleta').addEventListener('click', imprimirBoleta);

  // Event listeners para los radio buttons
  document.getElementById('estudianteEspecifico').addEventListener('change', function() {
    if (this.checked) {
      document.getElementById('selectAlumnoContainer').style.display = 'block';
      document.getElementById('btnText').textContent = 'Generar Boleta';
    }
  });

  document.getElementById('todosEstudiantes').addEventListener('change', function() {
    if (this.checked) {
      document.getElementById('selectAlumnoContainer').style.display = 'none';
      document.getElementById('btnText').textContent = 'Generar PDF con Todas las Boletas';
    }
  });
});
