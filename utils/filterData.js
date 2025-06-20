const filterDataCardsWB = (data, models) => {
    // Преобразуем models в объект для быстрого поиска
    const modelsMap = models.reduce((acc, model) => {
        // Проверяем, что sizes существует и является массивом
        if (!Array.isArray(model.sizes)) {
            console.warn(`Sizes for article ${model.article} is not an array. Skipping.`);
            return acc;
        }
        acc[model.article] = new Set(model.sizes); // Используем Set для быстрого поиска размеров
        return acc;
    }, {});

    // Фильтруем данные
    return data.filter(card => {
        const modelInfo = modelsMap[card.article];
        if (!modelInfo) return false; // Артикул не найден в models

        // Проверяем, что sizes в карточке существует и является массивом
        if (!Array.isArray(card.sizes)) {
            console.warn(`Sizes for card with article ${card.article} is not an array. Skipping.`);
            return false;
        }

        // Фильтруем размеры
        card.sizes = card.sizes.filter(size => {
            if (!size || typeof size.techSize !== 'string') {
                console.warn(`Invalid size object for article ${card.article}. Skipping.`);
                return false;
            }
            return modelInfo.has(size.techSize);
        });

        return card.sizes.length > 0; // Оставляем карточку, если есть хотя бы один подходящий размер
    });
};

module.exports = { filterDataCardsWB };