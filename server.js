/* Dependencias */
const express = require('express');
const cors = require('cors');
const initDB = require('./config/dbconfig');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const http = require('http');
const app = express();
const swagger = require('./config/swagger');
const socketMiddleware = require('./app/middleware/socket');
const path = require('path');

app.use(express.static(path.join(__dirname, './frontend')));

// Crear servidor HTTP
const server = http.createServer(app);

/* Uso de cookies */
app.use(cookieParser());
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

/* Puerto a utilizar */ 
const port = 8001;

/* Configuracion del cors */
const corsOptions = {
    origin: 'http://localhost:8001', // Cambia esto a la URL de tu frontend mas adelante
    Credentials: true,
}

/* Routes ------------------------------------------*/ 

const RouteEscalafon = require('./app/routes/Escalafon');
const RouteRenglon = require('./app/routes/Renglon');
const RoutePersona = require('./app/routes/Persona');
const RouteUsuario = require('./app/routes/Usuario');
const RouteGrado = require('./app/routes/Grado');
const RouteSeccion = require('./app/routes/Seccion');
const RouteCiclo = require('./app/routes/Ciclo');
const RouteMateria = require('./app/routes/Materia');
const RouteTipoActividad = require('./app/routes/Tipo_actividad');
const RouteEstadoActividad = require('./app/routes/Estado_actividad');
const RouteActividad = require('./app/routes/Actividad');
const RouteEncargado = require('./app/routes/Encargado');
const RouteAlumno = require('./app/routes/Alumno');
const RouteCalificacion = require('./app/routes/Calificacion');
const RoutePromedioAmbito = require('./app/routes/Promedio_ambito');
const RoutePromedioCiclo = require('./app/routes/Promedio_ciclo');

/* Activación del cors*/
app.use(cors(corsOptions));

/**Parseador de solicitudes */
app.use(
    bodyParser.json({
        limit: '50mb'
    })
);

app.use(
    bodyParser.urlencoded({
        limit: '50mb',
        extended: true
    })
);

/* Utilizacion de Rutas ----------------------------*/ 
app.use(RouteEscalafon);
app.use(RouteRenglon);
app.use(RoutePersona);
app.use(RouteUsuario);
app.use(RouteGrado);
app.use(RouteSeccion);
app.use(RouteCiclo);
app.use(RouteMateria);
app.use(RouteTipoActividad);
app.use(RouteEstadoActividad);
app.use(RouteActividad);
app.use(RouteEncargado);
app.use(RouteAlumno);
app.use(RouteCalificacion);
app.use(RoutePromedioAmbito);
app.use(RoutePromedioCiclo);


app.get('/', (req, res) => {
    res.send('¡Servidor funcionando correctamente!');
  });

/* Inicio del servidor y conexión a la base de datos*/
const startServer = async () => {
    try {
        await initDB.authenticate();
        console.log('Conexión a la base de datos establecida correctamente.');

        await initDB.sync();

        server.listen(port, '0.0.0.0', () => {
            console.log(`La aplicación está en línea en http://localhost:${port}!`);
        });

    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
    }
}

startServer();