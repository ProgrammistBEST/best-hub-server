const path = require('path');
const { getArticleById, getAllArticles, createArticle, updateArticleById, deleteArticleById } = require(path.join(__dirname, '../database/models/articleCRUD'));

// Получение артикула по ID
exports.getArticleById = async (req, res) => {
    try {
        const { id } = req.params;
        const article = await getArticleById(id);
        if (!article) {
            return res.status(404).json({ error: 'Артикул не найден' });
        }
        res.status(200).json(article);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Получение всех артикулов
exports.getAllArticles = async (req, res) => {
    try {
        const articles = await getAllArticles();
        res.status(200).json(articles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Создание нового артикула
exports.createArticle = async (req, res) => {
    try {
        const { newArticleName } = req.body;

        // Проверка входных данных
        if (!newArticleName || typeof newArticleName !== 'string') {
            return res.status(400).json({ error: 'Некорректное имя артикула: должно быть строкой' });
        }

        await createArticle(newArticleName);
        res.status(201).json({ message: 'Артикул успешно создан' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Обновление артикула по ID
exports.updateArticleById = async (req, res) => {
    try {
        const { id } = req.params;
        const { newArticleName } = req.body;

        // Проверка входных данных
        if (!newArticleName || typeof newArticleName !== 'string') {
            return res.status(400).json({ error: 'Некорректное имя артикула: должно быть строкой' });
        }

        await updateArticleById(id, newArticleName);
        res.status(200).json({ message: 'Артикул успешно обновлен' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Удаление артикула по ID
exports.deleteArticleById = async (req, res) => {
    try {
        const { id } = req.params; // Исправлено: используем req.params.id

        await deleteArticleById(id);
        res.status(200).json({ message: 'Артикул успешно удален' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};