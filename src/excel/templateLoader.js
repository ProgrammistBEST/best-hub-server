const exceljs = require('exceljs');
const path = require('path');
const fs = require('fs');

async function loadTemplate(fileName) {
    const filePath = "C:\\Users\\prog\\Desktop\\Programs\\best-hub-server\\src\\assets\\tamplates\\template_price.xlsm"
    if (!fs.existsSync(filePath)) {
        throw new Error(`Файл шаблона ${fileName} не найден`);
    }
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile(filePath);
    return workbook.getWorksheet(1);
}

module.exports = { loadTemplate };
