const path = require('path');
const { db } = require(path.join(__dirname, '../../config/db'));
const { ensureDatabaseConnection } = require(path.join(__dirname, '../../utils/errorHandler'))
const { createArticle } = require(path.join(__dirname, './articleCRUD'))
const { createSize } = require(path.join(__dirname, './sizeCRUD'))

async function getAllModels() {
    try {
        ensureDatabaseConnection(db);
        const [models] = await db.query(`
            SELECT 
                m.model_id,
                b.brand AS brand,
                a.article AS article,
                s.size AS size,
                m.sku,
                m.pair,
                m.category,
                m.gender,
                m.color,
                m.compound,
                p.platform AS platform,
                m.updated_at AS updated_at,
                m.is_deleted
            FROM models m
            JOIN brands b ON m.brand_id = b.brand_id
            JOIN articles a ON m.article_id = a.article_id
            JOIN sizes s ON m.size_id = s.size_id
            JOIN platforms p ON m.platform_id = p.platform_id
            LIMIT 100;
        `);
        return models;
    } catch (error) {
        console.error('Ошибка получения моделей:', error.message);
        throw error;
    }
}

async function checkRecordExists(db, table, column, value) {
    try {
        const [rows] = await db.execute(
            `SELECT ${column}_id FROM ${table} WHERE ${column} = ?`,
            [value]
        );
        return rows.length > 0; // Возвращает true, если запись найдена
    } catch (error) {
        console.error(`Ошибка при проверке записи в таблице "${table}":`, error.message);
        throw error;
    }
}

async function createModelsWithWB(data, brand, platform) {
    try {
        ensureDatabaseConnection(db);

        // Шаг 1: Проверка наличия бренда и платформы в базе данных
        const isBrandExists = await checkRecordExists(db, 'brands', 'brand', brand);
        if (!isBrandExists) {
            console.error(`Бренд "${brand}" не найден в базе данных.`);
            return; // Прекращаем выполнение, если бренд не существует
        }

        const isPlatformExists = await checkRecordExists(db, 'platforms', 'platform', platform);
        if (!isPlatformExists) {
            console.error(`Платформа "${platform}" не найдена в базе данных.`);
            return; // Прекращаем выполнение, если платформа не существует
        }

        for (const item of data) {
            const { article, gender, compound, color, sizes, categories } = item;

            // Проверка на undefined
            if (!article || !gender || !categories || !sizes || !Array.isArray(sizes)) {
                console.warn(`Пропущена запись: недостаточно данных для article=${article}`);
                continue;
            }

            // Замена undefined на null
            const safeCompound = compound || null;
            const safeColor = color || null;
            const safeCategories = categories || null;

            // Шаг 2: Добавить артикул
            await createArticle(article);

            // Шаг 3: Добавить размеры и модели
            for (const sizeObj of sizes) {
                const { techSize, sku } = sizeObj;

                // Добавить размер
                await createSize(techSize);

                // Шаг 4: Добавить модель
                await db.execute(
                    `
                    INSERT INTO models (
                        brand_id,
                        article_id,
                        size_id,
                        sku,
                        pair,
                        category,
                        gender,
                        color,
                        compound,
                        platform_id
                    )
                    VALUES (
                        (SELECT brand_id FROM brands WHERE brand = ?),
                        (SELECT article_id FROM articles WHERE article = ?),
                        (SELECT size_id FROM sizes WHERE size = ?),
                        ?,
                        20,
                        ?,
                        ?,
                        ?,
                        ?,
                        (SELECT platform_id FROM platforms WHERE platform = ?)
                    )
                    ON DUPLICATE KEY UPDATE sku = sku
                    `,
                    [brand, article, techSize, sku, safeCategories, gender, safeColor, safeCompound, platform]
                );
            }
        }

        console.log("Данные успешно загружены в базу данных.");
    } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
        throw error
    }
}

// Создание новой модели с заданными параметрами
async function createModel(newModelName) {
    try {
        ensureDatabaseConnection(db);
        await db.execute(`
                INSERT INTO models (brand, article, size, sku, pair)
                VALUES (?)
                ON DUBLICATE KEY UPDATE brand = ?
            `,
            [newModelName, newModelName]
        );
    } catch (error) {
        console.error('Ошибка при создании бренда:', error);
        throw error;
    }
}

async function getModelById(modelId) {
    try {
        ensureDatabaseConnection(db);
        const model = await db.query(`
                SELECT * FROM models
                WHERE model_id = ?
            `,
            [modelId]
        )
        return model
    } catch (error) {
        console.error({'Ошибка при получении модели по ID:': error.message});
        throw error;
    }
}

async function updateModelById(modelId, pair, category, gender, color, compound) {
    try {
        // Проверка наличия модели
        const [model] = await db.execute("SELECT * FROM models WHERE model_id = ?", [modelId]);
        if (model.length === 0) {
            return res.status(404).json({ error: 'Модель не найдена' });
        }

        // Обновление параметров модели
        await db.execute(
            `
            UPDATE models
            SET
                pair = COALESCE(?, pair),
                category = COALESCE(?, category),
                gender = COALESCE(?, gender),
                color = COALESCE(?, color),
                compound = COALESCE(?, compound)
            WHERE model_id = ?
            `,
            [pair, category, gender, color, compound, modelId]
        );
    } catch (error) {
        console.error('Модель не была обновлена:', error.message)
        throw error
    }
}

async function updateModelById(req, res) {
    const modelId = req.params.id;
    const updates = req.body;

    // Запрещенные поля для обновления
    const forbiddenFields = ['model_id', 'brand_id', 'platform_id'];

    // Фильтрация запрещённых полей
    for (const field of forbiddenFields) {
        if (field in updates) {
            return res.status(400).json({ error: `Изменение поля "${field}" запрещено` });
        }
    }

    // Проверка наличия модели
    try {
        const [existingModel] = await db.execute('SELECT * FROM models WHERE model_id = ?', [modelId]);
        if (existingModel.length === 0) {
            return res.status(404).json({ error: 'Модель не найдена' });
        }

        // Динамическое построение запроса
        const fields = Object.keys(updates);
        if (fields.length === 0) {
            return res.status(400).json({ error: 'Нет данных для обновления' });
        }

        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = fields.map(field => updates[field]);

        await db.execute(
            `UPDATE models SET ${setClause} WHERE model_id = ?`,
            [...values, modelId]
        );

        res.json({ message: 'Модель успешно обновлена' });
    } catch (error) {
        console.error('Ошибка при обновлении модели:', error.message);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
}

module.exports = { getAllModels, createModelsWithWB, getModelById, createModel, updateModelById }