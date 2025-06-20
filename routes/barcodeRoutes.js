const express = require('express');
const router = express.Router();
const barcodeController = require('../controllers/barcodeController');

// Универсальный маршрут для всех брендов
router.post('/', async (req, res) => {
    barcodeController.createBarcodeHandler(req, res);
});

module.exports = router;