var AdminPageModel = Backbone.Model.extend({

    default: {
        lastUpdate: new Date()
    },

    getActionName: function() {
        return 'admin/' + this.get('tab') + '/' + this.get('state');
    }
});
