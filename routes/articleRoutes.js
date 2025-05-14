const path = require('path');
const express = require('express');
const router = express.Router();
const articleController = require(path.join(__dirname, '../controllers/articleController'));

/**
 * @swagger
 * tags:
 *   name: Articles
 *   description: Операции с артикулами
 */

/**
 * @swagger
 * /api/articles/{id}:
 *   get:
 *     summary: Получение артикула по ID
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID артикула
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Артикул успешно найден
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID артикула
 *                 article:
 *                   type: string
 *                   description: Название артикула
 *       404:
 *         description: Артикул не найден
 */
router.get('/:id', articleController.getArticleById);

/**
 * @swagger
 * /api/articles:
 *   get:
 *     summary: Получение всех артикулов
 *     tags: [Articles]
 *     responses:
 *       200:
 *         description: Список артикулов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID артикула
 *                   article:
 *                     type: string
 *                     description: Название артикула
 */
router.get('/', articleController.getAllArticles);

/**
 * @swagger
 * /api/articles:
 *   post:
 *     summary: Создание нового артикула
 *     tags: [Articles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newArticleName:
 *                 type: string
 *                 description: Название нового артикула
 *     responses:
 *       201:
 *         description: Артикул успешно создан
 *       400:
 *         description: Некорректные данные
 */
router.post('/', articleController.createArticle);

/**
 * @swagger
 * /api/articles/{id}:
 *   put:
 *     summary: Обновление артикула по ID
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID артикула
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newArticleName:
 *                 type: string
 *                 description: Новое название артикула
 *     responses:
 *       200:
 *         description: Артикул успешно обновлен
 *       400:
 *         description: Некорректные данные
 */
router.put('/:id', articleController.updateArticleById);

/**
 * @swagger
 * /api/articles/{id}:
 *   delete:
 *     summary: Удаление артикула по ID
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID артикула
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Артикул успешно удален
 *       404:
 *         description: Артикул не найден
 */
router.delete('/:id', articleController.deleteArticleById);

module.exports = router;