const path = require('path');
const { getAllModels, createModelsWithWB, getModelById, createModel, updateModelById } = require(path.join(__dirname, '../database/models/modelCRUD'));
const { getApi } = require(path.join(__dirname, '../database/api/apiCRUD'));
const { getDataFromWbCards } = require(path.join(__dirname, '../services/getData/getDataFromWBCards'));

// Получение всех моделей
exports.getAllModels = async (req, res) => {
    try {
        const models = await getAllModels()
        if (models.length == 0) return res.status(404).json({ error: 'Модели не найдены' });
        res.status(200).json(models)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Создание моделей
exports.createModelsWithWB = async (req, res) => {
    try {
        const { brand, platform, apiCategory } = req.body
        const token = await getApi(brand, platform, apiCategory)
        const data = await getDataFromWbCards(token)
        if (!brand && !platform) return res.status(404).json({ error: 'Модели не получены с WB' });
        await createModelsWithWB(data, brand, platform);
        res.status(200).json();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getModelById = async (req, res) => {
    try {
        const { id } = req.params;
        const model = await getModelById(id);
        res.status(200).json(model)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.createModel = async (req, res) => {
    try {
        const { brand, article, size, sku, pair, category, gender, color, compound, platform } = req.body;

        // Проверка обязательных полей
        if (!brand || !article || !size || !platform) {
            return res.status(400).json({ error: 'Отсутствуют обязательные поля: brand, article, size или platform' });
        }

        // Если платформа "BestHub" (без учета регистра), sku не обязателен
        const isBestHub = platform && platform.toLowerCase() === 'besthub';
        if (!isBestHub && !sku) {
            return res.status(400).json({ error: 'Для данной платформы поле SKU является обязательным' });
        }

        // Вызов функции создания модели
        await createModel(brand, article, size, sku, pair, category, gender, color, compound, platform);
        res.status(201).json({ message: 'Модель успешно создана' });
    } catch (error) {
        console.error('Ошибка при создании модели:', error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.updateModelById = async (req, res) => {
    try {
        const { id } = req.params;
        const { pair, category, gender, color, compound } = req.body;
        await updateModelById(id, pair, category, gender, color, compound);
        res.status(201).json({ message: 'Модель успешно обновлена' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}