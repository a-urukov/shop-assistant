var AdminPageModel = Backbone.Model.extend({

    default: {
        lastUpdate: new Date()
    },

    getActionName: function() {
        return this.get('state') + '-' + this.get('tab');
    }
});
