require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const { db } = require('./config/db');
const path = require('path');

// Middleware
app.use(cors());
app.use(express.json());

// Подключение маршрутов
const platformRoutes = require(path.join(__dirname, './routes/platformRoutes'));
const apiCategoryRoutes = require(path.join(__dirname, './routes/apiCategoryRoutes'));
const modelRoutes = require(path.join(__dirname, './routes/modelRoutes'));
const brandRoutes = require(path.join(__dirname, './routes/brandRoutes'));
const articleRoutes = require(path.join(__dirname, './routes/articleRoutes'));
const sizeRoutes = require(path.join(__dirname, './routes/sizeRoutes'));

app.use('/api/platforms', platformRoutes);
app.use('/api/categories', apiCategoryRoutes);
app.use('/api/models', modelRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/sizes', sizeRoutes);

// Документация Swagger
const { specs, swaggerUi } = require('./swagger'); // Импортируем Swagger
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