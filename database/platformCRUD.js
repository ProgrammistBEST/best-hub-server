const path = require('path');
const { db } = require(path.join(__dirname, '../config/db'));
const { ensureDatabaseConnection } = require(path.join(__dirname, '../utils/errorHandler'));

// Получение платформы по ID
async function getPlatformById(platformId) {
    try {
        ensureDatabaseConnection(db);
        const [platforms] = await db.query(
            `SELECT platform FROM platforms WHERE platform_id = ?`,
            [platformId]
        );
        return platforms[0]; // Возвращаем только одну запись
    } catch (error) {
        console.error('Ошибка при получении платформы по ID:', error);
        throw error;
    }
}

// Получение всех платформ
async function getAllPlatforms() {
    try {
        ensureDatabaseConnection(db);
        const [platforms] = await db.query(`SELECT * FROM platforms`);
        return platforms;
    } catch (error) {
        console.error('Ошибка при получении всех платформ:', error);
        throw error;
    }
}

// Создание новой платформы
async function createPlatform(newPlatformName) {
    try {
        ensureDatabaseConnection(db);
        await db.execute(
            `INSERT INTO platforms (platform)
             VALUES (?)
             ON DUPLICATE KEY UPDATE platform = ?`,
            [newPlatformName, newPlatformName]
        );
    } catch (error) {
        console.error('Ошибка при создании платформы:', error);
        throw error;
    }
}

// Обновление платформы по ID
async function updatePlatformById(platformId, renamePlatformName) {
    try {
        ensureDatabaseConnection(db);
        await db.execute(
            `UPDATE platforms
             SET platform = ?
             WHERE platform_id = ?`,
            [renamePlatformName, platformId]
        );
    } catch (error) {
        console.error('Ошибка при обновлении платформы:', error);
        throw error;
    }
}

// Удаление платформы по ID
async function deletePlatformById(platformId) {
    try {
        ensureDatabaseConnection(db);
        await db.execute(`DELETE FROM platforms WHERE platform_id = ?`, [platformId]);
    } catch (error) {
        console.error('Ошибка при удалении платформы:', error);
        throw error;
    }
}

module.exports = {
    getPlatformById,
    getAllPlatforms,
    createPlatform,
    updatePlatformById,
    deletePlatformById,
};