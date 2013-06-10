var utils = require('./utils.js').utils

function Catalog() {
}

/**
 * Возвращает хэш товаров (ключ - артикул)
 * @param products массив товаров
 * @returns Object
 */
function getDictionaryHash(products) {
    var res = {};

    products.forEach(function(p) { res[p.article] = p });

    return res;
}

/**
 * Возвращает массив отсутствующих и появившихся поставщика товаров
 * @param priceList
 * @returns {Object}
 * @param products
 */
Catalog.checkAvailability = function(products, priceList) {
    var res = {
            missing: [],
            available: []
        },
        dic = getDictionaryHash(priceList);

    products.forEach(function(p) {
        if (p.available) {
            (!dic[p.article] || !dic[p.article].available) && res.missing.push(p);
        } else {
            dic[p.article] && dic[p.article].available && res.available.push(p);
        }
    });

    return res;
}

/**
 * Возвращает новые товары поставщика
 * @param products
 * @param priceList
 * @returns {Array}
 */
Catalog.getNewProducts = function(products, priceList) {
    var res = [],
        dic = getDictionaryHash(products);

    priceList.forEach(function(p) {
        if (!dic[p.article]) {
            p.price = utils.getOurPrice(p.price);
            res.push(p);
        }
    });

    return res;
}


exports.Catalog = Catalog;
