const axios = require('axios');

const baseURL = 'https://api-seller.ozon.ru';

async function makeRequestOZON(headers, method, endpoint, data = null) {
    try {
        const response = await axios({
            method,
            url: `${baseURL}${endpoint}`,
            headers: headers,
            data,
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка запроса к Ozon:', error.message);
        throw error;
    }
}

module.exports = { makeRequestOZON };