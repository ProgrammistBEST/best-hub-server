const path = require('path');
const {db} = require(path.join(__dirname, '../../config/db'));
const { ensureDatabaseConnection } = require(path.join(__dirname, '../../utils/errorHandler'))
const { checkDuplicate } = require(path.join(__dirname, '../../utils/checkDuplicate'));

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

async function createSize(newSizeName) {
    try {
        ensureDatabaseConnection(db);

        if (!newSizeName || typeof newSizeName !== 'string' || newSizeName.trim() === '') {
            throw new Error('Некорректное имя артикула');
        }

        // Проверка на дубликат
        const existing = await checkDuplicate('sizes', { size: newSizeName });
        if (existing) {
            throw new Error('Артикул уже существует');
        }

        await db.execute(`
            INSERT INTO sizes (size)
            VALUES (?)
        `, [newSizeName]);

    } catch (error) {
        console.error('Не удалось создать размер:', error.message);
        throw error;
    }
}

module.exports = { getAllSizes, createSize }