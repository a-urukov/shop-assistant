SaveCategoryView = AbstractSaveView.extend({

    inputs: ['name', 'url', 'description',
        'parentId', 'nameInMenu', 'posInMenu',
        {
            name: 'published',
            type: 'checkbox'
        }
    ],

    initialize: function(options) {
        AbstractSaveView.prototype.initialize.apply(this, arguments);
        this.getCategories = options.getCategories;
    },

    show: function(model) {
        AbstractSaveView.prototype.show.apply(this, arguments);

        _.find(this.inputs, function(input) {
            return input.name == 'parentId';
        }).dom.select2({
            placeholder: 'нет родительской категории',
            allowClear: true,
            data: this.getCategories().getPotentialParents(this.model).map(function(m) {
                return {
                    id: m.id,
                    text: m.get('name')
                }
            })
        });
    }
});
