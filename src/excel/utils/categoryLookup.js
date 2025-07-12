const exceljs = require('exceljs');
const path = require('path');
const fs = require('fs');

async function loadCategoryValuesByOfferId(offerIdRaw) {
    const offerId = offerIdRaw.replace(/\(.*?\)/, '').trim();
    const filePath = path.join(__dirname, '../../assets/categories.xlsx');

    // Проверяем существование файла
    if (!fs.existsSync(filePath)) {
        return { valueF: 50, expense: 100, categoryI: '',percent: 25 };
    }

    const workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile(filePath);
    const sheet = workbook.getWorksheet(1);

    // Получаем значение процента из ячейки Q4
    const percentCell = sheet.getCell('Q4').value;
    let percent = typeof percentCell === "number" ? percentCell : parseFloat(percentCell);
    if (isNaN(percent)) {
        percent = 10
    }

    // Проходим по строкам таблицы, начиная со второй строки (пропускаем заголовки)
    for (let row of sheet.getRows(2, sheet.rowCount - 1) || []) {
        const cellValue = String(row.getCell('A').value || '').trim();
        if (cellValue === offerId) {
            const valueF = row.getCell('F').value || 0;
            const expenseCell = row.getCell('C').value || 0;
            const expense = typeof expenseCell === "object" && expenseCell.result !== undefined ? expenseCell.result : expenseCell;
            const categoryI = row.getCell('I').value || '';
            return { valueF, expense, categoryI: categoryI.result, percent };
        }
    }

    // Если offerId не найден, возвращаем значения по умолчанию
    return { valueF: 50, expense: 100, categoryI: '', percent: 25 };
}

module.exports = { loadCategoryValuesByOfferId };