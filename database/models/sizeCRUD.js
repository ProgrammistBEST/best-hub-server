const path = require('path');
const {db} = require(path.join(__dirname, '../../config/db'));
const { ensureDatabaseConnection } = require(path.join(__dirname, '../../utils/errorHandler'))

async function createSize(size) {
    try {
        ensureDatabaseConnection(db);
        await db.execute(`
            INSERT INTO sizes SET size = ?
            ON DUPLICATE KEY UPDATE size = size`, 
            [size, size])
    } catch (error) {
        console.error({'Не удалось создать размер:': error.message})
        throw error
    }
}

module.exports = { createSize }