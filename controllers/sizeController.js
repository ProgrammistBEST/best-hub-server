const path = require('path');
const { getAllSizes, createSize } = require(path.join(__dirname, '../database/models/sizeCRUD'));

// Получение всех платформ
exports.getAllSizes = async (req, res) => {
    try {
        const sizes = await getAllSizes();
        res.status(200).json(sizes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Создание новой платформы
exports.createSize = async (req, res) => {
    try {
        const { newSizeName } = req.body;

        // Проверка входных данных
        if (!newSizeName || typeof newSizeName !== 'string') {
            return res.status(400).json({ error: 'Некорректное имя платформы: должно быть строкой' });
        }

        await createSize(newSizeName);
        res.status(201).json({ message: 'Платформа успешно создана' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
