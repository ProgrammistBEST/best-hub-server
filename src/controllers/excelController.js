const { generateFileEditingAction, generatePriceEditing } = require('@services/excelService');
const { getPriceGoods } = require('@services/ozon/getPriceGoods');
const { loadTemplate } = require('@excel/templateLoader');
const { getApi } = require('@database/api/apiCRUD')

/**
 * Обрабатывает запрос на создание файла для редактирования акций.
 */
exports.installFileEditingAction = async (req, res) => {
    try {
        const { brand, platform } = req.body; // Получаем бренд из запроса
        const token = getApi(brand, platform, "action"); // Получаем токен

        const data = await getPriceGoods(token); // Передаем токен в функцию
        const buffer = await generateFileEditingAction(data);

        res.setHeader('Content-Type', 'application/vnd.ms-excel.sheet.macroEnabled.12');
        res.setHeader('Content-Disposition', 'attachment; filename="Редактирование_акций.xlsm"');
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
        const { brand, platform } = req.body; // Получаем бренд из запроса
        const clientID = await getApi(brand, platform, "client-id"); // Получаем токен
        const apiKey = await getApi(brand, platform, "action"); // Получаем токен

        const data = await getPriceGoods(clientID, apiKey); // Передаем токен в функцию
        const ws = await loadTemplate('template_price.xlsm');
        const buffer = await generatePriceEditing(data, ws);

        // Устанавливаем заголовки с корректным кодированием имени файла
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