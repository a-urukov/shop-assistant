require('../../utils/uploader.js');

var AbstractSaveView = require('../abstract-save-view').AbstractSaveView;

exports.SaveProductView = AbstractSaveView.extend({

    inputs: ['name', 'contractor', 'article', 'url', 'priority', 'optPrice',
        'recPrice', 'ourPrice', 'description', 'categories',
        { name: 'priority', value: 0 },
        { name: 'published', type: 'checkbox' },
        { name: 'available', type: 'checkbox' },
        { name: 'ignored', type: 'checkbox' }
    ],

    initialize: function(options) {
        var saveCallback = options.saveCallback;

        AbstractSaveView.prototype.initialize.apply(this, arguments);
        this.getCategories = options.getCategories;
        $('.ignored-checkbox, .published-checkbox').bind('change', function(e) {
            var $target = $(e.target);

            $target.prop('checked') &&
            $($target.hasClass('ignored-checkbox') ? '.published-checkbox' : '.ignored-checkbox').prop('checked', '');
        });

        this.on('success-submit', function() {
            saveCallback(this.model.get('ignored') ?
                'ignored' :
                this.model.get('published') ? 'published' : 'unpublished');
        });

        this.uploader = this.$el.find('.uploader').FileUploader();
    },

    show: function(model) {
        AbstractSaveView.prototype.show.apply(this, arguments);

        var categories = [];

        this.getCategories().forEach(function(category) {
            category.get('children').length || categories.push({
                id: category.id,
                text: category.get('name')
            })
        });

        _.find(this.inputs, function(input) {
            return input.name == 'categories';
        }).dom.select2({
            placeholder: 'нет категории',
            allowClear: true,
            multiple: true,
            data: categories
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

        _.find(this.inputs,function(input) {
            return input.name == 'priority';
        }).dom.select2({
            data: [0, 1, 2, 3, 4, 5].map(function(val) {
                return { id: val.toString(), text: val.toString() };
            })
        });

        this.images = this.model.get('images') || [];
        this._renderImagesList();
    },

    _renderImagesList: function() {
        var $imagesList = $('.images-list', this.$el);

        $imagesList.html(this.images.length ? '' : 'Нет загруженных изображений');

        this.images.forEach(function(img) {
            $imagesList.append('<div class="product-image"><img width="100px" height="100px" src="' + img.url +
                '" /><span></span></div>');
        });
    }
});


(function() {
})();
