// const path = require('path')
const { arm2 } = require('../database/barcodes/arm2')
const { getApi }= require('../database/api/apiCRUD')
const { getDataFromWbCards } = require('../services/getData/getDataFromWBCards');

exports.arm2 = async (req, res) => {
    try {
        // models = { articles: {
        // sizes: [${size}]
        // }}
        const { brand, platform, apiCategory, models } = req.body;
        if (!brand || !platform || !apiCategory || !models) {
            res.stetus(400).json({ error: 'Ошибка введенных данных. Не полные необходимые данные'})
        }
        const token = await getApi(brand, platform, apiCategory);
        if (!token) {
            res.status(500).json({ error: 'Ошибка получения токена по api'})
        }
        //data = ((card, index) => {
        //     console.log(`Карточка ${index + 1}:`);
        //     console.log(`  - Артикул: ${card.article}`);
        //     console.log(`  - Пол: ${card.gender}`);
        //     console.log(`  - Состав: ${card.compound}`);
        //     console.log(`  - Цвет: ${card.color}`);
        //     console.log(`  - Размеры и SKU:`);
        //     card.sizes.forEach(({ techSize, sku }) => {
        //         console.log(`    - Размер: ${techSize}, SKU: ${sku}`);
        //     });
        //     console.log('\n');
        // }); 
        const data = await getDataFromWbCards(token);
        if (!Array.isArray(data) || data.length === 0) {
            res.status(500).json({ error: 'Ошибка полуения данных моделей'})
        }

        const filterData = await filterDataCardsWB(data, models)

        // const barcodes = await arm2(filterData)
        // res.status(200).json({ barcodes });
    } catch (error) {
        console.error('Ошибка при выполнении', error.message)
        res.status(500).json({ error: error.message })
    }
}