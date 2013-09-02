SaveCategoryView = Backbone.View.extend({

    inputs: ['name', 'url', 'description', 'parentId', 'nameInMenu', 'posInMenu', 'published'],

    initialize: function(options) {
        this.inputs.forEach(function(name) {
            var input = this.$('[data-model-field=' + name + ']');

            input && (this[name + '-input'] = input);
        }, this);

        this.getCategories = options.getCategories;
        this.error = this.$('.error');
        this.errorMessage = this.$('.alert-error');
    },

    show: function(model) {
        this.model = model;

        this.inputs.forEach(function(name) {
            var val = this.model.get(name);

            if (name === 'published') {
                val ?
                    this['published-input'].attr('checked', 'checked') :
                    this['published-input'].removeAttr('checked');
            } else {
                this[name + '-input'].val(typeof val === 'undefined' ? '' : val);
            }
        }, this);


        this['parentId-input'] = this['parentId-input'].select2({
            placeholder: 'нет родительской категории',
            allowClear: true,
            data: this.getCategories().getPotentialParents(this.model).map(function(m) {
                return {
                    id: m.id,
                    text: m.get('name')
                }
            })
        });

        this.$el.modal();
        this.error.hide();
    },

    events: {
        'click #save-category': 'onSubmit'
    },

    onSubmit: function() {
        var isNew = this.model.isNew(),
            modelState = {};

        this.inputs.forEach(function(name) {
            modelState[name] = name === 'published' ? this['published-input'].prop('checked') : this[name + '-input'].val();
        }, this);
        this.model.set(modelState);

        if (!this.model.save()) {
            this.errorMessage.html(this.model.validationError);
            this.error.show();
            this.$('.modal-body').scrollTop(0);
        } else {
            this.$el.modal('hide');
        }
    }

});
