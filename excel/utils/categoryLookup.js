const exceljs = require('exceljs');
const path = require('path');
const fs = require('fs');

async function loadCategoryValuesByOfferId(offerIdRaw) {
    const offerId = offerIdRaw.replace(/\(.*?\)/, '').trim();
    const filePath = path.join(__dirname, '../../../assets/data/categories.xlsx');

    if (!fs.existsSync(filePath)) return { valueF: 50, expense: 100 };

    const workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile(filePath);
    const sheet = workbook.getWorksheet(1);

    for (let row of sheet._rows.slice(1)) {
        const cellValue = String(row.getCell('A').value).trim();
        if (cellValue === offerId) {
            const valueF = row.getCell('F').value || 0;
            const expense = row.getCell('C').value || 0;
            return { valueF, expense };
        }
    }

    return { valueF: 50, expense: 100 };
}

module.exports = { loadCategoryValuesByOfferId };
