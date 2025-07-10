const path = require('path');
const express = require('express');
const router = express.Router();
const brandController = require('@controllers/brandController');

/**
 * @swagger
 * tags:
 *   name: Brands
 *   description: Операции с брендами
 */

/**
 * @swagger
 * /api/brands/{id}:
 *   get:
 *     summary: Получение бренда по ID
 *     tags: [Brands]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID бренда
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Успешный запрос
 *       404:
 *         description: Бренд не найден
 */
router.get('/:id', brandController.getBrandById);

/**
 * @swagger
 * /api/brands:
 *   get:
 *     summary: Получение всех брендов
 *     tags: [Brands]
 *     responses:
 *       200:
 *         description: Список брендов
 */
router.get('/', brandController.getAllBrands);

/**
 * @swagger
 * /api/brands:
 *   post:
 *     summary: Создание нового бренда
 *     tags: [Brands]
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
 *     responses:
 *       201:
 *         description: Бренд успешно создан
 *       400:
 *         description: Некорректные данные
 */
router.post('/', brandController.createBrand);

/**
 * @swagger
 * /api/brands/{id}:
 *   put:
 *     summary: Обновление бренда по ID
 *     tags: [Brands]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID бренда
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               brand:
 *                 type: string
 *                 description: Новое название бренда
 *     responses:
 *       200:
 *         description: Бренд успешно обновлен
 *       400:
 *         description: Некорректные данные
 */
router.put('/:id', brandController.updateBrandById);

/**
 * @swagger
 * /api/brands/{id}:
 *   delete:
 *     summary: Удаление бренда по ID
 *     tags: [Brands]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID бренда
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Бренд успешно удален
 *       404:
 *         description: Бренд не найден
 */
router.delete('/:id', brandController.deleteBrandById);

module.exports = router;