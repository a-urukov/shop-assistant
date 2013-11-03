ProductModel = Backbone.Model.extend({

    idAttribute: '_id',

    defaults: {
        contractor: 'FineDesign'
    },

    validate: function() {
        var attrs = this.attributes;

        console.log(attrs.url);
        return Validate.isNotEmpty('name', attrs.name) || Validate.isNotEmpty('article', attrs.article) ||
            Validate.mustUrlPath('url', attrs.url);
    },

    url: 'admin/products/'

});
