const path = require('path');
const { db } = require(path.join(__dirname, '../../config/db'));
const { ensureDatabaseConnection } = require(path.join(__dirname, '../../utils/errorHandler'));

// Получение категории API по ID
async function getApiCategoryById(apiCategoryId) {
    try {
        ensureDatabaseConnection(db);
        const [apiCategory] = await db.query(`
                SELECT api_category FROM api_categories
                WHERE api_category_id = ? 
            `, [apiCategoryId]);
        return apiCategory
    } catch (error) {
        console.error('Ошибка при получении брендов по id:', error);
        throw error
    }
}

// Получение всех категорий API
async function getAllApiCategories() {
    try {
        ensureDatabaseConnection(db);
        const [apiCategories] = await db.query(`
                SELECT * FROM api_categories
            `
        );
        return apiCategories
    } catch (error) {
        console.error('Ошибка при получении брендов:', error);
        throw error;
    }
}

// Создание нового категории API
async function createApiCategory(newApiСategoryName) {
    try {
        ensureDatabaseConnection(db);
        await db.execute(`
                INSERT INTO api_categories (api_category)
                VALUES (?)
                ON DUBLICATE KEY UPDATE api_category = ?
            `,
            [newApiСategoryName, newApiСategoryName] 
        );
    } catch (error) {
        console.error('Ошибка при создании категории API:', error);
        throw error;
    }
}

// Обновление категории API по ID
async function updateApiCategoryById(apiCategoryId, renameApiCategoryName) {
    try {
        ensureDatabaseConnection(db);
        await db.execute(`
            UPDATE api_categories
            SET api_category = ?
            WHERE api_category_id = ?
        `, [renameApiCategoryName, apiCategoryId]);
    } catch (error) {
        console.error('Ошибка при обновлении категории API:', error);
        throw error;
    }
}

// Удаление категории API по ID
async function deleteApiCategoryById(apiCategoryId) {
    try {
        ensureDatabaseConnection(db);
        await db.execute(`
            DELETE FROM api_categories
            WHERE api_category_id = ?
        `, [apiCategoryId]);
    } catch (error) {
        console.error('Ошибка при удалении категории API:', error);
        throw error;
    }
}

module.exports = { getApiCategoryById, getAllApiCategories, createApiCategory, updateApiCategoryById, deleteApiCategoryById }