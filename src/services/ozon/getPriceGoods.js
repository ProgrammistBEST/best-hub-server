const { makeRequestOZON } = require('./ozonClient');

/**
 * Получает цены товаров с Ozon.
 * @param {string} clientID - ID клиента Ozon.
 * @param {string} apiKey - API-ключ клиента Ozon.
 * @returns {Promise<Array>} - Список товаров с ценами.
 */
async function getPriceGoods(clientID, apiKey) {
    const headers = {
        'Client-Id': clientID,
        'Api-Key': apiKey,
        'Content-Type': 'application/json'
    }
    const endpoint = "/v5/product/info/prices";
    const data = {
        cursor: "",
        filter: {
            offer_id: [],
            product_id: [],
            visibility: "ALL",
        },
        limit: 100,
    };

    const response = await makeRequestOZON(headers, 'POST', endpoint, data);
    return response.items;
}

module.exports = { getPriceGoods };