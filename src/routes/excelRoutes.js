const express = require('express');
const router = express.Router();
const excelController = require('@controllers/excelController');

router.post('/download-editing-action', excelController.installFileEditingAction);
router.post('/download-editing-price', excelController.installPriceEditing);

module.exports = router;
