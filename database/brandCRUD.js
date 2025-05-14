const path = require('path');
const { db } = require(path.join(__dirname, '../config/db'));
const { ensureDatabaseConnection } = require(path.join(__dirname, '../utils/errorHandler'));

// Получение бренда по ID
async function getBrandById(brandId) {
    try {
        ensureDatabaseConnection(db);
        const [brand] = await db.query(`
                SELECT brand FROM brands
                WHERE brand_id = ? 
            `, [brandId]);
        return brand
    } catch (error) {
        console.error('Ошибка при получении брендов по id:', error);
        throw error
    }
}

// Получение всех брендов
async function getAllBrands() {
    try {
        ensureDatabaseConnection(db);
        const [brands] = await db.query(`
                SELECT * FROM brands
            `
        );
        return brands
    } catch (error) {
        console.error('Ошибка при получении брендов:', error);
        throw error;
    }
}

// Создание нового бренда
async function createBrand(newBrandName) {
    try {
        ensureDatabaseConnection(db);
        await db.execute(`
                INSERT INTO brands (brand)
                VALUES (?)
                ON DUBLICATE KEY UPDATE brand = ?
            `,
            [newBrandName, newBrandName]
        );
    } catch (error) {
        console.error('Ошибка при создании бренда:', error);
        throw error;
    }
}

// Обновление бренда по ID
async function updateBrandById(brandId, renameBrandName) {
    try {
        ensureDatabaseConnection(db);
        await db.execute(`
            UPDATE brands
            SET brand = ?
            WHERE brand_id = ?
        `, [renameBrandName, brandId]);
    } catch (error) {
        console.error('Ошибка при обновлении бренда:', error);
        throw error;
    }
}

// Удаление бренда по ID
async function deleteBrandById(brandId) {
    try {
        ensureDatabaseConnection(db);
        await db.execute(`
            DELETE FROM brands
            WHERE brand_id = ?
        `, [brandId]);
    } catch (error) {
        console.error('Ошибка при удалении бренда:', error);
        throw error;
    }
}

module.exports = { getBrandById, getAllBrands, createBrand, updateBrandById, deleteBrandById }