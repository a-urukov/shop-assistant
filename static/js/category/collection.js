Categories = Backbone.Collection.extend({

    model: CategoryModel,

    getPotentialParents: function(model) {
        return this.without.apply(this, model.get('children').map(function(v) {
            return this.get(v._id);
        }, this).concat(model));
    }
});
