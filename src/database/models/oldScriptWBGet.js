async function createModelsWithWB(data, brand, platform) {
    let connection;
    try {
        connection = await db.getConnection();
        // ensureDatabaseConnection(connection);

        // Шаг 1: Проверка наличия бренда и платформы в базе данных
        const [brandRow] = await connection.execute("SELECT brand_id FROM brands WHERE brand = ?", [brand]);
        if (!brandRow || brandRow.length === 0) {
            console.error(`Бренд "${brand}" не найден в базе данных.`);
            return;
        }
        const brandId = brandRow[0].brand_id;

        const [platformRow] = await connection.execute("SELECT platform_id FROM platforms WHERE platform = ?", [platform]);
        if (!platformRow || platformRow.length === 0) {
            console.error(`Платформа "${platform}" не найдена в базе данных.`);
            return;
        }
        const platformId = platformRow[0].platform_id;

        // Начало транзакции
        await connection.beginTransaction();

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

            // Шаг 2: Проверка или создание записи в external_articles
            let articleId;
            const [externalArticleRow] = await connection.execute(
                `SELECT article_id FROM external_articles WHERE platform_id = ? AND external_article = ?`,
                [platformId, article]
            );

            if (externalArticleRow.length > 0) {
                // Если внешний артикул существует, берем его article_id
                articleId = externalArticleRow[0].article_id;
            } else {
                // Если внешний артикул отсутствует, проверяем наличие базового артикула
                const [articleRow] = await connection.execute(
                    `SELECT article_id FROM articles WHERE article = ?`,
                    [article]
                );

                if (articleRow.length > 0) {
                    // Если базовый артикул существует, берем его article_id
                    articleId = articleRow[0].article_id;
                } else {
                    // Если базовый артикул отсутствует, создаем его
                    await createArticle(article);
                    const [newArticleRow] = await connection.execute(
                        `SELECT article_id FROM articles WHERE article = ?`,
                        [article]
                    );
                    articleId = newArticleRow[0].article_id;
                }

                // Создаем запись в external_articles
                await connection.execute(
                    `INSERT INTO external_articles (article_id, external_article, platform_id) VALUES (?, ?, ?)`,
                    [articleId, article, platformId]
                );
            }

            // Шаг 3: Добавление размеров и моделей
            for (const sizeObj of sizes) {
                const { techSize, sku } = sizeObj;

                // Проверка наличия размера
                let sizeId;
                const [sizeRow] = await connection.execute(
                    `SELECT size_id FROM sizes WHERE size = ?`,
                    [techSize]
                );

                if (sizeRow.length > 0) {
                    // Если размер существует, берем его size_id
                    sizeId = sizeRow[0].size_id;
                } else {
                    // Если размер отсутствует, создаем его
                    await createSize(techSize);
                    const [newSizeRow] = await connection.execute(
                        `SELECT size_id FROM sizes WHERE size = ?`,
                        [techSize]
                    );
                    sizeId = newSizeRow[0].size_id;
                }

                // Шаг 4: Создание модели через вызов функции createModel
                await createModel(
                    brand,
                    article,
                    techSize,
                    sku,
                    20, // pair
                    safeCategories,
                    gender,
                    safeColor,
                    safeCompound,
                    platform
                );
            }
        }

        // Фиксация транзакции
        await connection.commit();
        console.log("Данные успешно загружены в базу данных.");
    } catch (error) {
        // Откат транзакции в случае ошибки
        await connection.rollback();
        console.error("Ошибка при загрузке данных:", error.message);
        throw error;
    }
}