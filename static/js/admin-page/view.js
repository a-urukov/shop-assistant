var AdminPageView = Backbone.View.extend({

    initialize: function(options) {
        _.bindAll(this, 'onModelChange');
        this.model.on('change', this.onModelChange);
        this.router = options.router;
    },

    events: {

        // Выбор категории товаров для отображения в dropdown
        'click .products-tab': function(e) {
            this.router.navigate('products/' + $(e.target).attr('products'), { trigger: true });
            e.preventDefault();
        },

        // Отображать описание при наведении
        'mouseover .product-name': function(e) {
            $(e.target).popover('show');
        },

        // Скрывать описание
        'mouseout .product-name': function(e) {
            $(e.target).popover('hide');
        },

        // Обработчик клика по кнопке action
        'click .action-btn': function(e) {
            var action = $(e.target).attr('data-action'),
                ids = $('.product-checkbox:checked').toArray().map(function(checkbox) {
                    return checkbox.value;
                });

            if (!ids.length) {
                alert('Не выбрано ни одного товара');

                return;
            }

            this._requestWithModal({
                title: 'Обновление ассортимента',
                waitText: 'Операция выполняется, пожалуйста, ждите...',
                successText: 'Ассортимент успешно обновлен!',
                errorText: 'Произошла ошибка!',
                autoClose: true,
                request: {
                    type: 'post',
                    url: 'admin/products/actions/' + action,
                    data: { ids: ids }
                },
                requestCallback: function() {
                    this._showProductsTab();
                },
                requestCtx: this
            })
        },

        // Добавить категорию
        'click #add-category': function() {
            this.model.set('tab', 'categories');
            this.saveCategoryView.show(new CategoryModel());
        },

        // Кнопка выбрать все
        'click .select-all': function() {
            $('.product-checkbox').each(function() {
                $(this).prop('checked', 'checked');
            })
        },

        // Кнопка сбросить выбор
        'click .deselect-all': function() {
            $('.product-checkbox').each(function() {
                $(this).prop('checked', '');
            })
        },

        // Обработчик клика по кнопке Синхронизация
        'click #sync-btn': function() {
            this._requestWithModal({
                title: 'Синхронизация',
                waitText: 'Синхронизация ассортимента, пожалуйста, ждите...',
                successText: 'Ассортимент успешно синхронизирован!',
                errorText: 'Ошибка синхронизации!',
                request: {
                    type: 'post',
                    url: 'admin/contractors/sync'
                },
                requestCallback: function() {
                    if (this.model.get('tab') === 'products') {
                        var state = this.model.get('state');

                        ['new', 'available', 'missing'].indexOf(state) != -1 && this._showProductsTab();
                    }
                },
                requestCtx: this
            });
        }

    },

    /**
     * Выполнение зaпроса к серверу с отображением диалогового окна
     * @param options
     * options.title – заголовок окна
     * options.waitText – текст в момент ожидания ответа
     * options.successText – текст успешного запроса
     * options.errorText – текст с сообщением об ошибке
     * options.request – параметры запроса
     * options.requestCallback – колбэк в случае успешного ответа
     * options.requestCtx – контекст
     * @private
     */
    _requestWithModal: function(options) {
        var waitModal = $('#wait-modal'),
            titleText = $('#wait-label'),
            btnOk = $('.btn-ok', waitModal),
            stateText = $('.state-text', waitModal);

        waitModal.modal('show');
        stateText.html(options.waitText);
        titleText.html(options.title);
        btnOk.button('loading');

        $.ajax(options.request)
            .done(function() {
                stateText.html(options.successText);
                options.requestCallback && options.requestCallback.call(options.requestCtx);
                if (options.autoClose) {
                    setTimeout(function() {
                        waitModal.modal('hide');
                    }, 700);
                }
            })
            .fail(function() { stateText.html(options.errorText) })
            .always(function() { btnOk.button('reset') })
    },

    /**
     * Обработчик изменения state и tab модели окна
     */
    onModelChange: function() {
        var tab = this.model.get('tab'),
            state = this.model.get('state');

        // активируем необходимую вкладку
        $('.nav-tab, .tab-pane').removeClass('active');
        $('.nav-tab_type_' + tab + ', .tab-pane_type_' + tab).addClass('active');

        // активируем необходимый toolbox
        $('.toolbox, .action-set').removeClass('active');
        $('.toolbox_tab_' + tab + ', .action-set_state_' + state).addClass('active');

        tab === 'products' && this._showProductsTab();
        tab === 'categories' && this._initCategoriesTab();
    },

    /**
     * Метод отображения списка товаров
     */
    _showProductsTab: function() {
        var state = this.model.get('state');


        if (['published', 'unpublished', 'new', 'available', 'missing', 'ignored'].indexOf(state) === -1) return;

        // обновляем метку категории товаров в табе
        $('.current-products-tab').html($('[products=' + state + ']').html());

        this.dataTable && this.dataTable.fnDestroy();
        this.dataTable = $('.data-table').dataTable({
            bProcessing: true,
            aLengthMenu: [
                [50, 100, 200, 300],
                [50, 100, 200, 300]
            ],
            iDisplayLength: 100,
            sAjaxSource: this.model.getActionName()
        });
    },

    /**
     * Инициализации вкладки категорий
     */
    _initCategoriesTab: function() {
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
            categories = [];

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
    }
});
