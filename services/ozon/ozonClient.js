const axios = require('axios');
const { clientID, apiKey } = require('../../config/ozonApi');

const baseURL = 'https://api-seller.ozon.ru';

async function makeRequest(method, endpoint, data = null) {
    try {
        const response = await axios({
            method,
            url: `${baseURL}${endpoint}`,
            headers: {
                'Client-Id': clientID,
                'Api-Key': apiKey,
                'Content-Type': 'application/json',
            },
            data,
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка запроса к Ozon:', error.message);
        throw error;
    }
}

module.exports = { makeRequest };