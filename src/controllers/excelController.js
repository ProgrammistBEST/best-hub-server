const { generateFileEditingAction, generatePriceEditing } = require('@services/excelService');
const { getPriceGoods } = require('@services/ozon/getPriceGoods');
const { loadTemplate } = require('@excel/templateLoader');
const { getApi } = require('@database/api/apiCRUD')
const { getWarehouseBalances } = require('@services/ozon/getWarehouseBalances');
/**
 * Обрабатывает запрос на создание файла для редактирования акций.
 */
exports.installFileEditingAction = async (req, res) => {
    try {
        const { brand, platform } = req.body; // Получаем бренд из запроса
        const fileBuffer = req.file.buffer;

        if (!fileBuffer || !brand || !platform) {
            return res.status(400).json({ message: 'Отсутствуют необходимые данные.' });
        }

        const clientID = await getApi(brand, platform, "client-id"); // Получаем токен
        const apiKey = await getApi(brand, platform, "action"); // Получаем токен

        const data = await getPriceGoods(clientID, apiKey); // Передаем токен в функцию
        const buffer = await generateFileEditingAction(data, fileBuffer);

        const fileName = encodeURIComponent("Редактирование_акций.xlsm").replace(/'/g, "%27");
        res.setHeader('Content-Type', 'application/vnd.ms-excel.sheet.macroEnabled.12');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${fileName}"; filename*=UTF-8''${fileName}`
        );

        res.send(buffer);
    } catch (error) {
        console.error("Ошибка при формировании файла:", error);
        res.status(500).json({ message: 'Ошибка при формировании файла Excel.' });
    }
};

/**
 * Обрабатывает запрос на создание файла для редактирования цен.
 */
exports.installPriceEditing = async (req, res) => {
    try {
        const { brand, platform } = req.body;

        const clientID = await getApi(brand, platform, "client-id");
        const apiKey = await getApi(brand, platform, "action");
        const apiKeyFBO = await getApi(brand, platform, "api-key-fbo");

        const [priceData, stockData] = await Promise.all([
            getPriceGoods(clientID, apiKey),
            getWarehouseBalances(clientID, apiKeyFBO)
        ]);

        // Сопоставляем данные по offer_id
        const stockMap = new Map();
        for (const item of stockData) {
            if (!item.offer_id) continue;
            stockMap.set(item.offer_id, {
                warehouses: item.stocks || [],
            });
        }

        const mergedData = priceData.map(item => {
            const stock = stockMap.get(item.offer_id) || {};
            return {
                ...item,
                ...stock,
            };
        });

        const ws = await loadTemplate('regulation_price.xlsx');
        const buffer = await generatePriceEditing(mergedData, ws);

        const fileName = encodeURIComponent("Редактирование_цен.xlsm").replace(/'/g, "%27");
        res.setHeader('Content-Type', 'application/vnd.ms-excel.sheet.macroEnabled.12');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${fileName}"; filename*=UTF-8''${fileName}`
        );

        res.send(buffer);
    } catch (error) {
        console.error("Ошибка при формировании файла:", error);
        res.status(500).json({ message: 'Ошибка при формировании файла Excel.' });
    }
};