const express = require('express');
const router = express.Router();
const apiController = require('@controllers/apiController');

/**
 * @swagger
 * tags:
 *   name: APIs
 *   description: Операции с API
 */

/**
 * @swagger
 * /api/apis/{id}:
 *   get:
 *     summary: Получение API по ID
 *     tags: [APIs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID API
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: API успешно найдено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID API
 *                 token:
 *                   type: string
 *                   description: Токен API
 *                 brand:
 *                   type: string
 *                   description: Бренд
 *                 platform:
 *                   type: string
 *                   description: Платформа
 *                 api_category:
 *                   type: string
 *                   description: Категория API
 *                 expiration_date:
 *                   type: string
 *                   format: date
 *                   description: Дата истечения срока действия
 *       404:
 *         description: API не найдено
 */
router.get('/:id', apiController.getAPIById);

/**
 * @swagger
 * /api/apis:
 *   get:
 *     summary: Получение всех API
 *     tags: [APIs]
 *     responses:
 *       200:
 *         description: Список API
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID API
 *                   token:
 *                     type: string
 *                     description: Токен API
 *                   brand:
 *                     type: string
 *                     description: Бренд
 *                   platform:
 *                     type: string
 *                     description: Платформа
 *                   api_category:
 *                     type: string
 *                     description: Категория API
 *                   expiration_date:
 *                     type: string
 *                     format: date
 *                     description: Дата истечения срока действия
 *       404:
 *         description: API не найдены
 */
router.get('/', apiController.getAllApis);

/**
 * @swagger
 * /api/apis:
 *   post:
 *     summary: Создание нового API
 *     tags: [APIs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Токен API
 *               brand:
 *                 type: string
 *                 description: Бренд
 *               platform:
 *                 type: string
 *                 description: Платформа
 *               api_category:
 *                 type: string
 *                 description: Категория API
 *               expiration_date:
 *                 type: string
 *                 format: date
 *                 description: Дата истечения срока действия
 *     responses:
 *       201:
 *         description: API успешно создано
 *       400:
 *         description: Некорректные данные
 */
router.post('/', apiController.createAPI);

/**
 * @swagger
 * /api/apis/{id}:
 *   put:
 *     summary: Обновление API по ID
 *     tags: [APIs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID API
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Токен API
 *               brand:
 *                 type: string
 *                 description: Бренд
 *               platform:
 *                 type: string
 *                 description: Платформа
 *               api_category:
 *                 type: string
 *                 description: Категория API
 *               expiration_date:
 *                 type: string
 *                 format: date
 *                 description: Дата истечения срока действия
 *     responses:
 *       200:
 *         description: API успешно обновлено
 *       400:
 *         description: Некорректные данные
 */
router.put('/:id', apiController.updateAPI);

/**
 * @swagger
 * /api/apis/{id}:
 *   delete:
 *     summary: Удаление API по ID
 *     tags: [APIs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID API
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: API успешно удалено
 *       404:
 *         description: API не найдено
 */
router.delete('/:id', apiController.deleteAPI);

module.exports = router;