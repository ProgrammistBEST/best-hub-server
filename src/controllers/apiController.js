const { createAPI, getAllApis, getAPIById, updateAPI, deleteAPI } = require('@database/api/apiCRUD');

// Создание API
exports.createAPI = async (req, res) => {
    try {
        const { token, brand, platform, api_category, expiration_date } = req.body;

        if (!token || !brand || !platform || !api_category || !expiration_date) {
            return res.status(400).json({ error: 'Все поля обязательны' });
        }

        const date = new Date(expiration_date);
        if (isNaN(date.getTime())) {
            return res.status(400).json({ error: 'Некорректный формат даты' });
        }

        await createAPI(token, brand, platform, api_category, expiration_date);
        res.status(201).json({ message: 'API успешно создано' });
    } catch (error) {
        console.error('Ошибка при создании API:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Получение всех API
exports.getAllApis = async (req, res) => {
    try {
        const apis = await getAllApis();

        if (apis.length === 0) {
            return res.status(404).json({ error: 'API не найдены' });
        }

        res.status(200).json(apis);
    } catch (error) {
        console.error('Ошибка при получении API:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Получение одного API по ID
exports.getAPIById = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);

        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID должен быть числом' });
        }

        const api = await getAPIById(id);

        if (!api) {
            return res.status(404).json({ error: 'API не найдено' });
        }

        res.status(200).json(api);
    } catch (error) {
        console.error('Ошибка при получении API:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Обновление API
exports.updateAPI = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { token, brand, platform, api_category, expiration_date } = req.body;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID должен быть числом' });
        }

        if (!token || !brand || !platform || !api_category || !expiration_date) {
            return res.status(400).json({ error: 'Все поля обязательны' });
        }

        const date = new Date(expiration_date);
        if (isNaN(date.getTime())) {
            return res.status(400).json({ error: 'Некорректный формат даты' });
        }

        await updateAPI(id, token, brand, platform, api_category, expiration_date);
        res.status(200).json({ message: 'API успешно обновлено' });
    } catch (error) {
        console.error('Ошибка при обновлении API:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Удаление API
exports.deleteAPI = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);

        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID должен быть числом' });
        }

        await deleteAPI(id);
        res.status(200).json({ message: 'API успешно удалено' });
    } catch (error) {
        console.error('Ошибка при удалении API:', error.message);
        res.status(500).json({ error: error.message });
    }
};