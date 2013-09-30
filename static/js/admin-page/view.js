var AdminPageView = Backbone.View.extend({

    initialize: function(options) {
        _.bindAll(this, 'onModelChange');
        this.model.on('change', this.onModelChange);
        this.router = options.router;
    },

    events: {

        'click .products-tab': function(e) {
            this.router.navigate('products/' + $(e.target).attr('products'), { trigger: true });
            e.preventDefault();
        },

        'click #add-category': 'addCategory'
    },

    onModelChange: function() {
        var tab = this.model.get('tab'),
            state = this.model.get('state'),
            tabSelector = '[tab=' + tab + ']';

        // активируем необходимую вкладку
        $('.nav-tab, .tab-pane').removeClass('active');
        $('.nav-tab' + tabSelector + ' , .tab-pane' + tabSelector).addClass('active');

        tab === 'products' && this.showProductsTab(state);
        tab === 'categories' && this.initCategories();
    },

    showProductsTab: function(state) {
        if (['published', 'unpublished', 'new', 'available', 'missing', 'ignored'].indexOf(state) === -1) return;

        // обновляем метку категории товаров в табе
        $('.current-products-tab').html($('[products=' + state + ']').html());

        this.dataTable && this.dataTable.fnDestroy();
        this.dataTable = $('.data-table').dataTable({
            bProcessing: true,
            aLengthMenu: [
                [10, 30, 50, 100],
                [10, 30, 50, 100]
            ],
            iDisplayLength: 30,
            sAjaxSource: this.model.getActionName()
        });
    },

    initCategories: function() {
        if (this.model.has('categories')) return;

        var categoriesData = JSON.parse($('.b-categories').attr('data')),
            models = [],
            saveCategoryView = this.saveCategoryView ||
                (this.saveCategoryView = new SaveCategoryView({
                    el: $('#save-category-modal'),
                    getCategories: function() {
                        return this.model.get('categories');
                    }.bind(this)
                })),
            categories = this.categoriesViews = [];

        categoriesData && categoriesData.forEach(function prepare(category) {
            var model = new CategoryModel(category);

            models.push(model);
            categories.push(new CategoryView({
                el: $('.b-category[data-id=' + model.id + ']'),
                model: model,
                saveView: saveCategoryView
            }));
            category.children && category.children.forEach(prepare);
        });

        this.model.set({ categories: new Categories(models) });
    },

    addCategory: function() {
        this.initCategories();
        this.saveCategoryView.show(new CategoryModel());
    }
});
