require('module-alias/register');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { db } = require('@config/db');

// Middleware
app.use(cors());
app.use(express.json());

// Подключение маршрутов
const platformRoutes = require('@routes/platformRoutes');
const apiCategoryRoutes = require('@routes/apiCategoryRoutes');
const modelRoutes = require('@routes/modelRoutes');
const brandRoutes = require('@routes/brandRoutes');
const barcodeRoutes = require('@routes/barcodeRoutes');
const articleRoutes = require('@routes/articleRoutes');
const sizeRoutes = require('@routes/sizeRoutes');
const externalArticleRoutes = require('@routes/externalArticleRoutes');
const excelRoutes = require('@routes/excelRoutes');

app.use('/api/excel', excelRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/api-categories', apiCategoryRoutes);
app.use('/api/models', modelRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/barcodes', barcodeRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/sizes', sizeRoutes);
app.use('/api/external-articles', externalArticleRoutes);

// Документация Swagger
const { specs, swaggerUi } = require('./src/swagger'); // Импортируем Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Запуск сервера
const port = process.env.PORT || 8500;
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});

// Обработка завершения процесса
process.on('SIGINT', async () => {
    try {
        await db.end(); // Закрытие пула соединений
        console.warn(`Закрытие соединения с базой данных ${process.env.DB_NAME}`);
        process.exit(0);
    } catch (error) {
        console.error(`Ошибка при закрытии соединения с базой данных ${process.env.DB_NAME}:`, error.message);
        process.exit(1);
    }
});