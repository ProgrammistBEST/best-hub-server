async function getCardsWB(headers) {
    const apiUrl = "https://content-api.wildberries.ru/content/v2/get/cards/list";
    const batchSize = 100;
    let allCards = [];

    try {
        let cursor = initializeCursor(batchSize);

        while (true) {
            const response = await makeRequestWB(apiUrl, headers, cursor);
            const { cards, updatedCursor } = extractDataFromResponse(response);

            allCards.push(...cards);
            if (updatedCursor.total !== batchSize) break;

            cursor = updateCursor(updatedCursor, batchSize);
        }
    } catch (error) {
        console.error("Ошибка при получении данных:", error.message);
    }

    return allCards;
}

function initializeCursor(limit) {
    return { limit };
}

async function makeRequestWB(url, headers, cursor) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `${headers}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            settings: {
                cursor,
                filter: { withPhoto: -1 },
                sort: { ascending: false },
            },
        }),
    });

    if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    return await response.json();
}

function extractDataFromResponse(responseData) {
    const cards = responseData.cards || [];
    const cursor = responseData.cursor || {};

    return {
        cards,
        updatedCursor: {
            total: cursor.total,
            updatedAt: cursor.updatedAt,
            nmID: cursor.nmID,
        },
    };
}

function updateCursor(cursor, limit) {
    return {
        limit,
        updatedAt: cursor.updatedAt,
        nmID: cursor.nmID,
    };
}

module.exports = { getCardsWB };