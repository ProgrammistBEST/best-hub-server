const express = require('express');
const router = express.Router();
const excelController = require('@controllers/excelController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/download-editing-action', upload.single('file'), excelController.installFileEditingAction);
router.post('/download-editing-price', excelController.installPriceEditing);

module.exports = router;
