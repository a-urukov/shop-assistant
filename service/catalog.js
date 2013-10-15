var utils = require('./utils.js').utils;

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
        dicPrices = getDictionaryHash(priceList);

    products.forEach(function(our) {
        var their = dicPrices[our.article];

        if (our.available) {
            their && !their.available && res.missing.push(our);
        } else {
            if (their && their.available) {
                res.available.push(our);
            }
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
        our = getDictionaryHash(products);

    priceList.forEach(function(their) {
        if (!our[their.article]) {
            var np = utils.clone(their);

            np.price = utils.getOurPrice(np.price);
            res.push(np);
        }
    });

    return res;
}


exports.Catalog = Catalog;
