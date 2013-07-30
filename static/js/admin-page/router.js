var AdminPageRouter = Backbone.Router.extend({

    initialize: function() {
        this.model = new AdminPageModel();
        this.view = new AdminPageView({
            model: this.model,
            router: this,
            el: $('body')
        });
    },

    routes: {
        '': 'getProducts',
        'products/:state': 'getProducts'
    },

    getProducts: function(state) {
        this.model.set('state', state || 'missing');
    }
});
