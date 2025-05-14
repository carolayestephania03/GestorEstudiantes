const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Configuración de Swagger

const swaggerDefinition = {  // Cambié "swaggerDefnintion" a "swaggerDefinition"
    openapi: '3.0.0',
    info: {
        title: 'Documentación API',
        version: '1.0.0',
        description: 'API para gestión escolar',
    },
    servers: [
        {
            url: 'http://localhost:8000',
        },
    ],
}

const options = {
    swaggerDefinition,
    apis: ['./app/routes/*.js'], // Ruta a los archivos de las rutas
};

const specs = swaggerJsDoc(options);

module.exports = {
    swaggerUi,
    specs,
};
