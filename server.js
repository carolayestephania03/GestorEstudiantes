/* Dependencias */
const express = require('express');
const cors = require('cors');
const initDB = require('./config/dbconfig');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const swagger = require('./config/swagger');


/* Uso de cookies */
app.use(cookieParser());
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

/* Puerto a utilizar */ 
const port = 8000;

/* Configuracion del cors */
const corsOptions = {
    origin: 'http://localhost:8000', // Cambia esto a la URL de tu frontend mas adelante
    Credentials: true,
}

/* Routes ------------------------------------------*/ 

const actividadRoutes = require('./app/routes/actividad');

/* Activación del cors*/
app.use(cors(corsOptions));

/* Utilizacion de Rutas ----------------------------*/ 
app.use(actividadRoutes);

app.use('/api-docs', swagger.swaggerUi.serve, swagger.swaggerUi.setup(swagger.specs));

app.get('/', (req, res) => {
    res.send('¡Servidor funcionando correctamente!');
  });

/* Inicio del servidor y conexión a la base de datos*/
const startServer = async () => {
    try {
        await initDB.authenticate();
        console.log('Conexión a la base de datos establecida correctamente.');

        await initDB.sync();

        const server = app.listen(port, () => {
            console.log(`La aplicación está en línea en el puerto ${port}!`);
        });
        
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
    }
}

startServer();