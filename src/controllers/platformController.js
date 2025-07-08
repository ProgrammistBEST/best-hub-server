const path = require('path');
const { getPlatformById, getAllPlatforms, createPlatform, updatePlatformById, deletePlatformById } = require(path.join(__dirname, '../database/platformCRUD'));

// Получение одной платформы по ID
exports.getPlatformById = async (req, res) => {
    try {
        const platform = await getPlatformById(req.params.id);
        if (!platform) {
            return res.status(404).json({ error: 'Платформа не найдена' });
        }
        res.status(200).json(platform);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Получение всех платформ
exports.getAllPlatforms = async (req, res) => {
    try {
        const platforms = await getAllPlatforms();
        res.status(200).json(platforms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Создание новой платформы
exports.createPlatform = async (req, res) => {
    try {
        const { newPlatformName } = req.body;

        // Проверка входных данных
        if (!newPlatformName || typeof newPlatformName !== 'string') {
            return res.status(400).json({ error: 'Некорректное имя платформы: должно быть строкой' });
        }

        await createPlatform(newPlatformName);
        res.status(201).json({ message: 'Платформа успешно создана' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Обновление платформы по ID
exports.updatePlatformById = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPlatformName } = req.body;

        // Проверка входных данных
        if (!newPlatformName || typeof newPlatformName !== 'string') {
            return res.status(400).json({ error: 'Некорректное имя платформы: должно быть строкой' });
        }

        await updatePlatformById(id, newPlatformName);
        res.status(200).json({ message: 'Платформа успешно обновлена' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Удаление платформы по ID
exports.deletePlatformById = async (req, res) => {
    try {
        const { id } = req.params; // Исправлено: используем req.params.id

        await deletePlatformById(id);
        res.status(200).json({ message: 'Платформа успешно удалена' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};