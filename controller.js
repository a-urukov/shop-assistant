var utils = require('./service/utils.js').utils,
    catalog = require('./service/catalog.js').Catalog;


Controller = function(dataAdapter, contractor) {
    var contractorPrice,
        products;

    this.dataAdapter = dataAdapter;
    this.contractor = contractor;

    this._getContractorPrice = function(callback, update) {
        if (contractorPrice && !update) {
            callback(null, contractorPrice);
        } else {
            contractor.downloadPriceList(function(err, p) {
                contractorPrice = p;
                callback(err, p);
            });
        }
    }

    this._getAllProducts = function(callback, update) {
        if (products && !update) {
            callback(null, products);
        } else {
            this.dataAdapter.getAllProducts(function(err, p) {
                products = p;
                callback(err, p);
            });
        }

    }
}

Controller.prototype.getAllProducts = function(callback) {
    this._getAllProducts(function(err, products) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, {
                aaData: products.map(utils.productToDataTable)
            });
        }
    });
}

Controller.prototype.getNewProducts = function(callback) {
    this._getContractorPrice(function(err, priceList) {
        this._getAllProducts(function(err, products) {
            console.log(products);
            callback(err, {
                aaData: catalog.getNewProducts(products, priceList).map(utils.productToDataTable)
            });
        });
    }.bind(this));
}

Controller.prototype.getMissingProducts = function(callback) {
    this._getContractorPrice(function(err, priceList) {
        this._getAllProducts(function(err, products) {
            console.log(products);
            callback(err, {
                aaData: catalog.checkAvailability(products, priceList).missing.map(utils.productToDataTable)
            });
        });
    }.bind(this));
}

Controller.prototype.getAvailableProducts = function(callback) {
    this._getContractorPrice(function(err, priceList) {
        this._getAllProducts(function(err, products) {
            console.log(products);
            callback(err, {
                aaData: catalog.checkAvailability(products, priceList).available.map(utils.productToDataTable)
            });
        });
    }.bind(this));
}

exports.Controller = Controller;
