exports.AbstractSaveView = Backbone.View.extend({

    initialize: function() {
        this.error = this.$('.error');
        this.errorMessage = this.$('.alert-error');

        if (!this.inputs) return;

        this.inputs = this.inputs.map(function(input) {
            typeof input !== 'object' && (input = { name: input });
            input.dom = this.$('[data-model-field=' + input.name + ']');

            return input;
        }, this);
    },

    events: {
        'click .submit-btn': 'onSubmit'
    },

    show: function(model) {
        this.model = model;

        this.inputs && this.inputs.forEach(function(input) {
            if (!input.dom) return;

            var val = this.model.get(input.name);

            if (input.type == 'checkbox') {
                input.dom.prop('checked', val ? 'checked' : '');
            } else {
                input.dom.val(typeof val === 'undefined' ? '' : val);
            }
        }, this);

        this.$el.modal();
        this.error.hide();
    },

    onSubmit: function() {
        var modelState = {};

        this.inputs && this.inputs.forEach(function(input) {
            input.dom &&
                (modelState[input.name] = input.type == 'checkbox' ? input.dom.prop('checked') : input.dom.val());
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
