const path = require('path');
const fs = require('fs');
const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('fontkit');
const { addBarcode } = require('../utils/barcodeUtils');

async function createPdfArmbest(savePath, shoeSize, barcode, article, color, standard, gender) {
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
    drawText("Дата изготовления", 5, 6, 9, customBoldFont);
    // Дата изготовления
    drawText(new Date().toLocaleDateString(), 5, 10, 9);

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

    await addImage(path.join(__dirname, "assets", "gost.png"), 33, 6.6, 8, 8);
    await addImage(path.join(__dirname, "assets", "eac.png"), 43, 6, 11, 9);

    drawText("BEST", 5, 15, 10, customBoldFont);
    drawText("— ИНН 260905925856", 13, 15.2, 9, customFont, { lineHeight: 1 });

    const address = `Россия, Ставропольский край,
г. Пятигорск, Скачки 2, Промзона`;

    drawText(address, 5, 19, 9, customFont, {
        maxWidth: 48 * mmToPoints,
        lineHeight: 10, // Уменьшите это значение для меньшего отступа
    });

    drawText(standard, 5, 26, 8, customFont, { maxWidth: 48 * mmToPoints });
    
    // Добавляем таблицу
    const shoesGender = `Обувь ${gender}`
    const tableData = {
        "Артикул:": article,
        "Цвет:": color,
        "Размер:": shoeSize,
        "Состав:": "Этиленвинилацетат",
    };
    await drawTable(page, tableData, customFont, customBoldFont, shoesGender);

    // Добавляем штрих-код
    const barcodeWidth = 54 * mmToPoints;
    const barcodeHeight = 19 * mmToPoints;
    const barcodeX = 7;
    const barcodeY = 10; // Координата Y штрих-кода
    await addBarcode(pdfDoc, page, barcode, barcodeX, barcodeY, barcodeWidth, barcodeHeight);
    
    // Сохраняем документ
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(savePath, pdfBytes);
}

async function drawTable(page, tableData, customFont, customBoldFont, shoesGender) {
    const rowHeight = 14

    page.drawRectangle({
        x: 15.8,
        y: 67,
        width: 140,
        height: 76,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
    })

    // Вертикальная линия между столбцами
    page.drawLine({
        start: { x: 70, y: 67 },
        end: { x: 70, y: 67 + 76 },
        thickness: 1,
        color: rgb(0, 0, 0),
    });

    // Горизонтальные линии
    for (let i = 0; i <= Object.keys(tableData).length - 2; i++) {
        page.drawLine({
            start: { x: 15.8, y: 67 + rowHeight * i},
            end: { x: 156, y: 67 + rowHeight * i},
            thickness: 1,
            color: rgb(0, 0, 0),
        });
    }

    // Добавляем текст
    let currentY = 112; // Начальная позиция Y

    page.drawRectangle({
        x: 15.6, // Левая граница таблицы
        y: 121 - rowHeight + 2, // Нижняя граница строки
        width: 140, // Ширина таблицы
        height: (rowHeight + 3.3) * 2, // Высота строки
        color: rgb(0, 0, 0), // Черный цвет фона
    });

    page.drawText(shoesGender.toString(), {
        x: 30,
        y: 128,
        size: 16,
        font: customBoldFont,
        color: rgb(1, 1, 1),
    });
    Object.entries(tableData).forEach(([key, value]) => {
        // Рисуем черный фон для заголовка и артикула
        let textColor
        let font
        let size
        if (key === "Артикул:") {
            font = customBoldFont
            size = 12
            // Цвет текста для этих строк будет белым
            textColor = rgb(1, 1, 1); // Белый цвет
        } else {
            font = customFont
            size = 10
            // Для остальных строк цвет текста будет черным
            textColor = rgb(0, 0, 0); // Черный цвет
        }
        page.drawText(key, {
            x: 15.8 + 2,
            y: currentY,
            size: size,
            font: font,
            color: textColor,
        });

        page.drawText(value.toString(), {
            x: 15.8 + 55.5,
            y: currentY,
            size: size,
            font: font,
            color: textColor,
        });

        currentY -= rowHeight; // Переход к следующей строке
    });
}

module.exports = { createPdfArmbest }