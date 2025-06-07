const path = require('path');
const fs = require('fs');
const getApi = require(path.join(__dirname, './database/api/apiCRUD'));
const getDataFromWb = require(path.join(__dirname, '../general'));

// Главная функция для обработки данных Wildberries
async function getDataFromWbARM2() {
    try {
        // Входные данные
        const headers = await getApi(17, 'Arm2', 'WB'); // Получаем токен
        if (!headers) {
            console.error('Не удалось получить токен из базы данных');
            return;
        }

        const tuSummerSmall = "ТУ 15.20.11-002-0103228292-2022"; // ТУ для маленьких размеров
        const tuSummerBig = "ТУ 15.20.11-001-0188541950-2022";   // ТУ для больших размеров

        // Путь для сохранения файлов
        const saveCatalogue = path.join(__dirname, '../ready');

        // Получаем данные из Wildberries
        const data = await getDataFromWb(headers);
        if (!data || data.length === 0) {
            console.error('Данные отсутствуют или не были получены');
            return;
        }

        // Конвертируем данные в PDF
        convertDataToPdfARM2(data, saveCatalogue, tuSummerBig, tuSummerSmall);
    } catch (error) {
        console.error('Ошибка при выполнении:', error.message);
    }
}

// Запускаем процесс
getDataFromWbARM2();

/**
 * Конвертирует данные в PDF-файлы.
 * @param {Array} models - Массив карточек с данными.
 * @param {string} saveCatalogue - Путь для сохранения файлов.
 * @param {string} tuSummerBig - ТУ для больших размеров.
 * @param {string} tuSummerSmall - ТУ для маленьких размеров.
 */
// Функция для получения генерального артикула
function getGeneralArticle(code) {
    // Используем регулярное выражение для извлечения первой числовой части
    const match = code.match(/^\d+/);
    return match ? match[0] : ''; // Возвращаем найденную числовую часть или пустую строку
}

function convertDataToPdfARM2(models, saveCatalogue, tuSummerBig, tuSummerSmall) {
    models.forEach((card) => {
        const { article, color, sizes } = card;

        // Создаем папку для бренда
        const brandDir = path.join(saveCatalogue, 'ARM2');
        if (!fs.existsSync(brandDir)) {
            fs.mkdirSync(brandDir, { recursive: true });
        }
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
            createPdf(pdfFilePath, techSize, sku, article, color, standard);
        });
    });
}

/**
 * Создает PDF-документ.
 * @param {string} savePath - Путь для сохранения PDF.
 * @param {string} shoeSize - Размер обуви.
 * @param {string} barcode - Штрих-код.
 * @param {string} article - Артикул.
 * @param {string} color - Цвет.
 * @param {string} standard - Стандарт (ТУ).
 */
function createPdf(savePath, shoeSize, barcode, article, color, standard) {
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ size: [58 * 72 / 25.4, 80 * 72 / 25.4] }); // Размер в мм
    doc.pipe(fs.createWriteStream(savePath));

    // Константы для преобразования миллиметров в точки
    const mmToPoints = 72 / 25.4;

    // Регистрация шрифтов
    const fontPath = path.join(__dirname, "assets", "fonts", "calibri.ttf");
    if (!fs.existsSync(fontPath)) {
        console.error("Шрифт DejaVuSans не найден!");
        return;
    }
    doc.registerFont('DejaVuSans', fontPath);
    doc.registerFont('DejaVuSans-Bold', path.join(__dirname, "assets", "fonts", "calibri_bold.ttf"));

    // Поворот документа
    doc.rotate(90, { origin: [0, 0] });

    // Текстовые поля
    doc.font('DejaVuSans-Bold').fontSize(8).text("Дата изготовления", 4 * mmToPoints, -53 * mmToPoints);
    doc.text(new Date().toLocaleDateString(), 4 * mmToPoints, -50 * mmToPoints);

    doc.font('DejaVuSans-Bold').fontSize(12).text("BEST", 4 * mmToPoints, -46 * mmToPoints);
    doc.font('DejaVuSans').fontSize(8).text("— ИНН 260903823168", 13 * mmToPoints, -45.5 * mmToPoints, { lineBreak: false });

    // Адрес производства
    const address = `Россия, Ставропольский край,\nг. Пятигорск, Скачки 2, Промзона`;
    doc.font('DejaVuSans').fontSize(8).text(address.trim(), 4 * mmToPoints, -42 * mmToPoints, {
        width: 40 * mmToPoints,
        align: "left",
    });

    // Добавление стандарта (ТУ)
    doc.font('DejaVuSans-Bold').fontSize(8);
    doc.text(`${standard}`, 4 * mmToPoints, -35 * mmToPoints, {
        width: 60 * mmToPoints, // Ограничиваем ширину текста
        align: "left",         // Выравнивание текста
    });
    // Добавление изображений
    const imagePaths = {
        gost: path.join(__dirname, "assets", "gost.png"),
        eac: path.join(__dirname, "assets", "eac.png"),
    };
    
    // Проверяем существование файлов
    if (fs.existsSync(imagePaths.gost)) {
        doc.image(imagePaths.gost, 28 * mmToPoints, -54 * mmToPoints, { width: 8 * mmToPoints, height: 6 * mmToPoints });
    } else {
        console.error("Файл gost.png не найден!");
    }

    if (fs.existsSync(imagePaths.eac)) {
        doc.image(imagePaths.eac, 37 * mmToPoints, -54 * mmToPoints, { width: 8 * mmToPoints, height: 6 * mmToPoints });
    } else {
        console.error("Файл eac.png не найден!");
    }
    // Создание таблицы
    createTable(doc, mmToPoints, article, color, shoeSize);

    // Добавление штрих-кода
    doc.save(); // Сохраняем текущее состояние документа
    doc.rotate(270, { origin: [2, -2] }); // Поворачиваем вокруг точки (x, y)
    const barcodeWidth = 53 * mmToPoints; // Ширина штрих-кода
    const barcodeHeight = 18 * mmToPoints; // Высота штрих-кода
    const barcodeX = (doc.page.width - barcodeWidth) / 2; // Центрируем по ширине
    const barcodeY = 52 * mmToPoints; // Отступ сверху

    addBarcode(doc, barcode, barcodeX, barcodeY, barcodeWidth, barcodeHeight);
    doc.restore(); // Восстанавливаем исходное состояние

    // Добавление текста баркода
    doc.save(); // Сохраняем текущее состояние документа
    doc.rotate(270, { origin: [45 * mmToPoints, -30 * mmToPoints] }); // Поворачиваем вокруг точки
    doc.fontSize(21).text(barcode, 17.5 * mmToPoints, -5 * mmToPoints, {
        width: barcodeWidth, // Задаем ширину текста
        align: "center",     // Выравниваем текст по центру
    });

    // Завершение документа
    doc.end();
}

/**
 * Создает таблицу в PDF.
 * @param {PDFDocument} doc - Экземпляр PDFKit.
 * @param {number} mmToPoints - Коэффициент перевода мм в точки.
 * @param {string} article - Артикул.
 * @param {string} color - Цвет.
 * @param {string} shoeSize - Размер обуви.
 */
function createTable(doc, mmToPoints, article, color, shoeSize) {
    const tableX = 4 * mmToPoints;
    const tableY = -31 * mmToPoints;
    const tableWidth = 49 * mmToPoints;
    const tableHeight = 29 * mmToPoints;
    const rows = 4;
    const cols = 2;

    // Рисуем черный прямоугольник
    doc.rect(tableX, tableY, tableWidth, tableHeight).fill("#000000");

    // Заполняем таблицу белым текстом
    doc.fillColor("#FFFFFF").font('DejaVuSans');
    const rowHeight = tableHeight / rows;
    const colWidth = tableWidth / cols;

    const tableData = [
        [`Обувь\nARMBEST2`, `Артикул:\n${article}`],
        ["Цвет:", color],
        ["Размер:", shoeSize],
        ["Состав:", "Этиленовацитат"],
    ];

    // Рисуем вертикальную полосу между столбцами
    const columnSeparatorX = tableX + colWidth;
    doc.moveTo(columnSeparatorX - 5, tableY + 83 + 80)
        .lineTo(columnSeparatorX - 5, tableY - tableHeight + 80)
        .stroke("#FFFFFF");

    // Рисуем границы между строками
    for (let i = 1; i < rows; i++) {
        const y = tableY + i * rowHeight;
        doc.moveTo(tableX, y)
            .lineTo(tableX + tableWidth, y)
            .stroke("#FFFFFF");
    }
    tableData.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const x = tableX + colIndex * colWidth + 2; // Отступ от края
            const y = tableY + rowIndex * rowHeight + (rowIndex > 0 ? 2 : 1); // Отступ сверху
            const cellContent = cell.split("\n"); // Разделяем текст по переносам строк

            // Устанавливаем размер шрифта
            const fontSize = cell.length >= 14 ? 9 : 11;

            // Выводим текст
            doc.fontSize(fontSize).font('DejaVuSans-Bold');
            cellContent.forEach((line, index) => {
                const lineY = y + 2 + index * 3 * mmToPoints;
                doc.text(line, x, lineY, { width: colWidth - 4, align: "left" });
            });
        });
    });

    // Восстанавливаем цвет текста
    doc.fillColor("#000000");
}

/**
 * Добавляет штрих-код в PDF.
 * @param {PDFDocument} doc - Экземпляр PDFKit.
 * @param {number} mmToPoints - Коэффициент перевода мм в точки.
 * @param {string} barcode - Штрих-код.
 */
function addBarcode(doc, barcode, x, y, width, height) {
    const { createCanvas } = require('canvas');
    const code128 = require('jsbarcode');
    const Canvas = createCanvas(width, height); // Создаем холст заданного размера

    try {
        // Генерация штрих-кода
        code128(Canvas, String(barcode), {
            format: "CODE128",
            displayValue: false,
            width: 2, // Ширина линий
            height: height, // Высота штрих-кода
        });

        // Преобразуем холст в буфер изображения
        const image = Canvas.toBuffer();
        doc.image(image, x, y, { width, height }); // Добавляем изображение в PDF
    } catch (error) {
        console.error(`Ошибка при генерации штрих-кода для баркода ${barcode}:`, error.message);
    }
}