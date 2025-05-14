const path = require('path');
const { getBrandById, getAllBrands, createBrand, updateBrandById, deleteBrandById } = require(path.join(__dirname,'../database/brandCRUD'));

// Получение одной платформы по ID
exports.getBrandById = async (req, res) => {
    try {
        const brand = await getBrandById(req.params.id);
        if (!brand) {
            return res.status(404).json({ error: 'Бренд не найден' });
        }
        res.status(200).json(brand);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Получение всех платформ
exports.getAllBrands = async (req, res) => {
    try {
        const brands = await getAllBrands();
        res.status(200).json(brands);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Создание новой платформы
exports.createBrand = async (req, res) => {
    try {
        const { newBrandName } = req.body;

        // Проверка входных данных
        if (!newBrandName || typeof newBrandName !== 'string') {
            return res.status(400).json({ error: 'Некорректное имя платформы' });
        }

        await createBrand(newBrandName);
        res.status(201).json({ message: 'Платформа успешно создана' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Обновление платформы по ID
exports.updateBrandById = async (req, res) => {
    try {
        const { id } = req.params;
        const { renameBrandName } = req.body;

        // Проверка входных данных
        if (!renameBrandName || typeof renameBrandName !== 'string') {
            return res.status(400).json({ error: 'Некорректное имя платформы' });
        }

        await updateBrandById(id, renameBrandName);
        res.status(200).json({ message: 'Платформа успешно обновлена' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Удаление платформы по ID
exports.deleteBrandById = async (req, res) => {
    try {
        const { brandId } = req.params;

        await deleteBrandById(brandId);
        res.status(200).json({ message: 'Платформа успешно удалена' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};