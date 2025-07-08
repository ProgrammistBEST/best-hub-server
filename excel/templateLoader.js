const exceljs = require('exceljs');
const path = require('path');
const fs = require('fs');

async function loadTemplate(fileName) {
    const filePath = path.join(__dirname, '../../assets/templates', fileName);
    if (!fs.existsSync(filePath)) {
        throw new Error(`Файл шаблона ${fileName} не найден`);
    }
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile(filePath);
    return workbook.getWorksheet(1);
}

module.exports = { loadTemplate };
