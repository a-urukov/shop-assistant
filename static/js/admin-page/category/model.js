var Validate = require('../validate').Validate;

exports.CategoryModel = Backbone.Model.extend({

    idAttribute: '_id',

    defaults: {
        posInMenu: 0,
        children: [],
        childrenIds: []
    },

    validate: function() {
        var attrs = this.attributes;

        return Validate.isNotEmpty('name', attrs.name) || Validate.mustUrlPath('url', attrs.url);
    },

    url: 'admin/categories/'
});
