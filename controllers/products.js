var catalog = require('../service/catalog.js').Catalog;

function ProductsController(data) {
    this._data = data;
}

// TODO отрефакторить по подобию actions
ProductsController.prototype.getPublished = function(callback) {
    this._data.getProducts({ published: true, ignored: false }, function(err, res) {
        callback(err && ('Can\'t load published product' + JSON.stringify(err)), res.products);
    });
};

ProductsController.prototype.getUnpublished = function(callback) {
    this._data.getProducts({ published: false, ignored: false }, function(err, res) {
        callback(err && ('Can\'t load unpublished product' + JSON.stringify(err)), res.products);
    });
};

ProductsController.prototype.getNew = function(callback) {
    this._data.getProducts(function(err, products) {
        this._data.getContractorsProducts(function(err, contractorsProducts) {
            err && (err = 'Can\'t load new product' + JSON.stringify(err));
            callback(err, catalog.getNewProducts(products, contractorsProducts));
        });
    }.bind(this));
};

ProductsController.prototype.getMissing = function(callback) {
    this._data.getProducts(function(err, res) {

        this._data.getContractorsProducts(function(err, contractorsProducts) {
            err && (err = 'Can\'t load missing product' + JSON.stringify(err));
            callback(err, catalog.checkAvailability(res.products, contractorsProducts).missing);
        });
    }.bind(this));
};

ProductsController.prototype.getAvailable = function(callback) {
    this._data.getProducts(function(err, res) {

        this._data.getContractorsProducts(function(err, contractorsProducts) {
            err && (err = 'Can\'t load missing product: ' + JSON.stringify(err));
            callback(err, catalog.checkAvailability(res.products, contractorsProducts).available);
        });
    }.bind(this));
};

ProductsController.prototype.getIgnored = function(callback) {
    this._data.getProducts({ ignored: true }, function(err, res) {
        callback(err && ('Can\'t load ignored product: ' + JSON.stringify(err)), res.products);
    });
};

ProductsController.prototype.getProduct = function(id, callback) {
    this._data.getProducts({ _id: id }, function(err, res) {

        callback(err && ('Can\'t get product: ' + JSON.stringify(err)), res.products && res.products[0]);
    });
};

ProductsController.prototype.getProductsByCategory = function(categoryId, paginations, callback) {
    this._data.getProductsByCategory(categoryId, paginations, callback);
};

/**
 * Групповые действия над товарами
 * @param {String} action ид экшена
 * @param {Array} ids массив id товаров
 * @param {Function} callback
 */
ProductsController.prototype.groupАctions = function(action, ids, callback) {
    var callbackFunc = function(err, data) {
        callback(err && ('Can\'t execute products action: ' + JSON.stringify(err)), data);
    };

    switch (action) {
        case 'publish':
            this._data.changeProductsState({ published: true, ignored: false }, ids, callbackFunc);
            break;
        case 'unpublish':
            this._data.changeProductsState({ published: false, ignored: false }, ids, callbackFunc);
            break;
        case 'ignore':
            this._data.changeProductsState({ published: false, ignored: true }, ids, callbackFunc);
            break;
        case 'unignore':
            this._data.changeProductsState({ published: false, ignored: false }, ids, callbackFunc);
            break;
        case 'actualize':
            this._data.actualizeProducts(ids, callbackFunc);
            break;
        case 'add-from-contractor':
            this._data.addFromContractor(ids, callbackFunc);
            break;
        case 'remove':
            this._data.removeProducts(ids, callbackFunc);
            break;
        default:
            callback('Not permission actions!');
    }
};

ProductsController.prototype.saveProduct = function(product, callback) {
    product.categories && typeof product.categories === 'string'&& (product.categories = product.categories.split(','));
    this._data.saveProduct(product, callback);
}

exports.ProductsController = ProductsController;
