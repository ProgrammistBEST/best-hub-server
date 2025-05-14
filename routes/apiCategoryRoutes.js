const express = require('express');
const router = express.Router();
const apiCategoryController = require('../controllers/apiCategoryController');

/**
 * @swagger
 * tags:
 *   name: ApiCategories
 *   description: Операции с категориями API
 */

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Получение категории API по ID
 *     tags: [ApiCategories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID категории API
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Категория API успешно найдена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID категории API
 *                 category:
 *                   type: string
 *                   description: Название категории API
 *       404:
 *         description: Категория API не найдена
 */
router.get('/:id', apiCategoryController.getApiCategoryById);

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Получение всех категорий API
 *     tags: [ApiCategories]
 *     responses:
 *       200:
 *         description: Список категорий API
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID категории API
 *                   category:
 *                     type: string
 *                     description: Название категории API
 */
router.get('/', apiCategoryController.getAllApiCategories);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Создание новой категории API
 *     tags: [ApiCategories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newApiCategoryName:
 *                 type: string
 *                 description: Название новой категории API
 *     responses:
 *       201:
 *         description: Категория API успешно создана
 *       400:
 *         description: Некорректные данные
 */
router.post('/', apiCategoryController.createApiCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Обновление категории API по ID
 *     tags: [ApiCategories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID категории API
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newApiCategoryName:
 *                 type: string
 *                 description: Новое название категории API
 *     responses:
 *       200:
 *         description: Категория API успешно обновлена
 *       400:
 *         description: Некорректные данные
 */
router.put('/:id', apiCategoryController.updateApiCategoryById);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Удаление категории API по ID
 *     tags: [ApiCategories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID категории API
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Категория API успешно удалена
 *       404:
 *         description: Категория API не найдена
 */
router.delete('/:id', apiCategoryController.deleteApiCategoryById);

module.exports = router;