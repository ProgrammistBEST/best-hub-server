const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const tmp = require('tmp');
const { getApi } = require(path.join(__dirname, '../database/api/apiCRUD'));
const { getDataFromWbCards } = require(path.join(__dirname, '../services/getData/getDataFromWBCards'));
const { filterDataCardsWB } = require(path.join(__dirname, '../utils/filterData'));
const { convertDataToPdf } = require('../database/barcodes/utils/barcodeUtils');
const { createPdfArm2 } = require('../database/barcodes/brands/barcodeArm2');
const { createPdfArmbest } = require('../database/barcodes/brands/barcodeArmbest');
const { createPdfBest26 } = require('../database/barcodes/brands/barcodeBest26');
const { createPdfBestShoes } = require('../database/barcodes/brands/barcodeBestShoes');

// Маппинг брендов
const brandMapping = {
    ARM2: {
        function: createPdfArm2,
        tuSummerSmall: "ТУ 15.20.11-002-0103228292-2022",
        tuSummerBig: "ТУ 15.20.11-001-0188541950-2022",
    },
    ARMBEST: {
        function: createPdfArmbest,
        tuSummerSmall: "ТУ 15.20.11-002-0103228292-2022",
        tuSummerBig: "ТУ 15.20.11-001-0188541950-2022",
    },
    BESTSHOES: {
        function: createPdfBestShoes,
        tuSummerSmall: "ТУ 15.20.11-001-0138568596-2022",
        tuSummerBig: "ТУ 15.20.11-001-304263209000021-2018",
    },
    BEST26: {
        function: createPdfBest26,
        tuSummerSmall: "ТУ 15.20.11-001-0138568596-2022",
        tuSummerBig: "ТУ 15.20.11-001-304263209000021-2018",
    },
};

// Универсальный обработчик для всех брендов
exports.createBarcodeHandler = async (req, res) => {
    try {
        const { brand, platform, apiCategory, models } = req.body;

        // Проверка входных данных
        if (!brand || !platform || !apiCategory || !models) {
            return res.status(400).json({ error: 'Ошибка введенных данных. Не полные необходимые данные' });
        }

        // Получение параметров бренда
        const brandParams = brandMapping[brand.toUpperCase()];
        if (!brandParams) {
            return res.status(400).json({ error: `Бренд ${brand} не поддерживается` });
        }

        // Получение токена
        const token = await getApi(brand, platform, apiCategory);
        if (!token) {
            return res.status(500).json({ error: 'Ошибка получения токена по API' });
        }

        console.log("Запрос прошел");

        // Получение данных карточек
        const data = await getDataFromWbCards(token);
        if (!Array.isArray(data) || data.length === 0) {
            return res.status(500).json({ error: 'Ошибка получения данных моделей' });
        }

        // Фильтрация данных
        const filterData = await filterDataCardsWB(data, models);
        console.log(filterData);
        
        // Создаем временную директорию
        const tempDir = tmp.dirSync({ unsafeCleanup: true }).name;

        // Генерация штрих-кодов
        const pdfFiles = await convertDataToPdf(filterData, tempDir, brand, brandParams.tuSummerBig, brandParams.tuSummerSmall, brandParams.function);

        // Создание архива
        const archive = archiver('zip', {
            zlib: { level: 9 }, // Уровень сжатия
        });

        // Устанавливаем заголовки для отправки архива
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename=barcodes.zip');

        // Отправляем архив клиенту
        archive.pipe(res);

        // Добавляем файлы в архив с сохранением структуры папок
        pdfFiles.forEach((filePath) => {
            const relativePath = path.relative(tempDir, filePath); // Относительный путь внутри архива
            archive.file(filePath, { name: relativePath });
        });

        // Завершаем архивирование
        archive.finalize();

        // Очищаем временную директорию после завершения
        archive.on('end', () => {
            tmp.setGracefulCleanup();
        });
    } catch (error) {
        console.error('Ошибка при выполнении', error.message);
        res.status(500).json({ error: error.message });
    }
};