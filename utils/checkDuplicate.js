const path = require('path');
const { db } = require(path.join(__dirname, '../config/db'));
const { ensureDatabaseConnection } = require(path.join(__dirname, './errorHandler'));

/**
 * Проверка на дубликаты
 * @param {string} table - Имя таблицы
 * @param {Object} fields - Объект с полями для проверки (ключ: значение)
 * @param {Object} [options] - Дополнительные параметры
 * @param {string} [options.excludeField] - Поле для исключения (например, 'id')
 * @param {number} [options.excludeValue] - Значение для исключения
 * @returns {boolean} - true, если дубликат найден
 */
async function checkDuplicate(table, fields, options = {}) {
    try {
        ensureDatabaseConnection(db);
        const { excludeField, excludeValue } = options;

        // Формируем SQL-запрос
        const keys = Object.keys(fields);
        const values = Object.values(fields);

        let query = `SELECT * FROM ${table} WHERE `;
        query += keys.map((key) => `${key} = ?`).join(' AND ');

        if (excludeField && excludeValue) {
            query += ` AND ${excludeField} != ?`;
            values.push(excludeValue);
        }

        const [rows] = await db.query(query, values);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Ошибка при проверке дубликата:', error.message);
        throw error;
    }
}

async function checkForDuplicateExternalArticle(platformId, externalArticle, excludeId = null) {
    try {
        ensureDatabaseConnection(db);

        // Проверка входных данных
        if (!externalArticle || typeof externalArticle !== 'string' || externalArticle.trim() === '') {
            throw new Error('Некорректное значение externalArticle');
        }
        if (!platformId || typeof platformId !== 'number') {
            throw new Error('Некорректное значение platformId');
        }

        const query = excludeId
            ? `
                SELECT article_id FROM external_articles
                WHERE platform_id = ? AND external_article = ? AND external_article_id != ?
            `
            : `
                SELECT article_id FROM external_articles
                WHERE platform_id = ? AND external_article = ?
            `;

        const params = excludeId
            ? [platformId, externalArticle, excludeId]
            : [platformId, externalArticle];

        const [rows] = await db.query(query, params);
        return rows.length > 0 ? rows[0].article_id : null;
    } catch (error) {
        console.error('Ошибка при проверке дубликата внешнего артикула:', error.message);
        throw error;
    }
}

module.exports = { checkDuplicate, checkForDuplicateExternalArticle };