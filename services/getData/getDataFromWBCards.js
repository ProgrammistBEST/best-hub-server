const path = require('path');
const { getCardsWB } = require(path.join(__dirname, '../getCardsWB'));

async function getDataFromWbCards(headers) {
    // try {
    //     if (!headers) {
    //         console.error('Не удалось получить токен из базы данных');
    //         return null;
    //     }

    //     const cards = await getCardsWB(headers);
        
    //     // Обработка каждой карточки
    //     const processedCards = cards.map((card) => {
    //         const article = card.vendorCode || 'Нет артикула'; // Артикул
    //         let gender = 'Не указан'; // Пол
    //         let compound = 'Не указан'; // Состав
    //         let color = 'Не указан'; // Цвет
    //         const categories = card.subjectName || 'Нет категории';

    //         // Извлечение характеристик из массива characteristics
    //         if (card.characteristics && card.characteristics.length > 0) {
    //             card.characteristics.forEach((characteristic) => {
    //                 const name = characteristic.name.toLowerCase(); // Название характеристики
    //                 const value = Array.isArray(characteristic.value)
    //                     ? characteristic.value.join(", ")
    //                     : characteristic.value;

    //                 if (name.includes('пол')) {
    //                     gender = value;
    //                 } else if (name.includes('состав')) {
    //                     compound = value;
    //                 } else if (name.includes('цвет')) {
    //                     color = value;
    //                 }
    //             });
    //         }

    //         // Обработка размеров и SKU
    //         const sizes = card.sizes || [];
    //         const processedSizes = sizes.flatMap((size) => {
    //             const techSize = size.techSize || 'Не указан';
    //             const skus = Array.isArray(size.skus) ? size.skus : [];

    //             return skus.map((sku) => ({
    //                 techSize,
    //                 sku,
    //             }));
    //         });

    //         // Возвращаем обработанные данные
    //         return {
    //             article,
    //             gender,
    //             compound,
    //             color,
    //             categories,
    //             sizes: processedSizes,
    //         };
    //     });
    //     // processedCards.forEach((card, index) => {
    //     //     console.log(`Карточка ${index + 1}:`);
    //     //     console.log(`  - Артикул: ${card.article}`);
    //     //     console.log(`  - Пол: ${card.gender}`);
    //     //     console.log(`  - Состав: ${card.compound}`);
    //     //     console.log(`  - Цвет: ${card.color}`);
    //     //     console.log(`  - Размеры и SKU:`);
    //     //     card.sizes.forEach(({ techSize, sku }) => {
    //     //         console.log(`    - Размер: ${techSize}, SKU: ${sku}`);
    //     //     });
    //     //     console.log('\n');
    //     // });
    //     return processedCards;
    // } catch (error) {
    //     console.error("Ошибка в процессе выполнения:", error.message);
    //     return null;
    // }
    return [
  {
    article: "72",
    gender: "средняя",
    compound: "ЭВА, EVA",
    color: "черный",
    categories: "Резиновые сапоги",
    sizes: [
      {
        techSize: "33-34",
        sku: "2040658665396",
      },
      {
        techSize: "27-28",
        sku: "2040658665365",
      },
      {
        techSize: "35-36",
        sku: "2040658665402",
      },
      {
        techSize: "31-32",
        sku: "2040658665389",
      },
      {
        techSize: "29-30",
        sku: "2040658665372",
      },
    ],
  },
  {
    article: "034",
    gender: "средняя",
    compound: "EVA, эва",
    color: "черный",
    categories: "Сабо",
    sizes: [
      {
        techSize: "39",
        sku: "2042865385425",
      },
      {
        techSize: "37",
        sku: "2042865385401",
      },
      {
        techSize: "38",
        sku: "2042865385418",
      },
      {
        techSize: "40",
        sku: "2042865385432",
      },
      {
        techSize: "36",
        sku: "2042865385395",
      },
      {
        techSize: "41",
        sku: "2042865385449",
      },
      {
        techSize: "42",
        sku: "2042865385456",
      },
      {
        techSize: "43",
        sku: "2042865385463",
      },
      {
        techSize: "44",
        sku: "2042865385470",
      },
      {
        techSize: "45",
        sku: "2042865385487",
      },
    ],
  },
  {
    article: "032-7",
    gender: "Женский",
    compound: "EVA, эва",
    color: "зеленый",
    categories: "Сабо",
    sizes: [
      {
        techSize: "41",
        sku: "2042863572629",
      },
      {
        techSize: "42",
        sku: "2042863572636",
      },
      {
        techSize: "38",
        sku: "2042863572599",
      },
      {
        techSize: "39",
        sku: "2042863572605",
      },
      {
        techSize: "40",
        sku: "2042863572612",
      },
      {
        techSize: "36",
        sku: "2042863572575",
      },
      {
        techSize: "37",
        sku: "2042863572582",
      },
    ],
  },
  {
    article: "032-10",
    gender: "средняя",
    compound: "EVA, эва",
    color: "лимонный",
    categories: "Сабо",
    sizes: [
      {
        techSize: "40",
        sku: "2042863575484",
      },
      {
        techSize: "38",
        sku: "2042863575460",
      },
      {
        techSize: "36",
        sku: "2042863575446",
      },
      {
        techSize: "37",
        sku: "2042863575453",
      },
      {
        techSize: "39",
        sku: "2042863575477",
      },
      {
        techSize: "41",
        sku: "2042863575491",
      },
      {
        techSize: "42",
        sku: "2042863575507",
      },
    ],
  },
  {
    article: "032-1",
    gender: "средняя",
    compound: "EVA, эва",
    color: "белый",
    categories: "Сабо",
    sizes: [
      {
        techSize: "36",
        sku: "2042863165111",
      },
      {
        techSize: "37",
        sku: "2042863165128",
      },
      {
        techSize: "38",
        sku: "2042863165135",
      },
      {
        techSize: "39",
        sku: "2042863165142",
      },
      {
        techSize: "40",
        sku: "2042863165159",
      },
      {
        techSize: "41",
        sku: "2042863165166",
      },
      {
        techSize: "42",
        sku: "2042863165173",
      },
      {
        techSize: "43",
        sku: "2042863165180",
      },
      {
        techSize: "44",
        sku: "2042863165197",
      },
      {
        techSize: "45",
        sku: "2042863165203",
      },
    ],
  },
  {
    article: "032-14",
    gender: "средняя",
    compound: "EVA, эва",
    color: "бежевый",
    categories: "Сабо",
    sizes: [
      {
        techSize: "37",
        sku: "2042947110198",
      },
      {
        techSize: "41",
        sku: "2042947110235",
      },
      {
        techSize: "36",
        sku: "2042947110181",
      },
      {
        techSize: "38",
        sku: "2042947110204",
      },
      {
        techSize: "39",
        sku: "2042947110211",
      },
      {
        techSize: "40",
        sku: "2042947110228",
      },
      {
        techSize: "42",
        sku: "2042947110242",
      },
    ],
  },
  {
    article: "032-2",
    gender: "Женский",
    compound: "EVA, эва",
    color: "сиреневый",
    categories: "Сабо",
    sizes: [
      {
        techSize: "41",
        sku: "2042863512212",
      },
      {
        techSize: "38",
        sku: "2042863512182",
      },
      {
        techSize: "39",
        sku: "2042863512199",
      },
      {
        techSize: "40",
        sku: "2042863512205",
      },
      {
        techSize: "42",
        sku: "2042863512229",
      },
      {
        techSize: "37",
        sku: "2042863512175",
      },
      {
        techSize: "36",
        sku: "2042863512168",
      },
    ],
  },
  {
    article: "032-6",
    gender: "Женский",
    compound: "EVA, эва",
    color: "голубой",
    categories: "Сабо",
    sizes: [
      {
        techSize: "42",
        sku: "2042863514674",
      },
      {
        techSize: "41",
        sku: "2042863514667",
      },
      {
        techSize: "36",
        sku: "2042863514612",
      },
      {
        techSize: "37",
        sku: "2042863514629",
      },
      {
        techSize: "38",
        sku: "2042863514636",
      },
      {
        techSize: "40",
        sku: "2042863514650",
      },
      {
        techSize: "39",
        sku: "2042863514643",
      },
    ],
  },
  {
    article: "032",
    gender: "Женский",
    compound: "EVA, эва",
    color: "черный",
    categories: "Сабо",
    sizes: [
      {
        techSize: "43",
        sku: "2042862655460",
      },
      {
        techSize: "44",
        sku: "2042862655477",
      },
      {
        techSize: "45",
        sku: "2042862655484",
      },
      {
        techSize: "39",
        sku: "2042862655422",
      },
      {
        techSize: "40",
        sku: "2042862655439",
      },
      {
        techSize: "41",
        sku: "2042862655446",
      },
      {
        techSize: "42",
        sku: "2042862655453",
      },
      {
        techSize: "36",
        sku: "2042862655392",
      },
      {
        techSize: "37",
        sku: "2042862655408",
      },
      {
        techSize: "38",
        sku: "2042862655415",
      },
    ],
  },
]
}

module.exports = { getDataFromWbCards };