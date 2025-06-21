const path = require('path');
const { getCardsWB } = require(path.join(__dirname, '../getCardsWB'));

async function getDataFromWbCards(headers) {
    try {
        if (!headers) {
            console.error('Не удалось получить токен из базы данных');
            return null;
        }

        const cards = await getCardsWB(headers);
        
        // Обработка каждой карточки
        const processedCards = cards.map((card) => {
            const article = card.vendorCode || 'Нет артикула'; // Артикул
            let gender = 'Не указан'; // Пол
            let compound = 'Не указан'; // Состав
            let color = 'Не указан'; // Цвет
            const categories = card.subjectName || 'Нет категории';

            // Извлечение характеристик из массива characteristics
            if (card.characteristics && card.characteristics.length > 0) {
                card.characteristics.forEach((characteristic) => {
                    const name = characteristic.name.toLowerCase(); // Название характеристики
                    const value = Array.isArray(characteristic.value)
                        ? characteristic.value.join(", ")
                        : characteristic.value;

                    if (name.includes('пол')) {
                        gender = value;
                    } else if (name.includes('состав')) {
                        compound = value;
                    } else if (name.includes('цвет')) {
                        color = value;
                    }
                });
            }

            // Обработка размеров и SKU
            const sizes = card.sizes || [];
            const processedSizes = sizes.flatMap((size) => {
                const techSize = size.techSize || 'Не указан';
                const skus = Array.isArray(size.skus) ? size.skus : [];

                return skus.map((sku) => ({
                    techSize,
                    sku,
                }));
            });

            // Возвращаем обработанные данные
            return {
                article,
                gender,
                compound,
                color,
                categories,
                sizes: processedSizes,
            };
        });
        // processedCards.forEach((card, index) => {
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
        return processedCards;
    } catch (error) {
        console.error("Ошибка в процессе выполнения:", error.message);
        return null;
    }
}

module.exports = { getDataFromWbCards };