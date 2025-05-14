const path = require('path');
const { createAPI, getAllAPIs, getAPIById, updateAPI, deleteAPI } = require(path.join(__dirname,'../database/api/apiCRUD'));

// Создание API
exports.createAPI = async (req, res) => {
    try {
        const { token, brand, platform, category, expiration_date } = req.body;
        await createAPI(token, brand, platform, category, expiration_date);
        res.status(201).json({ message: 'API успешно создано' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Получение всех API
exports.getAllAPIs = async (req, res) => {
    try {
        const apis = await getAllAPIs();
        res.status(200).json(apis);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Получение одного API по ID
exports.getAPIById = async (req, res) => {
    try {
        const api = await getAPIById(req.params.id);
        if (!api) return res.status(404).json({ error: 'API не найдено' });
        res.status(200).json(api);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Обновление API
exports.updateAPI = async (req, res) => {
    try {
        const { token, brand, platform, category, expiration_date } = req.body;
        await updateAPI(req.params.id, token, brand, platform, category, expiration_date);
        res.status(200).json({ message: 'API успешно обновлено' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Удаление API
exports.deleteAPI = async (req, res) => {
    try {
        await deleteAPI(req.params.id);
        res.status(200).json({ message: 'API успешно удалено' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};