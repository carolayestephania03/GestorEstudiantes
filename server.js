/* Dependencias */
const express = require('express');
const cors = require('cors');
const initDB = require('./config/dbconfig');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const http = require('http');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);
const port = 8001;
const FRONTEND_DIR = path.join(__dirname, 'frontend');


/* ======== Middlewares globales ======== */
app.use(cookieParser());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Seguridad básica y compresión
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());

// CORS (mismo origen; puedes omitirlo si no llamas desde otro host)
app.use(cors({ origin: 'http://localhost:8001', credentials: true }));

/* ======== Rutas estáticas públicas ======== */
// Assets públicos (CSS/JS/imagenes)
app.use('/assets', express.static(path.join(FRONTEND_DIR, 'assets'), { maxAge: '7d' }));
app.get('/', (req, res) => res.sendFile(path.join(FRONTEND_DIR, 'index.html')));

// Protegido con cookie
const requireAuth = require('./app/middleware/auth.js');
app.use('/pages', requireAuth, express.static(path.join(FRONTEND_DIR, 'pages'), {
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
  }
}));

/* ======== Rutas API ======== */
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
const AuthDevRoute = require('./app/routes/authDev');

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
app.use(AuthDevRoute);

/* ======== 404 estático básico ======== */
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  return res.status(404).send('Not Found');
});

/* ======== Inicio del servidor y DB ======== */
const startServer = async () => {
  try {
    await initDB.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    await initDB.sync();

    server.listen(port, '0.0.0.0', () => {
      console.log(`App en http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
  }
};
startServer();
