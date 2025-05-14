const path = require('path');
const { db } = require(path.join(__dirname, '../../config/db'));
const { ensureDatabaseConnection } = require(path.join(__dirname, '../../utils/errorHandler'))

async function getAllArticles() {
    try {
        ensureDatabaseConnection(db);
        const [articles] = await db.query(`
                SELECT * FROM articles
            `)
        return articles
    } catch (error) {
        console.error({'Ошибка при получении моделей': error.message})
        throw error
    }
}

async function getArticleById(articleId) {
    try {
        ensureDatabaseConnection(db);
        const article = await db.query(`
                SELECT article, article_association FROM articles
                WHERE article_id = ?
            `, 
            [articleId]
        );
        return article;
    } catch (error) {
        console.error({'Ошибка при получении модели': error.message});
        throw error;
    }
}

async function createArticle(newArticleName) {
    try {
        ensureDatabaseConnection(db);
        await db.execute(`
                INSERT INTO articles (article, article_association)
                VALUES (?, ?) 
                ON DUPLICATE KEY UPDATE article = article
            `,
            [newArticleName, newArticleName] 
        );
    } catch (error) {
        console.error('Ошибка при создании категории API:', error);
        throw error;
    }
}

// Обновление артикула по ID
async function updateArticleById(articleId, renameArticleName) {
    try {
        ensureDatabaseConnection(db);
        await db.execute(
            `UPDATE articles
             SET article = ?
             WHERE article_id = ?`,
            [renameArticleName, articleId]
        );
    } catch (error) {
        console.error('Ошибка при обновлении артикула:', error);
        throw error;
    }
}

async function updateArticleAssociationById(articleAssociationId, renameArticleAssociationName) {
    try {
        ensureDatabaseConnection(db);
        await db.execute(
            `UPDATE articles
             SET article_association = ?
             WHERE article_id = ?`,
            [renameArticleAssociationName, articleAssociationId]
        );
    } catch (error) {
        console.error('Ошибка при обновлении артикула:', error);
        throw error;
    }
}

async function deleteArticleById(articleId) {
    try {
        ensureDatabaseConnection(db);
        await db.execute(`DELETE FROM articles WHERE article_id = ?`, [articleId])
    } catch (error) {
        console.error({'Ошибка при удалении артикула:': error.message})
        throw error
    }
}

module.exports = { getArticleById, getAllArticles, createArticle, updateArticleById, updateArticleAssociationById, deleteArticleById };