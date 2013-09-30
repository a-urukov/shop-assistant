var catalog = require('../service/catalog.js').Catalog;

function ProductsController(cache, data) {
    this._cache = cache;
    this._data = data;
}

ProductsController.prototype.getPublished = function(callback) {
    this._data.getProducts({ published: true, ignored: false }, function(err, products) {
        if (err) {
            callback('Can\'t load published product' + JSON.stringify(err));
        } else {
            callback(null, utils.toDataTable(products));
        }
    });
};

ProductsController.prototype.getUnpublished = function(callback) {
    this._data.getProducts({ published: false, ignored: false }, function(err, products) {
        if (err) {
            callback('Can\'t load unpublished product' + JSON.stringify(err));
        } else {
            callback(null, utils.toDataTable(products));
        }
    });
};

ProductsController.prototype.getNew = function(callback) {
    this._cache.get('contractorPrices allProducts', function(err, data) {
        if (err) {
            callback('Can\'t load new product' + JSON.stringify(err));
        }
        else {
            callback(null, utils.toDataTable(catalog.getNewProducts(data.allProducts, data.contractorPrices)));
        }
    });
};

ProductsController.prototype.getMissing = function(callback) {
    this._cache.get('contractorPrices allProducts', function(err, data) {
        if (err) {
            callback('Can\'t load missing product' + JSON.stringify(err));
        }
        else {
            callback(null, utils.toDataTable(catalog.checkAvailability(data.allProducts, data.contractorPrices).missing));
        }
    });
};

ProductsController.prototype.getAvailable = function(callback) {
    this._cache.get('contractorPrices allProducts', function(err, data) {
        if (err) {
            callback('Can\'t load available product' + JSON.stringify(err));
        }
        else {
            callback(null, utils.toDataTable(catalog.checkAvailability(data.allProducts, data.contractorPrices).available));
        }
    });
};

ProductsController.prototype.getIgnored = function(callback) {
    this._data.getProducts({ ignored: true }, function(err, products) {
        if (err) {
            callback('Can\'t load ignored products' + JSON.stringify(err));
        } else {
            callback(null, utils.toDataTable(products));
        }
    });
};

exports.ProductsController = ProductsController;
