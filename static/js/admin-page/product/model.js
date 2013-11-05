var Validate = require('../validate').Validate;

exports.ProductModel = Backbone.Model.extend({

    idAttribute: '_id',

    defaults: {
        contractor: 'FineDesign'
    },

    validate: function() {
        var attrs = this.attributes;

        console.log(attrs.url);
        return Validate.isNotEmpty('Наименование', attrs.name) || Validate.isNotEmpty('Артикл', attrs.article) ||
            Validate.mustUrlPath('url', attrs.url) || Validate.mustNumber('Наша цена', attrs.ourPrice) ||
            Validate.isNotEmpty('Наша цена', attrs.ourPrice) || Validate.mustNumber('Рекомендуемая цена', attrs.recPrice) ||
            Validate.mustNumber('Оптовая цена', attrs.optPrice);
    },

    url: 'admin/product/'

});
