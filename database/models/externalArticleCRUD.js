const path = require('path');
const { db } = require(path.join(__dirname, '../../config/db'));
const { ensureDatabaseConnection } = require(path.join(__dirname, '../../utils/errorHandler'));

// Получение внешнего артикула по ID
async function getExternalArticle(externalArticleId) {
    try {
        ensureDatabaseConnection(db);

        const [rows] = await db.query(`
            SELECT external_article_id, article_id, external_article, platform_id
            FROM external_articles
            WHERE external_article_id = ?
        `, [externalArticleId]);

        if (rows.length === 0) {
            throw new Error('Внешний артикул не найден');
        }

        return rows[0];
    } catch (error) {
        console.error({ 'Ошибка при получении внешнего артикула': error.message });
        throw error;
    }
}

// Получение всех внешних артикулов
async function getAllExternalArticles() {
    try {
        ensureDatabaseConnection(db);

        const [externalArticles] = await db.query(`
            SELECT external_article_id, article_id, external_article, platform_id
            FROM external_articles
        `);
        return externalArticles;
    } catch (error) {
        console.error({ 'Ошибка при получении всех внешних артикулов': error.message });
        throw error;
    }
}

// Создание нового внешнего артикула
async function createExternalArticle(articleId, externalArticle, platformId) {
    try {
        ensureDatabaseConnection(db);

        // Проверка входных данных
        if (
            !articleId || typeof articleId !== 'number' ||
            !externalArticle || typeof externalArticle !== 'string' || externalArticle.trim() === '' ||
            !platformId || typeof platformId !== 'number'
        ) {
            throw new Error('Некорректные данные для создания внешнего артикула');
        }

        // Проверка на дубликат
        const [existing] = await db.query(`
            SELECT external_article_id FROM external_articles
            WHERE platform_id = ? AND external_article = ?
        `, [platformId, externalArticle]);

        if (existing.length > 0) {
            throw new Error('Такой внешний артикул уже существует для данной платформы');
        }

        // Вставка нового внешнего артикула
        await db.execute(`
            INSERT INTO external_articles (article_id, external_article, platform_id)
            VALUES (?, ?, ?)
        `, [articleId, externalArticle, platformId]);
    } catch (error) {
        console.error('Ошибка при создании внешнего артикула:', error.message);
        throw error;
    }
}

// Обновление внешнего артикула по ID
async function updateExternalArticleById(externalArticleId, updateData) {
    try {
        ensureDatabaseConnection(db);

        // Проверка входных данных
        if (
            !updateData.externalArticle || typeof updateData.externalArticle !== 'string' || updateData.externalArticle.trim() === '' ||
            !updateData.platformId || typeof updateData.platformId !== 'number'
        ) {
            throw new Error('Некорректные данные для обновления внешнего артикула');
        }

        // Проверка существования внешнего артикула
        const [existing] = await db.query(`
            SELECT external_article_id FROM external_articles
            WHERE external_article_id = ?
        `, [externalArticleId]);

        if (existing.length === 0) {
            throw new Error('Внешний артикул не найден');
        }

        // Проверка на дубликат
        const [duplicate] = await db.query(`
            SELECT external_article_id FROM external_articles
            WHERE platform_id = ? AND external_article = ? AND external_article_id != ?
        `, [updateData.platformId, updateData.externalArticle, externalArticleId]);

        if (duplicate.length > 0) {
            throw new Error('Такой внешний артикул уже существует для данной платформы');
        }

        // Обновление внешнего артикула
        await db.execute(`
            UPDATE external_articles
            SET external_article = ?, platform_id = ?
            WHERE external_article_id = ?
        `, [updateData.externalArticle, updateData.platformId, externalArticleId]);
    } catch (error) {
        console.error('Ошибка при обновлении внешнего артикула:', error.message);
        throw error;
    }
}

// Удаление внешнего артикула по ID
async function deleteExternalArticleById(externalArticleId) {
    try {
        ensureDatabaseConnection(db);

        // Проверка существования внешнего артикула
        const [existing] = await db.query(`
            SELECT external_article_id FROM external_articles
            WHERE external_article_id = ?
        `, [externalArticleId]);

        if (existing.length === 0) {
            throw new Error('Внешний артикул не найден');
        }

        // Удаление внешнего артикула
        await db.execute(`
            DELETE FROM external_articles
            WHERE external_article_id = ?
        `, [externalArticleId]);
    } catch (error) {
        console.error({ 'Ошибка при удалении внешнего артикула': error.message });
        throw error;
    }
}

module.exports = {
    getExternalArticle,
    getAllExternalArticles,
    createExternalArticle,
    updateExternalArticleById,
    deleteExternalArticleById,
};