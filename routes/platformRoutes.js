const path = require('path');
const express = require('express');
const router = express.Router();
const platformController = require(path.join(__dirname, '../controllers/platformController'));

/**
 * @swagger
 * tags:
 *   name: Platforms
 *   description: Операции с платформами
 */

/**
 * @swagger
 * /api/platforms/{id}:
 *   get:
 *     summary: Получение платформы по ID
 *     tags: [Platforms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID платформы
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Платформа успешно найдена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID платформы
 *                 platform:
 *                   type: string
 *                   description: Название платформы
 *       404:
 *         description: Платформа не найдена
 */
router.get('/:id', platformController.getPlatformById);

/**
 * @swagger
 * /api/platforms:
 *   get:
 *     summary: Получение всех платформ
 *     tags: [Platforms]
 *     responses:
 *       200:
 *         description: Список платформ
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID платформы
 *                   platform:
 *                     type: string
 *                     description: Название платформы
 */
router.get('/', platformController.getAllPlatforms);

/**
 * @swagger
 * /api/platforms:
 *   post:
 *     summary: Создание новой платформы
 *     tags: [Platforms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPlatformName:
 *                 type: string
 *                 description: Название новой платформы
 *     responses:
 *       201:
 *         description: Платформа успешно создана
 *       400:
 *         description: Некорректные данные
 */
router.post('/', platformController.createPlatform);

/**
 * @swagger
 * /api/platforms/{id}:
 *   put:
 *     summary: Обновление платформы по ID
 *     tags: [Platforms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID платформы
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPlatformName:
 *                 type: string
 *                 description: Новое название платформы
 *     responses:
 *       200:
 *         description: Платформа успешно обновлена
 *       400:
 *         description: Некорректные данные
 */
router.put('/:id', platformController.updatePlatformById);

/**
 * @swagger
 * /api/platforms/{id}:
 *   delete:
 *     summary: Удаление платформы по ID
 *     tags: [Platforms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID платформы
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Платформа успешно удалена
 *       404:
 *         description: Платформа не найдена
 */
router.delete('/:id', platformController.deletePlatformById);

module.exports = router;