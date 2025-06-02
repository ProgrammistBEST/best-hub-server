const path = require('path');
const express = require('express');
const router = express.Router();
const externalArticleController = require(path.join(__dirname, '../controllers/externalArticleController'));

router.get('/:id', externalArticleController.getExternalArticleById);
router.get('/', externalArticleController.getAllExternalArticles);
router.post('/', externalArticleController.createExternalArticle);
router.put('/:id', externalArticleController.updateExternalArticleById);
router.delete('/:id', externalArticleController.deleteExternalArticleById)

module.exports = router;