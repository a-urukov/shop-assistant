function PagesController(data) {
    this._data = data;
}

PagesController.prototype.adminPage = function(callback) {
    this._data.getCategories(function(err, categories) {
        callback(err, {
            lastUpdate: new Date(),
            categories: categories
        });
    });
};

PagesController.prototype.shopPage = function(callback) {
    this._data.getCategories(function(err, categories) {
        callback(err, {
            categories: categories
        });
    });
};

exports.PagesController = PagesController;
