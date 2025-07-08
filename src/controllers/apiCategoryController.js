const path = require('path');
const { getApiCategoryById, getAllApiCategories, createApiCategory, updateApiCategoryById, deleteApiCategoryById } = require(path.join(__dirname, '../database/api/apiCategoryCRUD'));

// Получение одной категории API по ID
exports.getApiCategoryById = async (req, res) => {
    try {
        const apiCategory = await getApiCategoryById(req.params.id);
        if (!apiCategory) {
            return res.status(404).json({ error: 'Категория API не найдена' });
        }
        res.status(200).json(apiCategory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Получение всех категорий API
exports.getAllApiCategories = async (req, res) => {
    try {
        const apiCategories = await getAllApiCategories();
        res.status(200).json(apiCategories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Создание категории API
exports.createApiCategory = async (req, res) => {
    try {
        const { newApiCategoryName } = req.body;

        // Проверка входных данных
        if (!newApiCategoryName || typeof newApiCategoryName !== 'string') {
            return res.status(400).json({ error: 'Некорректное имя категории API: должно быть строкой' });
        }

        await createApiCategory(newApiCategoryName);
        res.status(201).json({ message: 'Категория API успешно создана' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Обновление категории API по ID
exports.updateApiCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const { newApiCategoryName } = req.body;

        // Проверка входных данных
        if (!newApiCategoryName || typeof newApiCategoryName !== 'string') {
            return res.status(400).json({ error: 'Некорректное имя категории API: должно быть строкой' });
        }

        await updateApiCategoryById(id, newApiCategoryName);
        res.status(200).json({ message: 'Категория API успешно обновлена' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Удаление категории API по ID
exports.deleteApiCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        await deleteApiCategoryById(id);
        res.status(200).json({ message: 'Категория API успешно удалена' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};