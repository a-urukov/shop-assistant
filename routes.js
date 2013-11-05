var xhr = function(callback) {

        return function(req, res, next) {
            if (!req.xhr) {
                next();
            } else {
                callback(req, res, next);
            }
        }
    },

    sendingCallback = function(response, processing) {

        return function(err, data) {
            if (err) { throw new Error(JSON.stringify(err)) }

            if (typeof data !== 'object') data += '';

            response.send((processing ? processing(data) : data));
        }
    };

exports.setRoutes = function(server, controllers) {
    var products = controllers.products,
        pages = controllers.pages,
        categories = controllers.categories,
        contractors = controllers.contractors;

    /** PAGES **/

    server.get('/', function(req, res) {
        res.render('index.jade', {
            title: 'Интернет магазин – главная старница',
            description: 'shop assistant',
            author: 'Уруков Андрей'
        });
    });

    server.get('/admin', function(req, res) {
        pages.adminPage(function(err, data) {
            res.render('admin/admin.jade', {
                title: 'Интернет магазин – страница администрирования',
                description: 'shop assistant',
                author: 'Уруков Андрей',
                syncDate: data.lastUpdate,
                categories: data.categories
            });
        });
    });

    /** PRODUCTS ADMINS GET **/

    /** Опубликованные товары **/
    server.get('/admin/products/published', xhr(function(req, res) {
        products.getPublished(sendingCallback(res, utils.toDataTable));
    }));

    /** Неопубликованные товары **/
    server.get('/admin/products/unpublished', xhr(function(req, res) {
        products.getUnpublished(sendingCallback(res, utils.toDataTable));
    }));

    /** Новые товары у поставщика **/
    server.get('/admin/products/new', xhr(function(req, res) {
        products.getNew(sendingCallback(res, utils.toDataTable));
    }));

    /** В наличии у поставщика **/
    server.get('/admin/products/available', xhr(function(req, res) {
        products.getAvailable(sendingCallback(res, utils.toDataTable));
    }));

    /** Нет в наличии **/
    server.get('/admin/products/missing', xhr(function(req, res) {
        products.getMissing(sendingCallback(res, utils.toDataTable));
    }));

    /** Товары из черного списка **/
    server.get('/admin/products/ignored', xhr(function(req, res) {
        products.getIgnored(sendingCallback(res, utils.toDataTable));
    }));

    /** Групповое редактирование */
    server.post('/admin/products/actions/:action', xhr(function(req, res, next) {
        var action = req.params.action,
            ids = req.body.ids;

        if (['publish', 'unpublish', 'ignore', 'unignore', 'actualize', 'add-from-contractor', 'remove'].indexOf(action) == -1 ||
            !ids || !ids.length) {

            next();

            return;
        }

        products.groupАctions(action, ids, sendingCallback(res));
    }));

    /** CATEGORY **/

    var saveCategory = xhr(function(req, res) {
        categories.saveCategory(req.body, sendingCallback(res));
    });

    server.post('/admin/categories/', saveCategory);
    server.put('/admin/categories/', saveCategory);

    /** PRODUCTS **/

    var saveProduct = xhr(function(req, res) {
        products.saveProduct(req.body, sendingCallback(res));
    });

    server.get('/admin/product/:id', xhr(function(req, res, next) {
        if (req.params.id) {
            products.getProduct(req.params.id, sendingCallback(res));

        } else {
            next();
        }
    }));
    server.post('/admin/product/', saveProduct);
    server.put('/admin/product/', saveProduct);


    /** CONTRACTORS **/

    server.post('/admin/contractors/sync', xhr(function(req, res) {
        contractors.sync(sendingCallback(res))
    }));

    //The 404 Route (ALWAYS Keep this as the last route)
    server.get('/*', function(req, res) {
        res.status(404).render('404.jade', {
            title: '404 - Not Found'
        });
    });

};
