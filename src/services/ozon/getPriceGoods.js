const { makeRequestOZON } = require('./ozonClient');

async function getPriceGoods() {
    const endpoint = "/v5/product/info/prices";
    const data = {
        cursor: "",
        filter: {
            offer_id: [],
            product_id: [],
            visibility: "ALL"
        },
        limit: 100
    };
    const response = await makeRequestOZON('POST', endpoint, data);
    return response.items;
}

module.exports = { getPriceGoods };
