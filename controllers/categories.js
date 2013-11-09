function CategoriesController(data) {
    this._data = data;
}

CategoriesController.prototype.saveCategory = function(category, callback) {
    return this._data.saveCategory(category, callback);
};

CategoriesController.prototype.removeCategory = function(id, callback) {
    return this._data.removeCategory(id, callback);
};

exports.CategoriesController = CategoriesController;
