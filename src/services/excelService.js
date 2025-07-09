const path = require('path');
const XlsxPopulate = require('xlsx-populate');
const { loadCategoryValuesByOfferId } = require('@excel/utils/categoryLookup');
const exceljs = require('exceljs');

/**
 * Загружает цены из Excel-файла в Map.
 * @param {string} filePath - Путь к файлу с ценами.
 * @returns {Promise<Map>} - Map с артикулами и ценами.
 */
async function loadPricesFromExcel(filePath) {
    try {
        const workbook = new exceljs.Workbook();
        await workbook.xlsx.readFile(filePath);

        const sheet = workbook.worksheets[1]; // Первый лист
        const priceMap = new Map();

        let rowNumber = 4; // Начинаем с 4-й строки
        while (true) {
            const offerIdCell = sheet.getCell(`C${rowNumber}`).value;
            const priceCell = sheet.getCell(`O${rowNumber}`).value;

            // Если ячейка C пустая, завершаем чтение
            if (!offerIdCell) break;

            // Проверяем, что цена существует и является числом
            const price = parseFloat(priceCell);
            if (isNaN(price)) {
                rowNumber++;
                continue; // Пропускаем некорректные цены
            }

            // Добавляем артикул и цену в Map
            priceMap.set(offerIdCell.toString().trim(), price);

            rowNumber++;
        }

        return priceMap;
    } catch (error) {
        console.error("Ошибка при чтении файла с ценами:", error.message);
        throw error;
    }
}

/**
 * Генерирует файл для редактирования акций.
 * @param {Array} data - Данные для обработки.
 * @returns {Promise<Buffer>} - Буфер сгенерированного файла.
 */
const generateFileEditingAction = async (data) => {
    try {
        const percent = 20;
        const factorPercent = (100 - percent) / 100;

        const templatePath = path.join(__dirname, '..', 'assets/templates', 'template.xlsm');
        const workbook = await XlsxPopulate.fromFileAsync(templatePath);
        const sheet = workbook.sheet(0);

        const pricesFilePath = path.join(__dirname, '..', 'assets/templates', 'prices.xlsx');
        const priceMap = await loadPricesFromExcel(pricesFilePath);

        sheet.cell("C1").value(`Расх. ${percent}%`);

        for (let index = 0; index < data.length; index++) {
            const item = data[index];
            const rowNumber = index + 2;

            if (!item.offer_id || !item.price?.marketing_price) continue;

            const cleanOfferId = item.offer_id.replace(/\(.*?\)/, '').trim();
            const { valueF, expense } = await loadCategoryValuesByOfferId(cleanOfferId);
            const price = priceMap.get(item.offer_id);

            sheet.cell(`A${rowNumber}`).value(item.offer_id);
            sheet.cell(`B${rowNumber}`).value(price || '');
            sheet.cell(`C${rowNumber}`).value("");

            sheet.cell(`D${rowNumber}`).formula(
                `(B${rowNumber}*${factorPercent}-${valueF}-${expense})`
            );

            sheet.cell(`E${rowNumber}`).value(item.price.marketing_price);
            sheet.cell(`G${rowNumber}`).formula(
                `IF(F${rowNumber}="", (E${rowNumber}*0.49-320-100), (F${rowNumber}*0.49-320-100))`
            );
        }

        // Возвращаем буфер файла без сохранения на диск
        return await workbook.outputAsync();
    } catch (error) {
        console.error("Ошибка при создании Excel:", error.message);
        throw error;
    }
};

/**
 * Генерирует файл для редактирования цен.
 * @param {Array} data - Данные для обработки.
 * @param {Object} ws - Рабочий лист Excel.
 * @returns {Promise<Buffer>} - Буфер сгенерированного файла.
 */
async function generatePriceEditing(data, ws) {
    try {
        if (!Array.isArray(data)) {
            console.error("Данные не являются массивом:", data);
            throw new Error("Неверный формат данных.");
        }

        const percent = 20;
        const factorPercent = (100 - percent) / 100;

        ws.getCell(`E1`).value = `Расх. ${percent}%`;

        for (let index = 0; index < data.length; index++) {
            const item = data[index];
            const rowNumber = index + 2;

            if (!item.offer_id || !item.price?.marketing_price) {
                console.warn(`Пропущена запись с индексом ${index}: отсутствуют необходимые поля`);
                continue;
            }

            const cleanOfferId = item.offer_id.replace(/\(.*?\)/, '').trim();
            const { valueF, expense } = await loadCategoryValuesByOfferId(cleanOfferId);

            ws.getCell(`A${rowNumber}`).value = item.offer_id;
            ws.mergeCells(`B${rowNumber}:C${rowNumber}`);
            ws.getCell(`B${rowNumber}`).value = item.price.marketing_price;

            ws.getCell(`E${rowNumber}`).value = {
                formula: `IF(D${rowNumber}="", (B${rowNumber}*${factorPercent}-${valueF}-${expense}), (D${rowNumber}*${factorPercent}-${valueF}-${expense}))`
            };
        }

        const workbook = ws.workbook;
        return await workbook.xlsx.writeBuffer(); // Возвращаем буфер без сохранения на диск
    } catch (error) {
        console.error("Произошла ошибка при формировании файла Excel:", error.message);
        throw error;
    }
}

module.exports = { generateFileEditingAction, generatePriceEditing };