const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Опции для Swagger
const options = {
    definition: {
        openapi: '3.0.0', // Версия OpenAPI
        info: {
            title: 'API Documentation', // Название вашего API
            version: '1.0.0', // Версия API
            description: 'API для работы с данными Wildberries', // Описание API
        },
        servers: [
            {
                url: 'http://localhost:8001/api', // URL вашего сервера
                description: 'Локальный сервер',
            },
        ],
    },
    apis: ['./routes/*.js'], // Путь к файлам с маршрутами
};

// Генерация документации Swagger
const specs = swaggerJsDoc(options);

module.exports = { specs, swaggerUi };