const path = require('path');
const express = require('express');
const router = express.Router();
const modelController = require(path.join(__dirname, '../controllers/modelController'));

/**
 * @swagger
 * tags:
 *   name: Models
 *   description: Операции с моделями
 */

/**
 * @swagger
 * /api/models/{id}:
 *   get:
 *     summary: Получение модели по ID
 *     tags: [Models]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID модели
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Модель успешно найдена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 model_id:
 *                   type: integer
 *                   description: ID модели
 *                 brand_id:
 *                   type: integer
 *                   description: ID бренда
 *                 article_id:
 *                   type: integer
 *                   description: ID артикула
 *                 size_id:
 *                   type: integer
 *                   description: ID размера
 *                 sku:
 *                   type: string
 *                   description: SKU модели
 *                 pair:
 *                   type: integer
 *                   description: Количество пар
 *                 category:
 *                   type: string
 *                   description: Категория
 *                 gender:
 *                   type: string
 *                   description: Пол
 *                 color:
 *                   type: string
 *                   description: Цвет
 *                 compound:
 *                   type: string
 *                   description: Состав
 *                 platform_id:
 *                   type: integer
 *                   description: ID платформы
 *       404:
 *         description: Модель не найдена
 */
router.get('/:id', modelController.getModelById);

/**
 * @swagger
 * /api/models:
 *   get:
 *     summary: Получение всех моделей
 *     tags: [Models]
 *     responses:
 *       200:
 *         description: Список моделей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   model_id:
 *                     type: integer
 *                     description: ID модели
 *                   brand_id:
 *                     type: integer
 *                     description: ID бренда
 *                   article_id:
 *                     type: integer
 *                     description: ID артикула
 *                   size_id:
 *                     type: integer
 *                     description: ID размера
 *                   sku:
 *                     type: string
 *                     description: SKU модели
 *                   pair:
 *                     type: integer
 *                     description: Количество пар
 *                   category:
 *                     type: string
 *                     description: Категория
 *                   gender:
 *                     type: string
 *                     description: Пол
 *                   color:
 *                     type: string
 *                     description: Цвет
 *                   compound:
 *                     type: string
 *                     description: Состав
 *                   platform_id:
 *                     type: integer
 *                     description: ID платформы
 *       404:
 *         description: Модели не найдены
 */
router.get('/', modelController.getAllModels);

/**
 * @swagger
 * /api/models/wb:
 *   post:
 *     summary: Создание моделей из данных Wildberries
 *     tags: [Models]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               brand:
 *                 type: string
 *                 description: Название бренда
 *               platform:
 *                 type: string
 *                 description: Название платформы
 *               apiCategory:
 *                 type: string
 *                 description: Категория API
 *     responses:
 *       200:
 *         description: Модели успешно созданы из данных Wildberries
 *       400:
 *         description: Некорректные данные
 *       500:
 *         description: Ошибка сервера
 */
router.post('/wildberies', modelController.createModelsWithWB);

/**
 * @swagger
 * /api/models:
 *   post:
 *     summary: Создание новой модели вручную
 *     tags: [Models]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               brand:
 *                 type: string
 *                 description: Название бренда
 *               article:
 *                 type: string
 *                 description: Артикул
 *               size:
 *                 type: string
 *                 description: Размер
 *               sku:
 *                 type: string
 *                 description: SKU модели
 *               pair:
 *                 type: integer
 *                 description: Количество пар
 *               category:
 *                 type: string
 *                 description: Категория
 *               gender:
 *                 type: string
 *                 description: Пол
 *               color:
 *                 type: string
 *                 description: Цвет
 *               compound:
 *                 type: string
 *                 description: Состав
 *               platform:
 *                 type: string
 *                 description: Название платформы
 *     responses:
 *       201:
 *         description: Модель успешно создана
 *       400:
 *         description: Некорректные данные
 *       500:
 *         description: Ошибка сервера
 */
router.post('/', modelController.createModel);

/**
 * @swagger
 * /api/models/{id}:
 *   put:
 *     summary: Обновление параметров модели по ID
 *     tags: [Models]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID модели
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pair:
 *                 type: integer
 *                 description: Новое количество пар
 *               category:
 *                 type: string
 *                 description: Новая категория
 *               gender:
 *                 type: string
 *                 description: Новый пол
 *               color:
 *                 type: string
 *                 description: Новый цвет
 *               compound:
 *                 type: string
 *                 description: Новый состав
 *     responses:
 *       200:
 *         description: Модель успешно обновлена
 *       400:
 *         description: Некорректные данные
 *       404:
 *         description: Модель не найдена
 */
router.put('/:id', modelController.updateModelById);

module.exports = router;