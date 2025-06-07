async function filterDataCardsWB(dataWB, models) {
    const modelsMap = models.reduce((accumulator, models) => {
        accumulator[models.article] = new Set(model.sizes);
        return acc;
    }, {});

    return dataWB.filter(card => {
        const modelInfo = modelsMap[card.article];
        if (!modelInfo) return false;

        card.sizes = card.sizes.filter(size => modelInfo.sizes.has(size.techSize));
        return card.sizes.length > 0;
    })
}