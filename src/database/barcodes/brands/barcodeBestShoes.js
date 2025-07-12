const path = require('path');
const fs = require('fs');
const { PDFDocument, rgb } = require('pdf-lib');
const { createCanvas } = require('canvas');
const JsBarcode = require('jsbarcode');
const fontkit = require('fontkit');;
const { addBarcode } = require('../utils/barcodeUtils');

async function barcodeBestShoes(data, dirName) {
    const tuSummerSmall = "ТУ 15.20.11-001-0138568596-2022"; // ТУ для маленьких размеров
    const tuSummerBig = "ТУ 15.20.11-001-304263209000021-2018";   // ТУ для больших размеров
    convertDataToPdfBestShoes(data, dirName, tuSummerBig, tuSummerSmall);
}

async function createPdfBestShoes(savePath, shoeSize, barcode, article, color, standard, gender) {
    // Создаем новый PDF-документ
    const pdfDoc = await PDFDocument.create();

    // Регистрируем fontkit
    pdfDoc.registerFontkit(fontkit);

    // Добавляем страницу
    const page = pdfDoc.addPage([62 * 72 / 25.4, 80 * 72 / 25.4]); // Размер в мм

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
            ...options,
        });
    };

    // Добавляем текстовые поля
    drawText(`Обувь ${gender}`, 12, 24, 16, customBoldFont);

    // Добавляем штрих-код
    const barcodeWidth = 54 * mmToPoints;
    const barcodeHeight = 19 * mmToPoints;
    const barcodeX = 5;
    const barcodeY = 162; // Координата Y штрих-кода
    await addBarcode(pdfDoc, page, barcode, barcodeX, barcodeY, barcodeWidth, barcodeHeight);
    
    // Добавляем таблицу
    const tableData = {
        "Артикул:": article,
        "Цвет:": color,
        "Размер:": shoeSize,
        "Состав:": "Этиленвинилацетат",
    };
    await drawTable(page, tableData, customFont, customBoldFont);
    
    drawText("BEST", 5, 51, 10, customBoldFont);
    drawText("— ИНН 260901997440", 13, 51.2, 9, customFont, { lineHeight: 1 });

    const address = `Россия, Ставропольский край,
г. Пятигорск, Скачки 2, Промзона`;
    drawText(address, 5, 55, 9, customFont, {
        maxWidth: 48 * mmToPoints,
        lineHeight: 10, // Уменьшите это значение для меньшего отступа
    });

    drawText(standard, 5, 63, 8, customFont, { maxWidth: 48 * mmToPoints });

    // Добавляем текстовые поля
    drawText("Дата изготовления", 5, 67, 9, customBoldFont);
    // Дата изготовления
    drawText(new Date().toLocaleDateString(), 5, 71, 9);

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
    
    await addImage(path.join(__dirname, "assets", "gost.png"), 33, 67.6, 8, 8);
    await addImage(path.join(__dirname, "assets", "eac.png"), 43, 67, 11, 9);
    
    // Сохраняем документ
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(savePath, pdfBytes);
}

async function drawTable(page, tableData, customFont, customBoldFont) {
    // Константы для таблицы
    const TABLE = {
        X: 15.8, // Начальная координата X таблицы
        Y: 67, // Начальная координата Y таблицы
        WIDTH: 140, // Ширина таблицы
        HEIGHT: 68, // Высота таблицы
        ROW_HEIGHT: 14, // Высота строки
        COLUMN_WIDTH: 70, // Ширина столбца (половина ширины таблицы)
        TEXT_OFFSET_X: 2, // Отступ текста по X
        VALUE_OFFSET_X: 55.5, // Отступ для значений по X
        FONT_SIZE: 10, // Размер шрифта
    };

    page.drawRectangle({
        x: TABLE.X,
        y: TABLE.Y + TABLE.ROW_HEIGHT,
        width: TABLE.WIDTH,
        height: TABLE.HEIGHT - TABLE.ROW_HEIGHT,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
    })

    // Вертикальная линия между столбцами
    page.drawLine({
        start: { x: TABLE.COLUMN_WIDTH, y: TABLE.Y + TABLE.ROW_HEIGHT },
        end: { x: TABLE.COLUMN_WIDTH, y: TABLE.Y + 68 },
        thickness: 1,
        color: rgb(0, 0, 0),
    });

    // Горизонтальные линии
    for (let i = 0; i <= Object.keys(tableData).length - 2; i++) {
        page.drawLine({
            start: { x: TABLE.X, y: 95 + TABLE.ROW_HEIGHT * i},
            end: { x: 156, y: 95 + TABLE.ROW_HEIGHT * i},
            thickness: 1,
            color: rgb(0, 0, 0),
        });
    }

    // Добавляем текст
    let currentY = 126; // Начальная позиция Y

    Object.entries(tableData).forEach(([key, value]) => {
        // Рисуем черный фон для заголовка и артикула
        const textColor =rgb(0, 0, 0);
            page.drawText(key, {
                x: TABLE.X + 2,
                y: currentY,
                size: TABLE.FONT_SIZE,
                font: customBoldFont,
                color: textColor,
            });

            page.drawText(value.toString(), {
                x: TABLE.X + TABLE.VALUE_OFFSET_X,
                y: currentY,
                size: TABLE.FONT_SIZE,
                font: customFont,
                color: textColor,
            });

        currentY -= TABLE.ROW_HEIGHT; // Переход к следующей строке
    });
}

module.exports = { createPdfBestShoes }