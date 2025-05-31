const path = require('path');
const { db } = require(path.join(__dirname, '../../config/db'));
const { ensureDatabaseConnection } = require(path.join(__dirname, '../../utils/errorHandler'));

// Получение всех артикулов
async function getAllArticles() {
    try {
        ensureDatabaseConnection(db);
        const [articles] = await db.query(`
            SELECT article_id, article FROM articles
        `);
        return articles;
    } catch (error) {
        console.error({ 'Ошибка при получении артикулов': error.message });
        throw error;
    }
}

// Получение артикула по ID
async function getArticleById(articleId) {
    try {
        ensureDatabaseConnection(db);
        const [rows] = await db.query(`
            SELECT article_id, article FROM articles
            WHERE article_id = ?
        `, [articleId]);

        if (rows.length === 0) {
            throw new Error('Артикул не найден');
        }

        return rows[0];
    } catch (error) {
        console.error({ 'Ошибка при получении артикула': error.message });
        throw error;
    };
}

async function createArticle(newArticleName) {
    try {
        ensureDatabaseConnection(db);

        // Проверка на пустое значение
        if (!newArticleName || typeof newArticleName !== 'string' || newArticleName.trim() === '') {
            throw new Error('Некорректное имя артикула');
        }

        // Проверка на дубликат
        const [existing] = await db.query(`
            SELECT article_id FROM articles
            WHERE article = ?
        `, [newArticleName]);

        if (existing.length > 0) {
            throw new Error('Артикул уже существует');
        }

        // Вставка нового артикула
        await db.execute(`
            INSERT INTO articles (article)
            VALUES (?)
        `, [newArticleName]);
    } catch (error) {
        console.error('Ошибка при создании артикула:', error.message);
        throw error; // Передаем ошибку дальше
    }
}

// Обновление артикула по ID
async function updateArticleById(articleId, updateData) {
    try {
        ensureDatabaseConnection(db);

        // Проверка входных данных
        if (!updateData.article || typeof updateData.article !== 'string' || updateData.article.trim() === '') {
            throw new Error('Некорректное имя артикула');
        }

        // Проверка на дубликат
        const [existing] = await db.query(`
            SELECT article_id FROM articles
            WHERE article = ? AND article_id != ?
        `, [updateData.article, articleId]);

        if (existing.length > 0) {
            throw new Error('Артикул уже существует');
        }

        // Обновление артикула
        await db.execute(`
            UPDATE articles
            SET article = ?
            WHERE article_id = ?
        `, [updateData.article, articleId]);
    } catch (error) {
        console.error('Ошибка при обновлении артикула:', error);
        throw error;
    }
}

// Удаление артикула по ID
async function deleteArticleById(articleId) {
    try {
        ensureDatabaseConnection(db);

        // Проверка существования артикула
        const [existing] = await db.query(`
            SELECT article_id FROM articles
            WHERE article_id = ?
        `, [articleId]);

        if (existing.length === 0) {
            throw new Error('Артикул не найден');
        }

        // Удаление артикула
        await db.execute(`
            DELETE FROM articles
            WHERE article_id = ?
        `, [articleId]);
    } catch (error) {
        console.error({ 'Ошибка при удалении артикула': error.message });
        throw error;
    }
}

module.exports = {
    getAllArticles,
    getArticleById,
    createArticle,
    updateArticleById,
    deleteArticleById,
};