const path = require('path');
const express = require('express');
const router = express.Router();
const barcodeController = require(path.join(__dirname, '../controllers/barcodeController'));

router.post('/', barcodeController.arm2)