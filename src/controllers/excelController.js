const { installPriceEditing, installFileEditingAction } = require('@services/excelService');
const { getPriceGoods } = require('@services/ozon/getPriceGoods');
const { loadTemplate } = require('@excel/templateLoader')

exports.installFileEditingAction = async (req, res) => {
    try {
        const data = await getPriceGoods()

        const buffer = await installFileEditingAction(data);

        res.setHeader('Content-Type', 'application/vnd.ms-excel.sheet.macroEnabled.12');
        res.setHeader('Content-Disposition', 'attachment; filename="Редактирование_акций.xlsm"');
        res.send(buffer);
    } catch (error) {
        console.error("Ошибка при формировании файла:", error);
        res.status(500).json({ message: 'Ошибка при формировании файла Excel.' });
    }
};

exports.installPriceEditing = async (req, res) => {
    try {
        // const { brand, } = req.body;
        const data = await getPriceGoods()

        // if (!Array.isArray(data)) {
        //     return res.status(400).json({ message: 'Неверный формат данных, ожидался массив.' });
        // }
        const ws = await loadTemplate('template.xlsm');
        const buffer = await installPriceEditing(data, ws);

        res.setHeader('Content-Type', 'application/vnd.ms-excel.sheet.macroEnabled.12');
        res.setHeader('Content-Disposition', 'attachment; filename="Редактирование_акций.xlsm"');
        res.send(buffer);
    } catch (error) {
        console.error("Ошибка при формировании файла:", error);
        res.status(500).json({ message: 'Ошибка при формировании файла Excel.' });
    }
};
