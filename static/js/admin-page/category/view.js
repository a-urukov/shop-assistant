exports.CategoryView = Backbone.View.extend({

    initialize: function(options) {
        this.saveView = options.saveView;

        var editButton,
            el = this.$el;

        this.$('.b-category__edit').each(function() {
            var $this = $(this);

            el.is($this.closest('.b-category')) && (editButton = $this);
        });

        editButton && editButton.bind('click', function() {
            this.saveView.show(this.model);
        }.bind(this));
    }
});
