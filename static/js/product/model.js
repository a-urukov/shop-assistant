ProductModel = Backbone.Model.extend({
    defaults: {
        category: 'uncategorized',
        price: 0
    },

    validate: function() {

    },

    url: function() {
        var attrs = this.attributes;

        return attrs.category + '/' + attrs.url
    }
});
