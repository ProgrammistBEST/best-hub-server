const path = require('path');
const fs = require('fs');
const { PDFDocument, rgb, degrees } = require('pdf-lib');
const { createCanvas } = require('canvas');
const JsBarcode = require('jsbarcode');
const fontkit = require('fontkit');

async function createPdfBest26(savePath, shoeSize, barcode, article, color, standard, gender) {
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

    page.drawRectangle({
        x: 1 * mmToPoints,
        y: 1 * mmToPoints,
        width: 78 * mmToPoints,
        height: 56 * mmToPoints,
        borderColor: rgb(0, 0, 0),
        borderWidth: 4,
    })

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

    drawText("BEST", 4, 13, 9, customBoldFont);
    drawText("— ИНН 263217056625", 11, 13.2, 8, customFont, { lineHeight: 1 });

    const address = `Россия, Ставропольский край, г. Пятигорск, Скачки 2, Промзона`;

    drawText(address, 4, 17, 9, customFont, {
        maxWidth: 34 * mmToPoints,
        lineHeight: 10, // Уменьшите это значение для меньшего отступа
    });

    drawText(standard, 4, 29, 6, customFont, { maxWidth: 44 * mmToPoints });

    // Добавляем таблицу
    drawText(`Обувь ${gender}`, 43, 5, 14, customBoldFont);
    const tableData = {
        "Артикул:": article,
        "Цвет:": color,
        "Размер:": shoeSize,
        "Состав:": "Этиленвинилацетат",
    };
    await drawTable(page, tableData, customFont, customBoldFont);

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
    await addImage(path.join(__dirname, "assets", "gost.png"), 5, 35.6, 11, 9);
    await addImage(path.join(__dirname, "assets", "eac.png"), 5, 45, 11, 9);

    // Добавляем штрих-код
    const barcodeWidth = 62 * mmToPoints;
    const barcodeHeight = 22 * mmToPoints;
    const barcodeX = 45;
    const barcodeY = 7; // Координата Y штрих-кода
    await addBarcode(pdfDoc, page, barcode, barcodeX, barcodeY, barcodeWidth, barcodeHeight);
    

    // Сохраняем документ
    let pdfBytes = await pdfDoc.save();

    // Поворачиваем страницу на 90 градусов
    const rotatedPdfDoc = await PDFDocument.load(pdfBytes);
    const pages = rotatedPdfDoc.getPages();
    pages.forEach(page => {
        page.setRotation(degrees(90)); // Поворачиваем страницу на 90 градусов
    });

    // Сохраняем измененный документ
    pdfBytes = await rotatedPdfDoc.save();
    fs.writeFileSync(savePath, pdfBytes);
}

async function drawTable(page, tableData, customFont, customBoldFont) {
    // Константы для таблицы
    const TABLE = {
        X: 120, // Начальная координата X таблицы
        Y: 77, // Начальная координата Y таблицы
        WIDTH: 100, // Ширина таблицы
        HEIGHT: 54, // Высота таблицы
        ROW_HEIGHT: 14, // Высота строки
        COLUMN_WIDTH: 70, // Ширина столбца (половина ширины таблицы)
        TEXT_OFFSET_X: 2, // Отступ текста по X
        VALUE_OFFSET_X: 42, // Отступ для значений по X
        FONT_SIZE: 8, // Размер шрифта
    };

    page.drawRectangle({
        x: TABLE.X,
        y: TABLE.Y,
        width: TABLE.WIDTH,
        height: TABLE.HEIGHT,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
    })

    // Вертикальная линия между столбцами
    page.drawLine({
        start: { x: TABLE.X + TABLE.X / 3, y: TABLE.Y },
        end: { x: TABLE.X + TABLE.X / 3, y: TABLE.Y + TABLE.HEIGHT},
        thickness: 1,
        color: rgb(0, 0, 0),
    });

    // Горизонтальные линии
    for (let i = 1; i <= Object.keys(tableData).length - 1; i++) {
        page.drawLine({
            start: { x: TABLE.X, y: TABLE.Y + TABLE.ROW_HEIGHT * i },
            end: { x: TABLE.X + TABLE.WIDTH, y: TABLE.Y + TABLE.ROW_HEIGHT * i},
            thickness: 1,
            color: rgb(0, 0, 0),
        });
    }

    // Добавляем текст
    let currentY = 122; // Начальная позиция Y

    Object.entries(tableData).forEach(([key, value]) => {
        const textColor = rgb(0, 0, 0);

        // Определяем шрифт и размер для ключа
        let keyFont = customFont;
        let keySize = TABLE.FONT_SIZE;

        if (key === "Артикул:" || key === "Размер:") {
            keyFont = customBoldFont; // Жирный шрифт для "Артикул:" и "Размер:"
            keySize = TABLE.FONT_SIZE + 4; // Жирный шрифт для "Артикул:" и "Размер:"
        }

        if (key === "Состав:") {
            keySize = TABLE.FONT_SIZE - 2; // Уменьшаем размер шрифта для "Состав:"
        }

        // Рисуем ключ
        page.drawText(key, {
            x: TABLE.X + 2,
            y: currentY,
            size: TABLE.FONT_SIZE,
            font: customFont,
            color: textColor,
        });

        // Рисуем значение
        page.drawText(value.toString(), {
            x: TABLE.X + TABLE.VALUE_OFFSET_X,
            y: currentY,
            size: keySize,
            font: keyFont,
            color: textColor,
        });

        currentY -= TABLE.ROW_HEIGHT; // Переход к следующей строке
    });
}

module.exports = { createPdfBest26 }