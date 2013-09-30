function CategoriesController(data) {
    this._data = data;
}

CategoriesController.prototype.saveCategory = function(category, callback) {
    return this._data.saveCategory(category, callback);
};

exports.CategoriesController = CategoriesController;
