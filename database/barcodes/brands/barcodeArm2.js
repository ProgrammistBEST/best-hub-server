const path = require('path');
const fs = require('fs');
const { PDFDocument, rgb, degrees} = require('pdf-lib');
const { createCanvas } = require('canvas');
const code128 = require('jsbarcode');
const fontkit = require('fontkit');

/**
 * Создает PDF-документ с использованием pdf-lib.
 * @param {string} savePath - Путь для сохранения PDF.
 * @param {string} shoeSize - Размер обуви.
 * @param {string} barcode - Штрих-код.
 * @param {string} article - Артикул.
 * @param {string} color - Цвет.
 * @param {string} standard - Стандарт (ТУ).
 */
async function createPdfArm2(savePath, shoeSize, barcode, article, color, standard, gender) {
    // Создаем новый PDF-документ
    const pdfDoc = await PDFDocument.create();

    // Регистрируем fontkit
    pdfDoc.registerFontkit(fontkit);

    // Добавляем страницу
    const page = pdfDoc.addPage([80 * 72 / 25.4, 58 * 72 / 25.4]);

    // Константы для преобразования миллиметров в точки
    const mmToPoints = 72 / 25.4;

    const fontBytes = fs.readFileSync(path.join(__dirname, "assets", "fonts", "calibri.ttf"));
    const boldFontBytes = fs.readFileSync(path.join(__dirname, "assets", "fonts", "calibri_bold.ttf"));
    const customFont = await pdfDoc.embedFont(fontBytes);
    const customBoldFont = await pdfDoc.embedFont(boldFontBytes);

    // Функция для рисования текста
    const drawText = (text, x, y, size, font = customFont, options = {}) => {
        const textHeight = font.heightAtSize(size);
        page.drawText(text, {
            x: x * mmToPoints,
            y: page.getHeight() - (y * mmToPoints) - textHeight,
            size,
            font,
            ...options
        });
    };

    // Добавляем текстовые поля
    drawText("Дата изготовления", 4, 5, 9, customBoldFont);
    // Дата изготовления
    drawText(new Date().toLocaleDateString(), 4, 9, 9);

    drawText("BEST", 4, 13, 10, customBoldFont);
    drawText("— ИНН 260903823168", 11, 13.2, 9, customFont, { lineHeight: 1 });

    const address = `Россия, Ставропольский край, г. Пятигорск, Скачки 2, Промзона`;

    drawText(address, 4, 17, 8, customFont, {
        maxWidth: 42 * mmToPoints,
        lineHeight: 10, // Уменьшите это значение для меньшего отступа
    });

    drawText(standard, 4, 25, 8, customFont, { maxWidth: 42 * mmToPoints });

    // Добавляем изображения
    const addImage = async (imagePath, x, y, width, height) => {
        if (!fs.existsSync(imagePath)) {
            console.error(`Файл ${path.basename(imagePath)} не найден!`);
            return;
        }
        const imageBytes = fs.readFileSync(imagePath);
        const embeddedImage = await pdfDoc.embedPng(imageBytes);
        page.drawImage(embeddedImage, {
            x: x * mmToPoints,
            y: page.getHeight() - (y * mmToPoints) - height * mmToPoints,
            width: width * mmToPoints,
            height: height * mmToPoints,
        });
    };

    await addImage(path.join(__dirname, "assets", "gost.png"), 32, 6, 8, 6);
    await addImage(path.join(__dirname, "assets", "eac.png"), 41, 6, 8, 6);

    // Добавляем таблицу
    const tableData = {
        "Обувь:": "Артикул:",
        "ARMBEST2": article,
        "Цвет:": color,
        "Размер:": shoeSize,
        "Состав:": "Этиленвинилацетат",
    };
    await drawTable(page, tableData, customFont, customBoldFont);
    
    // Поворачиваем страницу на 90 градусов
    page.setRotation(degrees(90));

    // Добавляем штрих-код
    const barcodeWidth = 53 * mmToPoints;
    const barcodeHeight = 18 * mmToPoints;
    const barcodeX = 70 * mmToPoints; // Координата X штрих-кода
    const barcodeY = 8; // Координата Y штрих-кода
    await addBarcode(pdfDoc, page, barcode, barcodeX, barcodeY, barcodeWidth, barcodeHeight, mmToPoints, customBoldFont);

    // Сохраняем измененный документ
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(savePath, pdfBytes);
}

/**
 * Создает таблицу в PDF.
 * @param {PDFPage} page - Страница PDF.
 * @param {number} mmToPoints - Коэффициент перевода мм в точки.
 * @param {PDFFont} customFont - Обычный шрифт.
 * @param {PDFFont} customBoldFont - Жирный шрифт.
 * @param {string} article - Артикул.
 * @param {string} color - Цвет.
 * @param {string} shoeSize - Размер обуви.
 */
async function drawTable(page, tableData, customFont, customBoldFont) {
    // Константы для таблицы
    const TABLE = {
        X: 11, // Начальная координата X таблицы
        Y: 15, // Начальная координата Y таблицы
        WIDTH: 120, // Ширина таблицы
        HEIGHT: 64, // Высота таблицы
        ROW_HEIGHT: 14, // Высота строки
        COLUMN_WIDTH: 70, // Ширина столбца (половина ширины таблицы)
        TEXT_OFFSET_X: 2, // Отступ текста по X
        VALUE_OFFSET_X: 62, // Отступ для значений по X
        FONT_SIZE: 10, // Размер шрифта
    };

    page.drawRectangle({
        x: TABLE.X,
        y: TABLE.Y,
        width: TABLE.WIDTH,
        height: TABLE.HEIGHT,
        color: rgb(0, 0, 0),
    })

    // Вертикальная линия между столбцами
    page.drawLine({
        start: { x: TABLE.X + TABLE.WIDTH / 2, y: TABLE.Y },
        end: { x: TABLE.X + TABLE.WIDTH / 2, y: TABLE.Y + TABLE.HEIGHT},
        thickness: 1,
        color: rgb(1, 1, 1),
    });

    // Горизонтальные линии
    for (let i = 1; i <= Object.keys(tableData).length - 2; i++) {
        page.drawLine({
            start: { x: TABLE.X, y: TABLE.Y + TABLE.ROW_HEIGHT * i },
            end: { x: TABLE.X + TABLE.WIDTH, y: TABLE.Y + TABLE.ROW_HEIGHT * i},
            thickness: 1,
            color: rgb(1, 1, 1),
        });
    }

    // Добавляем текст
    let currentY = 76; // Начальная позиция Y

    Object.entries(tableData).forEach(([key, value]) => {
    const textColor = rgb(1, 1, 1);

    // Определяем шрифт и размер для ключа
    let keyFont = customBoldFont;
    let keySize = TABLE.FONT_SIZE;

    if (key === "Состав:") {
        keySize = TABLE.FONT_SIZE - 4; // Уменьшаем размер шрифта для "Состав:"
    }

    // Временная переменная для currentY
    let adjustedY = currentY;

    if (key === "Обувь:") {
        adjustedY -= 4; // Уменьшаем Y только для строки "Обувь:"
    }

    // Рисуем ключ
    page.drawText(key, {
        x: TABLE.X + 2,
        y: adjustedY, // Используем adjustedY вместо currentY
        size: TABLE.FONT_SIZE,
        font: customFont,
        color: textColor,
    });

    // Рисуем значение
    page.drawText(value.toString(), {
        x: TABLE.X + TABLE.VALUE_OFFSET_X,
        y: adjustedY, // Используем adjustedY вместо currentY
        size: keySize,
        font: keyFont,
        color: textColor,
    });

    currentY -= TABLE.ROW_HEIGHT; // Переход к следующей строке
});
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
async function addBarcode(pdfDoc, page, barcode, x, y, width, height, mmToPoints, customBoldFont) {
    
    const canvas = createCanvas(width, height);
    code128(canvas, String(barcode), {
        format: "CODE128",
        displayValue: false,
        width: 2,
        height: height,
    });

    const imageBytes = canvas.toBuffer();
    const embeddedImage = await pdfDoc.embedPng(imageBytes);
    page.drawImage(embeddedImage, {
        x,
        y,
        width,
        height,
        rotate: degrees(90),
    });

    // Добавляем текст под штрих-кодом
    const barcodeTextX = x + 5 * mmToPoints; // Отступ над штрих-кодом
    const barcodeTextY = y + 4 * mmToPoints; // Отступ над штрих-кодом
    page.drawText(barcode, {
        x: barcodeTextX,
        y: barcodeTextY,
        size: 20,
        font: customBoldFont,
        color: rgb(0, 0, 0),
        width: width,
        align: "center",
        rotate: degrees(90),
    });
}

module.exports = { createPdfArm2 }