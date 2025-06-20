const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const { createCanvas } = require('canvas');
const JsBarcode = require('jsbarcode');

/**
 * Конвертирует данные в PDF-файлы.
 * @param {Array} models - Массив карточек с данными.
 * @param {string} saveCatalogue - Путь для сохранения файлов.
 * @param {string} brandName - Название бренда.
 * @param {string} tuSummerBig - ТУ для больших размеров.
 * @param {string} tuSummerSmall - ТУ для маленьких размеров.
 * @param {Function} createPdf - Функция для создания PDF.
 */
function convertDataToPdf(models, saveCatalogue, brandName, tuSummerBig, tuSummerSmall, createPdf) {
    models.forEach((card) => {
        const { article, color, sizes, gender } = card;

        // Создаем папку для бренда
        const brandDir = path.join(saveCatalogue, brandName);
        if (!fs.existsSync(brandDir)) {
            fs.mkdirSync(brandDir, { recursive: true });
        }

        // Создаем папку для генерального артикула
        const modelDir = path.join(brandDir, getGeneralArticle(article));
        if (!fs.existsSync(modelDir)) {
            fs.mkdirSync(modelDir, { recursive: true });
        }

        // Создаем папку для артикула и цвета
        const modelDirColor = path.join(modelDir, `${article}_${color}`);
        if (!fs.existsSync(modelDirColor)) {
            fs.mkdirSync(modelDirColor, { recursive: true });
        }

        // Создаем PDF для каждого размера
        sizes.forEach(({ techSize, sku }) => {
            const pdfFileName = `${techSize}.pdf`;
            const pdfFilePath = path.join(modelDirColor, pdfFileName);

            // Определяем стандарт (ТУ) в зависимости от размера
            const standard = parseInt(techSize.split("-").pop()) < 36 ? tuSummerSmall : tuSummerBig;

            // Создаем PDF
            createPdf(pdfFilePath, techSize, sku, article, color, standard, gender);
        });
    });
}

/**
 * Функция для получения генерального артикула.
 * @param {string} code - Артикул.
 * @returns {string} - Генеральный артикул.
 */
function getGeneralArticle(code) {
    const match = code.match(/^\d+/);
    return match ? match[0] : '';
}

/**
 * Добавляет штрих-код в PDF.
 * @param {PDFDocument} pdfDoc - Экземпляр PDFDocument.
 * @param {PDFPage} page - Страница PDF.
 * @param {string} barcode - Штрих-код.
 * @param {number} x - Координата X.
 * @param {number} y - Координата Y.
 * @param {number} width - Ширина штрих-кода.
 * @param {number} height - Высота штрих-кода.
 */
async function addBarcode(pdfDoc, page, barcode, x, y, width, height) {
    const canvas = createCanvas(width, height);
    JsBarcode(canvas, String(barcode), {
        format: "EAN13",
        displayValue: true,
        fontOptions: "bold",
    });

    const imageBytes = canvas.toBuffer();
    const embeddedImage = await pdfDoc.embedPng(imageBytes);
    page.drawImage(embeddedImage, {
        x,
        y,
        width,
        height,
    });
}


module.exports = {
    convertDataToPdf,
    addBarcode,
};