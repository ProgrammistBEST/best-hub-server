const path = require('path');
const XlsxPopulate = require('xlsx-populate');
const { loadCategoryValuesByOfferId } = require('@excel/utils/categoryLookup');
const exceljs = require('exceljs');

function applyThinBorderPopulate(sheet, rowNumber) {
    const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'Q'];
    for (const col of columns) {
        const cell = sheet.cell(`${col}${rowNumber}`);
        cell.style("border", {
            top: "thin",
            bottom: "thin",
            left: "thin",
            right: "thin",
        });
    }
}


/**
 * Загружает цены из Excel-файла в Map.
 * @param {string} filePath - Путь к файлу с ценами.
 * @returns {Promise<Map>} - Map с артикулами и ценами.
 */
async function loadPricesFromExcel(fileBuffer) {
    try {
        const workbook = new exceljs.Workbook();
        await workbook.xlsx.load(fileBuffer); // Заменили readFile на load

        const sheet = workbook.worksheets[1];
        const priceMap = new Map();

        let rowNumber = 4;
        while (true) {
            const offerIdCell = sheet.getCell(`C${rowNumber}`).value;
            const priceCell = sheet.getCell(`K${rowNumber}`).value;

            if (!offerIdCell) break;

            const price = parseFloat(priceCell);
            if (!isNaN(price)) {
                priceMap.set(offerIdCell.toString().trim(), price);
            }

            rowNumber++;
        }

        return priceMap;
    } catch (error) {
        console.error("Ошибка при чтении Excel из буфера:", error.message);
        throw error;
    }
}


/**
 * Генерирует файл для редактирования акций.
 * @param {Array} data - Данные для обработки.
 * @returns {Promise<Buffer>} - Буфер сгенерированного файла.
 */
async function generateFileEditingAction(data, fileBuffer) {
    try {
        const templatePath = path.join(__dirname, '..', 'assets/templates', 'regulation_action.xlsm');
        const workbook = await XlsxPopulate.fromFileAsync(templatePath);
        const sheet = workbook.sheet(0);

        const priceMap = await loadPricesFromExcel(fileBuffer);

        for (let index = 0; index < data.length; index++) {
            const item = data[index];
            const rowNumber = index + 2;

            if (!item.offer_id || !item.price?.marketing_price) continue;

            const cleanOfferId = item.offer_id.replace(/\(.*?\)/, '').trim();
            const { valueF, expense, categoryI, percent } = await loadCategoryValuesByOfferId(cleanOfferId);
            const factorPercent = (100 - percent) / 100;

            const price = priceMap.get(item.offer_id);

            sheet.cell(`A${rowNumber}`).value(item.offer_id);
            sheet.cell(`B${rowNumber}`).value(price || '');
            sheet.cell(`C${rowNumber}`).value("");

            sheet.cell(`D${rowNumber}`).formula(
                `(B${rowNumber}*${factorPercent}-${valueF}-${expense})`
            );

            sheet.cell(`E${rowNumber}`).value(item.price.marketing_price);

            sheet.cell(`G${rowNumber}`).formula(
                `IF(F${rowNumber}="", (E${rowNumber}*0.49-${valueF}-${expense}), (F${rowNumber}*0.49-${valueF}-${expense}))`
            );

            sheet.cell(`Q${rowNumber}`).value(categoryI || '');
            sheet.cell("C1").value(`Расх. ${percent}%`);

            // Добавим границы
            applyThinBorderPopulate(sheet, rowNumber);
        }

        return await workbook.outputAsync();
    } catch (error) {
        console.error("Ошибка при создании Excel:", error.message);
        throw error;
    }
}

/**
 * Генерирует файл для редактирования цен.
 * @param {Array} data - Данные для обработки.
 * @param {Object} ws - Рабочий лист Excel.
 * @returns {Promise<Buffer>} - Буфер сгенерированного файла.
 */
async function generatePriceEditing(data, ws) {
    try {
        if (!Array.isArray(data)) {
            throw new Error("Неверный формат данных.");
        }

        // Включаем группировку строк
        ws.properties.outlineLevelRow = 1;

        const articleMap = new Map();

        for (const item of data) {
            if (!item.offer_id || !item.price?.marketing_price) continue;

            const article = item.offer_id.split('(')[0].trim();

            if (!articleMap.has(article)) {
                articleMap.set(article, []);
            }

            articleMap.get(article).push(item);
        }

        let rowNumber = 2;

        for (const [article, items] of articleMap.entries()) {
            // Сортировка размеров по числу в скобках (если есть)
            items.sort((a, b) => {
                const sizeA = parseInt((a.offer_id.match(/\((\d+)\)/) || [])[1], 10);
                const sizeB = parseInt((b.offer_id.match(/\((\d+)\)/) || [])[1], 10);

                if (isNaN(sizeA) || isNaN(sizeB)) return 0;
                return sizeA - sizeB;
            });

            // Получаем цены по размерному ряду
            const prices = items.map(i => i.price.marketing_price);
            const maxPrice = Math.max(...prices);
            const allSamePrice = prices.every(p => p === prices[0]);
            const selectedPrice = allSamePrice ? prices[0] : maxPrice;

            const { valueF, expense, categoryI, percent } = await loadCategoryValuesByOfferId(article);
            const factorPercent = (100 - percent) / 100;

            // Строка с расчётом цены
            ws.getCell(`A${rowNumber}`).value = article;
            ws.getCell(`B${rowNumber}`).value = selectedPrice;
            ws.getCell(`D${rowNumber}`).value = {
                formula: `IF(C${rowNumber}="", (B${rowNumber}*${factorPercent}-${valueF}-${expense}), (C${rowNumber}*${factorPercent}-${valueF}-${expense}))`
            };
            ws.getCell(`K${rowNumber}`).value = categoryI || '';
            ws.getCell(`D1`).value = `Расх. ${percent}%`;

            applyThinBorder(ws, rowNumber, 'price');

            rowNumber++;

            // Строки с остатками
            for (const item of items) {
                let totalStock = 0;
                if (Array.isArray(item.warehouses)) {
                    totalStock = item.warehouses.reduce((sum, stock) => {
                        return sum + (stock.present || 0);
                    }, 0);
                }

                ws.getCell(`A${rowNumber}`).value = item.offer_id;
                ws.getCell(`B${rowNumber}`).value = totalStock;

                // Группировка строки и скрытие
                ws.getRow(rowNumber).outlineLevel = 1;
                ws.getRow(rowNumber).hidden = true;

                applyThinBorder(ws, rowNumber, 'stock');

                rowNumber++;
            }
        }

        return await ws.workbook.xlsx.writeBuffer();
    } catch (error) {
        console.error("Произошла ошибка при формировании файла Excel:", error.message);
        throw error;
    }
}

// Функция для применения тонких границ ко всей строке
function applyThinBorder(ws, row, type = 'price') {
    const columns = type === 'price'
        ? ['A', 'B', 'C', 'D']
        : ['A', 'B'];

    for (const col of columns) {
        const cell = ws.getCell(`${col}${row}`);
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };
    }
}

module.exports = { generateFileEditingAction, generatePriceEditing };