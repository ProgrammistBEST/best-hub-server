require('dotenv').config()
const mysql2 = require('mysql2/promise');

const db = mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

// Проверка подключения к базе данных storagesigns
db.getConnection()
    .then((connection) => {
        console.log('Успешное подключение к базе данных MySQL:', process.env.DB_NAME);
        connection.release();
    })
    .catch((err) => {
        console.error('Ошибка при подключении к базе данных:', process.env.DB_NAME, err.message);
        console.error('Код ошибки:', err.code);
        console.error('Стек вызовов:', err.stack);
    });

module.exports = {
    db
}