exports.CategoryView = Backbone.View.extend({

    initialize: function(options) {
        this.saveView = options.saveView;

        var editButton,
            delButton,
            el = this.$el;

        this.$('.b-category__edit').each(function() {
            var $this = $(this);

            el.is($this.closest('.b-category')) && (editButton = $this);
        });

        this.$('.b-category__delete').each(function() {
            var $this = $(this);

            el.is($this.closest('.b-category')) && (delButton = $this);
        });

        editButton && editButton.bind('click', function() {
            this.saveView.show(this.model);
        }.bind(this));

        delButton && delButton.bind('click', function() {
            if (confirm('Вы действительно хотите удалить категорию (все вложенные категории будут удалены)?')) {
                this.model.destroy();
            }
        }.bind(this));

    }
});
