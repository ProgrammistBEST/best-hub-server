const path = require('path');
const { getApi } = require(path.join(__dirname, '../database/api/apiCRUD'));
const { getDataFromWbCards } = require(path.join(__dirname, '../services/getData/getDataFromWBCards'));
const { filterDataCardsWB } = require(path.join(__dirname, '../utils/filterData'));
const { convertDataToPdf } = require('../database/barcodes/utils/barcodeUtils');
const { createPdfArm2 } = require('../database/barcodes/brands/arm2');
const { createPdfArmbest } = require('../database/barcodes/brands/barcodeArmbest');
const { createPdfBest26 } = require('../database/barcodes/brands/best26');
const { createPdfBestShoes } = require('../database/barcodes/brands/bestshoes');

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
        const { brand, platform, apiCategory, dirName, models } = req.body;

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

        // Генерация штрих-кодов
        await convertDataToPdf(filterData, dirName, brand, brandParams.tuSummerBig, brandParams.tuSummerSmall, brandParams.function);

        // Ответ клиенту
        res.status(200).json({ message: 'Штрих-коды успешно созданы' });
    } catch (error) {
        console.error('Ошибка при выполнении', error.message);
        res.status(500).json({ error: error.message });
    }
};