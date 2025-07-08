const axios = require('axios');

const baseURL = 'https://api-seller.ozon.ru';

// Конфигурация для запросов
const clientID = '507132';
const apiKey = '68f0865f-4334-42b3-b189-a3cff5a3a7b0';

async function makeRequestOZON(method, endpoint, data = null) {
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

module.exports = { makeRequestOZON };