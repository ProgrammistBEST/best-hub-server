const path = require('path');
const {
    getExternalArticle,
    getAllExternalArticles,
    createExternalArticle,
    updateExternalArticleById,
    deleteExternalArticleById
} = require(path.join(__dirname, '../database/models/externalArticleCRUD'));
const { checkForDuplicateExternalArticle } = require(path.join(__dirname, '../utils/checkDuplicate'))

// Получение внешнего артикула по ID
exports.getExternalArticleById = async (req, res) => {
    try {
        const { id } = req.params;

        // Проверка входных данных
        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'Некорректный ID внешнего артикула' });
        }

        const externalArticle = await getExternalArticle(id);

        if (!externalArticle) {
            return res.status(404).json({ error: 'Внешний артикул не найден' });
        }

        res.status(200).json(externalArticle);
    } catch (error) {
        console.error('Ошибка при получении внешнего артикула:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Получение всех внешних артикулов
exports.getAllExternalArticles = async (req, res) => {
    try {
        const externalArticles = await getAllExternalArticles();
        res.status(200).json(externalArticles);
    } catch (error) {
        console.error('Ошибка при получении всех внешних артикулов:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Создание нового внешнего артикула
exports.createExternalArticle = async (req, res) => {
    try {
        const { article_id, external_article, platform_id } = req.body;

        // Проверка входных данных
        if (
            !article_id || typeof article_id !== 'number' ||
            !external_article || typeof external_article !== 'string' || external_article.trim() === '' ||
            !platform_id || typeof platform_id !== 'number'
        ) {
            return res.status(400).json({
                error: 'Некорректные данные: article_id (число), external_article (непустая строка), platform_id (число)'
            });
        }

        // Проверка на дубликат
        const duplicate = await checkForDuplicateExternalArticle(platform_id, external_article);
        if (duplicate) {
            return res.status(409).json({ error: 'Такой внешний артикул уже существует для данной платформы' });
        }

        // Создание нового внешнего артикула
        await createExternalArticle(article_id, external_article, platform_id);

        res.status(201).json({ message: 'Внешний артикул успешно создан' });
    } catch (error) {
        console.error('Ошибка при создании внешнего артикула:', error.message);

        // Обработка конкретных ошибок
        if (error.message === 'Некорректные данные для создания внешнего артикула') {
            return res.status(400).json({ error: 'Проверьте корректность переданных данных' });
        }

        if (error.message === 'Такой внешний артикул уже существует для данной платформы') {
            return res.status(409).json({ error: 'Дубликат внешнего артикула для платформы запрещен' });
        }

        // Обработка всех остальных ошибок
        res.status(500).json({ error: 'Ошибка сервера при создании внешнего артикула' });
    }
};

// Обновление внешнего артикула по ID
exports.updateExternalArticleById = async (req, res) => {
    try {
        const { id } = req.params;
        const { external_article, platform_id } = req.body;

        // Проверка входных данных
        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'Некорректный ID внешнего артикула' });
        }

        if (
            !external_article || typeof external_article !== 'string' || external_article.trim() === '' ||
            !platform_id || typeof platform_id !== 'number'
        ) {
            return res.status(400).json({
                error: 'Некорректные данные: external_article (непустая строка), platform_id (число)'
            });
        }

        // Проверка существования внешнего артикула
        const existing = await getExternalArticle(id);
        if (!existing) {
            return res.status(404).json({ error: 'Внешний артикул не найден' });
        }

        // Проверка на дубликат
        const duplicate = await checkForDuplicateExternalArticle(platform_id, external_article, id);
        if (duplicate) {
            return res.status(409).json({ error: 'Такой внешний артикул уже существует для данной платформы' });
        }

        // Вызов функции обновления
        await updateExternalArticleById(id, { externalArticle: external_article, platformId: platform_id });

        res.status(200).json({ message: 'Внешний артикул успешно обновлен' });
    } catch (error) {
        console.error('Ошибка при обновлении внешнего артикула:', error.message);
        res.status(500).json({ error: 'Ошибка сервера при обновлении внешнего артикула' });
    }
};

// Удаление внешнего артикула по ID
exports.deleteExternalArticleById = async (req, res) => {
    try {
        const { id } = req.params;

        // Проверка входных данных
        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'Некорректный ID внешнего артикула' });
        }

        // Проверка существования внешнего артикула
        const existing = await getExternalArticle(id);
        if (!existing) {
            return res.status(404).json({ error: 'Внешний артикул не найден' });
        }

        // Удаление внешнего артикула
        await deleteExternalArticleById(id);

        res.status(200).json({ message: 'Внешний артикул успешно удален' });
    } catch (error) {
        console.error('Ошибка при удалении внешнего артикула:', error.message);
        res.status(500).json({ error: error.message });
    }
};