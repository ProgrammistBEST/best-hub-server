const path = require('path');
const {db} = require(path.join(__dirname, '../../config/db'));
const { ensureDatabaseConnection } = require(path.join(__dirname, '../../utils/errorHandler'))


async function getAllSizes() {
    try {
        ensureDatabaseConnection(db);
        const [sizes] = await db.query(`
                SELECT * FROM sizes
            `)
        return sizes
    } catch (error) {
        console.error({'Ошибка при получении моделей': error.message})
        throw error
    }
}

async function createSize(size) {
    try {
        ensureDatabaseConnection(db);
        await db.execute(`
            INSERT INTO sizes SET size = ?
            ON DUPLICATE KEY UPDATE size = size`, 
            [size, size])
    } catch (error) {
        console.error('Не удалось создать размер:', error.message);
        throw error;
    }
}

module.exports = { getAllSizes, createSize }