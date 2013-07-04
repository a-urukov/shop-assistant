var catalog = require('./service/catalog.js').Catalog;


function Controller(cache) {
    this._cache = cache;
}

Controller.prototype.getAllProducts = function(callback) {
    this._cache.allProducts.get(function(err, products) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, {
                aaData: products.map(utils.productToDataTable)
            });
        }
    });
};

Controller.prototype.getNewProducts = function(callback) {
    this._cache.get('contractorPrices allProducts', function(err, data) {
        callback(err, {
            aaData: catalog.getNewProducts(data.allProducts, data.contractorPrices).map(utils.productToDataTable)
        });
    });
};

Controller.prototype.getMissingProducts = function(callback) {
    this._cache.get('contractorPrices allProducts', function(err, data) {
        callback(err, {
            aaData: catalog.checkAvailability(data.allProducts, data.contractorPrices).missing.map(utils.productToDataTable)
        });
    });
};

Controller.prototype.getAvailableProducts = function(callback) {
    this._cache.get('contractorPrices allProducts', function(err, data) {
        callback(err, {
            aaData: catalog.checkAvailability(data.allProducts, data.contractorPrices).available.map(utils.productToDataTable)
        });
    });
};

exports.Controller = Controller;
