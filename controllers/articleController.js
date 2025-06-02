const path = require('path');
const { getArticleById, getAllArticles, createArticle, updateArticleById, deleteArticleById } = require(path.join(__dirname, '../database/models/articleCRUD'));
const { checkDuplicate } = require(path.join(__dirname, '../utils/checkDuplicate'));

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
        const { article } = req.body;

        // Проверка входных данных
        if (!article || typeof article !== 'string' || article.trim() === '') {
            return res.status(400).json({ error: 'Некорректное имя артикула: должно быть непустой строкой' });
        }

        // Проверка на дубликат с помощью универсальной утилиты
        const isDuplicate = await checkDuplicate('articles', { article });
        if (isDuplicate) {
            return res.status(409).json({ error: 'Артикул уже существует. Дубликаты запрещены.' });
        }

        // Создание нового артикула
        await createArticle(article);
        res.status(201).json({ message: 'Артикул успешно создан' });
    } catch (error) {
        console.error('Ошибка при создании артикула:', error.message);

        // Обработка конкретных ошибок
        if (error.message === 'Некорректное имя артикула') {
            return res.status(400).json({ error: 'Некорректное имя артикула: должно быть непустой строкой' });
        }

        if (error.message === 'Артикул уже существует') {
            return res.status(409).json({ error: 'Артикул уже существует. Дубликаты запрещены.' });
        }

        // Обработка всех остальных ошибок
        res.status(500).json({ error: 'Ошибка сервера при создании артикула' });
    }
};

// Обновление артикула по ID
exports.updateArticleById = async (req, res) => {
    try {
        const { id } = req.params;
        const { article } = req.body;

        // Проверка входных данных
        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'Некорректный ID артикула' });
        }

        if (!article || typeof article !== 'string' || article.trim() === '') {
            return res.status(400).json({ error: 'Поле "article" должно быть непустой строкой' });
        }

        // Проверка на дубликат с помощью универсальной утилиты
        const isDuplicate = await checkDuplicate('articles', { article }, { excludeField: 'article_id', excludeValue: id });
        if (isDuplicate) {
            return res.status(409).json({ error: 'Артикул уже существует. Дубликаты запрещены.' });
        }

        // Вызов функции обновления
        await updateArticleById(id, { article });

        res.status(200).json({ message: 'Артикул успешно обновлен' });
    } catch (error) {
        console.error('Ошибка при обновлении артикула:', error);
        res.status(500).json({ error: 'Ошибка сервера при обновлении артикула' });
    }
};

// Удаление артикула по ID
exports.deleteArticleById = async (req, res) => {
    try {
        const { id } = req.params;

        await deleteArticleById(id);
        res.status(200).json({ message: 'Артикул успешно удален' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};