var catalog = require('./service/catalog.js').Catalog;


function Controller(cache, dataAdapter) {
    this._cache = cache;
    this._data = dataAdapter;
}

Controller.prototype.adminPage = function(callback) {
    this._data.getCategories(function(err, categories) {
        callback(err, {
            lastUpdate: new Date(),
            categories: categories
        });
    });
};

Controller.prototype.getAllProducts = function(callback) {
    this._cache['allProducts'].get(function(err, products) {
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

Controller.prototype.syncData = function(callback) {
    this._cache.update('contractorPrices allProducts', function(err, data) {
        callback(err, {
            lastUpdate: this._cache['allProducts'].lastUpdate
        });
    }.bind(this));
};

Controller.prototype.saveCategory = function(category, callback) {
    return this._data.saveCategory(category, callback);
};

exports.Controller = Controller;
