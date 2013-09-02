var ObjectID = require('mongodb').ObjectID;

/**
 * Доступ к данным
 * @constructor
 */
function DataAdapter(db) {
    this._db = db;
    this._products = this._db.collection('products');
    this._categories = this._db.collection('categories');
}

/**
 * Получение всех товаров каталога
 * @param callback
 */
DataAdapter.prototype.getAllProducts = function(callback) {
    this._products.find().toArray(callback);
}

/**
 * Добавление продукта в каталог
 * @param product
 * @param callback
 */
DataAdapter.prototype.insertProduct = function(product, callback) {
    var name = product.name,
        caps;

    // убираем caps
    while (caps = /[А-Я,A-Z]{2,}/g.exec(name)) {
        caps = caps[0];
        name = name.replace(caps, caps[0].toUpperCase() + caps.substr(1).toLowerCase());
    }

    this._products.insert({
        name: name,
        url: product.url || utils.nameToUrl(name),
        price: +product.price || 0,
        article: product.article,
        description: product.description,
        published: false,
        ignored: !!product.ignored,
        available: product.available && product.price
    }, callback);
}

DataAdapter.prototype.getCategories = function(callback) {
    this._categories.find().toArray(function(err, categories) {
        if (err) {
            callback(err);
            return;
        }

        var roots = [],
            hash = {};

        categories.forEach(function(category) {
            category.children = [];
            hash[category._id] = category;
        });

        categories.forEach(function(category) {
            if (!category.parentId) {
                roots.push(category);
            } else {
                hash[category.parentId].children.push(category);
            }
        });

        callback(null, roots);
    });
}

DataAdapter.prototype.saveCategory = function(category, callback) {
    this._categories.save({
        _id: category._id && new ObjectID(category._id),
        name: category.name,
        url: category.url || utils.nameToUrl(category.name),
        description: category.description,
        nameInMenu: category.nameInMenu || category.name,
        posInMenu: category.posInMenu || 0,
        parentId: category.parentId && new ObjectID(category.parentId),
        published: !!category.published && category !== 'false'
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
 * Удаление продукта из каталога
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




