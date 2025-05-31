const path = require('path');
const express = require('express');
const router = express.Router();
const sizeController = require(path.join(__dirname, '../controllers/sizeController'));

router.get('/', sizeController.getAllSizes);

module.exports = router;