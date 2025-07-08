const path = require('path');
const express = require('express');
const router = express.Router();
const sizeController = require('@controllers/model/sizeController');

router.get('/', sizeController.getAllSizes);

module.exports = router;