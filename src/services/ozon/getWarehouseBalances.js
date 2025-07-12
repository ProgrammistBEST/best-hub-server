const { makeRequestOZON } = require('./ozonClient');

/**
 * Получает цены товаров с Ozon.
 * @param {string} clientID - ID клиента Ozon.
 * @param {string} apiKey - API-ключ клиента Ozon.
 * @returns {Promise<Array>} - Список товаров с ценами.
 */
async function getWarehouseBalances(clientID, apiKey) {
    const headers = {
        'Client-Id': clientID,
        'Api-Key': apiKey,
        'Content-Type': 'application/json'
    };

    const endpoint = "/v4/product/info/stocks";
    let cursor = "";
    let allItems = [];

    while (true) {
        const data = {
            cursor,
            filter: {
                offer_id: [],
                product_id: [],
                visibility: "ALL",
            },
            limit: 100,
        };

        const response = await makeRequestOZON(headers, 'POST', endpoint, data);
        allItems.push(...response.items);

        if (!response.cursor) break;
        cursor = response.cursor;
    }

    return allItems;
}

module.exports = { getWarehouseBalances };