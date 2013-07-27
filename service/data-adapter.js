/**
 * Доступ к данным
 * @constructor
 */
function DataAdapter(db) {
    this._db = db;
    this._products = this._db.collection('products');
}

/**
 * Получение всех товаров каталога
 * @param callback
 */
DataAdapter.prototype.getAllProducts = function(callback) {
    this._products.find().toArray(callback);
}

/**
 * Добавление продукта в каталог virtueMart
 * @param product
 * @param callback
 */
DataAdapter.prototype.insertProduct = function(product, callback) {
    var name = product.name,
        price = utils.getOurPrice(product.price);

    // убираем caps
    while (caps = /[А-Я,A-Z]{2,}/g.exec(name)) {
        caps = caps[0];
        name = name.replace(caps, caps[0].toUpperCase() + caps.substr(1).toLowerCase());
    }

    this._products.insert({
        name: name,
        price: price,
        article: product.article,
        description: product.description,
        available: product.available && price
    }, callback);
}

/**
 * Обновление цены и наличия
 * @param product
 * @param callback
 */
DataAdapter.prototype.updatePriceAndAvailability = function(product, callback) {
    var price = utils.getOurPrice(product.price);

    this._products.update({ article: product.article }, {
        $set: {
            price: utils.getOurPrice(price),
            available: product.available && price
        }
    }, callback);
}

/**
 * Удаление продукта из каталога virtueMart
 * @param product
 * @param callback
 */
DataAdapter.prototype._deleteProduct = function(product, callback) {
    this._products.remove({ article: product.article }, callback);
}

/**
 * //TODO Добавление дополнительных фото к товару
 * @param auxPhotos
 * @param callback
 */
DataAdapter.prototype.addAuxPhoto = function(auxPhotos, callback) {

}

exports.DataAdapter = DataAdapter;




