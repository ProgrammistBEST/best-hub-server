const { db } = require('@config/db');

// Получение API по фильтрам
async function getApi(brand, platform, apiCategory) {
    try {
        const [rows] = await db.query(
            `SELECT token, expiration_date FROM apis
            JOIN brands ON apis.brand_id = brands.brand_id
            JOIN platforms ON apis.platform_id = platforms.platform_id
            JOIN api_categories ON apis.api_category_id = api_categories.api_category_id
            WHERE brands.brand = ? AND platforms.platform = ? AND api_categories.api_category = ?`,
            [brand, platform, apiCategory]
        );

        if (rows.length === 0) {
            console.log('Information not found');
            return null;
        }
        return rows[0].token;
    } catch (error) {
        console.error('Error executing query:', error.message);
        throw new Error('Internal Server Error');
    }
}

// Получение всех API
async function getAllApis() {
    try {
        const [apis] = await db.query(
            `SELECT * FROM apis
            JOIN brands ON apis.brand_id = brands.brand_id
            JOIN platforms ON apis.platform_id = platforms.platform_id
            JOIN api_categories ON apis.api_category_id = api_categories.api_category_id
            `);
        return apis || [];
    } catch (error) {
        console.error('Ошибка при получении API:', error);
        throw error;
    }
}

// Создание нового API
async function createApi(token, brand, platform, api_category, expiration_date) {
    try {
        await db.execute(`
            INSERT INTO apis (token, brand_id, platform_id, api_category_id, expiration_date)
            VALUES (
                ?,
                (SELECT brand_id FROM brands WHERE brand = ?),
                (SELECT platform_id FROM platforms WHERE platform = ?),
                (SELECT api_category_id FROM api_categories WHERE api_category = ?),
                ?
            )
            ON DUPLICATE KEY UPDATE token = VALUES(token)
        `, [token, brand, platform, api_category, expiration_date]);
    } catch (error) {
        console.error('Ошибка при создании API:', error);
        throw error;
    }
}

// Обновление API по ID
async function updateApiById(apiId, token) {
    try {
        await db.execute(`
            UPDATE apis
            SET token = ?
            WHERE api_id = ?
        `, [token, apiId]);
    } catch (error) {
        console.error('Ошибка при обновлении API:', error);
        throw error;
    }
}

// Удаление API по ID
async function deleteApiById(apiId) {
    try {
        await db.execute(`
            DELETE FROM apis
            WHERE api_id = ?
        `, [apiId]);
    } catch (error) {
        console.error('Ошибка при удалении API:', error);
        throw error;
    }
}

module.exports = { getApi, getAllApis, createApi, updateApiById, deleteApiById };