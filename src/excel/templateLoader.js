const exceljs = require('exceljs');
const path = require('path');
const fs = require('fs');

async function loadTemplate(fileName) {
    // Формируем абсолютный путь к файлу шаблона
    const templatesDir = path.join(__dirname, '../assets', 'templates'); // Папка с шаблонами
    const filePath = path.join(templatesDir, fileName); // Полный путь с именем файла

    // Проверяем существование файла
    if (!fs.existsSync(filePath)) {
        throw new Error(`Файл шаблона ${fileName} не найден по пути: ${filePath}`);
    }

    // Загружаем файл Excel
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile(filePath);

    // Возвращаем первую страницу (worksheet)
    return workbook.getWorksheet(1);
}

module.exports = { loadTemplate };