const express = require('express');
const connectToDatabase = require('./app/config/dbconfig');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require
const app = express();
const port = 8000;

//Configuracion y conexion a la base de datos
connectToDatabase().then(() => {
    console.log('Conexión a la base de datos establecida');
}).catch((error) => {
    console.error('Error al conectar a la base de datos', error);
    process.exit(1); //Detiene la ejecución del servidor
});

app.use(cookieParser());
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

//ruta principal para verificar que el servidor esta corriendo
app.get('/', (req, res) => {
    res.send({data:'Servidor corriendo correctamente'});
});

//Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});