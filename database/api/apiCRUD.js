const path = require('path');
const { db } = require(path.join(__dirname, '../../config/db'));

// Получение бренда по ID // Надо продумать то, как пользователь будет его получать
async function getApi(brand, platform, apiCategory) {
    try {
        const [rows] = await db.query(
            `SELECT token, expiration_date FROM apis
            JOIN brands ON apis.brand_id = brands.brand_id
            JOIN platforms ON apis.platform_id = platforms.platform_id
            JOIN api_categories ON apis.api_category_id = api_categories.api_category_id
            WHERE brand = ? AND platform = ? AND category = ?`,
            [brand, platform, apiCategory]
        );

        if (rows.length === 0) {
            console.log('Information not found');
            return null; // Возвращаем null, если данные не найдены
        }
        return rows[0].token; // Возвращаем токен
    } catch (error) {
        console.error('Error executing query:', error.message);
        return 'Internal Server Error';
    }
}

// Получение всех брендов
async function getAllApis() {
    try {
        ensureDatabaseConnection(db);
        const [apis] = await db.query(`
                SELECT * FROM apis
            `
        );
        return apis
    } catch (error) {
        console.error('Ошибка при получении брендов:', error);
        throw error;
    }
}

// Создание нового бренда
async function createApi(newApiName, brand, platform, category, expiration_date) {
    try {
        ensureDatabaseConnection(db);
        await db.execute(`
            INSERT INTO apis (token, brand, platform, category, expiration_date)
            VALUES (
                ?
                (SELECT brand_id  FROM brands WHERE brand = ?)
                (SELECT platform_id FROM platforms WHERE platform = ?)
                (SELECT api_category_id FROM api_categories WHERE api_category = ?) 
                ?
            )
            ON DUBLICATE KEY UPDATE token = token 
            `,
            [newApiName, brand, platform, category, expiration_date]
        );
    } catch (error) {
        console.error('Ошибка при создании бренда:', error);
        throw error;
    }
}

// Обновление бренда по ID
async function updateApiById(apiId, renameApiName) {
    try {
        ensureDatabaseConnection(db);
        await db.execute(`
            UPDATE apis
            SET token = ?
            WHERE api_id = ?
        `, [renameApiName, apiId]);
    } catch (error) {
        console.error('Ошибка при обновлении бренда:', error);
        throw error;
    }
}

// Удаление бренда по ID
async function deleteApiById(apiId) {
    try {
        ensureDatabaseConnection(db);
        await db.execute(`
            DELETE FROM apis
            WHERE api_id = ?
        `, [apiId]);
    } catch (error) {
        console.error('Ошибка при удалении бренда:', error);
        throw error;
    }
}

module.exports = {getApi};