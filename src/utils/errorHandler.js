// Проверка подключения к базе данных
function ensureDatabaseConnection(db) {
    if (!db) {
        throw new Error('Не определена база данных')
    };
};

module.exports = { ensureDatabaseConnection }