const { platform } = require('os');
const path = require('path');
const { db } = require(path.join(__dirname, '../../config/db'));
const { ensureDatabaseConnection } = require(path.join(__dirname, '../../utils/errorHandler'))
const { createArticle } = require(path.join(__dirname, './articleCRUD'))
const { createSize } = require(path.join(__dirname, './sizeCRUD'))
const { checkForDuplicateExternalArticle, checkDuplicate } = require(path.join(__dirname, '../../utils/checkDuplicate'))

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
        `);
        return models;
    } catch (error) {
        console.error('Ошибка получения моделей:', error.message);
        throw error;
    }
}

async function createModelsWithWB(data, brand, platform) {
    let connection;
    try {
        connection = await db.getConnection();


        await connection.beginTransaction();

        for (const item of data) {
            const { article, gender, compound, color, sizes, categories } = item;

            if (!article || !gender || !categories || !sizes || !Array.isArray(sizes)) {
                console.warn(`Пропущена запись: недостаточно данных для article=${article}`);
                continue;
            }

            const safeCompound = compound || null;
            const safeColor = color || null;
            const safeCategories = categories || null;

            for (const { techSize, sku } of sizes) {
                if (await checkDuplicate('models', { sku })) {
                    console.warn(`SKU "${sku}" уже существует. Пропускаем создание модели.`);
                    continue;
                }

                try {
                    await handleExternalArticle('articles', article, platform);
                    await createModel(
                        brand,
                        article,
                        techSize,
                        sku,
                        20,
                        safeCategories,
                        gender,
                        safeColor,
                        safeCompound,
                        platform
                    );
                    console.log(`Модель с SKU "${sku}" успешно создана.`);
                } catch (error) {
                    console.error(`Ошибка при создании модели для SKU "${sku}":`, error.message);
                    continue;
                }
            }
        }

        await connection.commit();
        console.log("Данные успешно загружены в базу данных.");
    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Ошибка при загрузке данных:", error.message);
        throw error;
    } finally {
        if (connection) connection.release();
    }
}

// Создание новой модели с заданными параметрами
async function createModel(brand, article, size, sku, pair = 20, category = null, gender = null, color = null, compound = null, platform) {
    try {
        ensureDatabaseConnection(db);

        // Шаг 1: Проверка существования SKU
        const existingSKU = await checkDuplicate('models', { sku });
        if (existingSKU) {
            throw new Error('SKU уже существует. Дубликаты запрещены.');
        }

        // Шаг 2: Проверка и получение brand_id
        const brandId = await checkDuplicate('brands', { brand });
        if (!brandId) {
            throw new Error(`Бренд "${brand}" не найден в базе данных.`);
        }

        // Шаг 3: Проверка и получение platform_id
        const platformId = await checkDuplicate('platforms', { platform });
        if (!platformId) {
            throw new Error(`Платформа "${platform}" не найдена в базе данных.`);
        }

        // Шаг 4: Проверка наличия артикула
        const articleId = checkDuplicate('article', {"article": article})
        if (!articledId || articleId === 0) {
            await createArticle(article);
            const [newArticleRow] = await db.execute(
                `SELECT article_id FROM articles WHERE article = ?`,
                [article]
            );
            articleId = newArticleRow[0].article_id;
        }

        // Шаг 5: Проверка наличия размера
        const [sizeId] = checkDuplicate('size', {"size": size})
        if (!sizedId || sizeId === 0) {
            await createsize(size);
            const [newsizeRow] = await db.execute(
                `SELECT size_id FROM sizes WHERE size = ?`,
                [size]
            );
            sizeId = newsizeRow[0].size_id;
        }

        // Шаг 6: Вставка новой модели
        await db.execute(
            `
            INSERT INTO models (
                brand_id,
                platform_id,
                article_id,
                size_id,
                sku,
                pair,
                category,
                gender,
                color,
                compound
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                brandId,
                platformId,
                articleId,
                sizeId,
                sku,
                pair,
                category,
                gender,
                color,
                compound
            ]
        );

        console.log('Модель успешно создана.');
    } catch (error) {
        console.error('Ошибка при создании модели:', error.message);
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

async function handleExternalArticle(connection, article, platform) {
    try {
        // Проверка входных данных
        if (!article || typeof article !== 'string' || article.trim() === '') {
            throw new Error('Некорректное значение article');
        }
        if (!platform || typeof platform !== 'string' || platform.trim() === '') {
            throw new Error('Некорректное значение platform');
        }

        // Проверка наличия внешнего артикула
        const externalArticle = await checkForDuplicateExternalArticle(platformId, article);
        if (externalArticle) {
            return externalArticle; // Возвращаем article_id
        }

        // Проверка наличия базового артикула
        const articleRecord = await checkDuplicate('articles', { article });
        let articleId;
        if (articleRecord) {
            articleId = articleRecord.article_id;
        } else {
            // Если базовый артикул отсутствует, создаем его
            await createArticle(article);
            const newArticleRecord = await checkDuplicate('articles', { article });
            articleId = newArticleRecord.article_id;
        }

        // Создаем или обновляем запись в external_articles
        await connection.execute(
            `
            INSERT INTO external_articles (article_id, external_article, platform_id)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE article_id = VALUES(article_id)
            `,
            [articleId, article, platformId]
        );

        // Получаем article_id созданной или обновленной записи
        const [rows] = await connection.execute(
            `SELECT article_id FROM external_articles WHERE platform_id = ? AND external_article = ?`,
            [platformId, article]
        );
        return rows[0].article_id;
    } catch (error) {
        console.error('Ошибка при обработке внешнего артикула:', error.message);
        throw error;
    }
}

module.exports = { getAllModels, createModelsWithWB, getModelById, createModel, updateModelById }