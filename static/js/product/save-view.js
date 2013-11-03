SaveProductView = AbstractSaveView.extend({

    inputs: ['name', 'contractor', 'article', 'url', 'priority', 'optPrice',
        'recPrice', 'ourPrice', 'description', 'categories',
        { name: 'published', type: 'checkbox' },
        { name: 'available', type: 'checkbox' },
        { name: 'ignored', type: 'checkbox' }
    ],

    initialize: function(options) {
        AbstractSaveView.prototype.initialize.apply(this, arguments);
        this.getCategories = options.getCategories;
        $('.ignored-checkbox, .published-checkbox').bind('change', function(e) {
            var $target = $(e.target);

            $target.prop('checked') &&
            $($target.hasClass('ignored-checkbox') ? '.published-checkbox' : '.ignored-checkbox').prop('checked', '');
        });
    },

    show: function(model) {
        AbstractSaveView.prototype.show.apply(this, arguments);

        _.find(this.inputs, function(input) {
            return input.name == 'categories';
        }).dom.select2({
            placeholder: 'нет категории',
            allowClear: true,
            multiple: true,
            data: this.getCategories().map(function(m) {
                return {
                    id: m.id,
                    text: m.get('name')
                }
            })
        });

        _.find(this.inputs, function(input) {
            return input.name == 'contractor';
        }).dom.select2({
            data: [
                { id: 'FineDesign', text: 'FineDesign' },
                { id: 'All4Gigt', text: 'All4Gigt' },
                { id: 'Эврика', text: 'Эврика' },
                { id: 'Megamind', text: 'Megamind' }
            ]
        });
    }
});
