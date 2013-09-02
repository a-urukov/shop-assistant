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
        'categories': 'getCategories',
        'analysis': 'getAnalysis',
        'products/:state': 'getProducts'
    },

    getCategories: function() {
        this.model.set({ tab: 'categories' });
    },

    getAnalysis: function() {
        this.model.set({ tab: 'analysis' });
    },

    getProducts: function(state) {
        this.model.set({
            tab: 'products',
            state: state || 'all'
        });
    }

});
