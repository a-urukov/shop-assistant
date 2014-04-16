var utils = require('./service/utils'),
    uploader = require('./service/uploader'),
    Products = require('./controllers/products.js').ProductsController,
    Categories = require('./controllers/categories.js').CategoriesController,
    Contractors = require('./controllers/contractors.js').ContractorsController,

    /**
     * Обертка для игнора не xhr запросов
     * @param callback
     * @returns {Function}
     */
    xhr = function(callback) {

        return function(req, res, next) {
            if (!req.xhr) {
                next();
            } else {
                callback(req, res, next);
            }
        }
    },

    /**
     * Дефолтный колбэк для Ajax запросов
     * @param response
     * @param [processing]
     * @returns {Function}
     */
    sendingCallback = function(response, processing) {

        return function(err, data) {
            if (err) { throw new Error(JSON.stringify(err)) }

            if (typeof data !== 'object') data += '';

            response.send((processing ? processing(data) : data));
        }
    };

exports.setRoutes = function(app, dataAdapter) {
    var products = new Products(dataAdapter),
        categories = new Categories(dataAdapter),
        contractors = new Contractors(dataAdapter);

    /** PAGES **/

    app.get('/', function(req, res) {
        res.render('index.jade', {
            title: 'Интернет магазин – главная старница',
            description: 'shop assistant',
            author: 'Уруков Андрей',
            categories: req.categories
        });
    });

    app.get('/test', function(req, res) {
        res.render('index.jade', {
            title: 'Интернет магазин – главная старница',
            description: 'shop assistant',
            author: 'Уруков Андрей',
            categories: req.categories
        });
        
        console.log(req.headers['referer']);
    });

    app.get('/admin', function(req, res) {
        res.render('admin/admin.jade', {
            title: 'Интернет магазин – страница администрирования',
            description: 'shop assistant',
            author: 'Уруков Андрей',
            syncDate: new Date(),
            categories: req.categories
        });
    });

    app.get('/categories/:category', function(req, res, next) {
        categories.getCategoryByUrl(req.params.category, function(err, category) {
            if (err) {
                throw new Error(JSON.stringify(err));
            } else if (category) {
                products.getProductsByCategory(category._id, function(err, products) {
                    res.render('category.jade', {
                        title: 'THE SURPRISE – ' + category.name,
                        description: 'shop assistant',
                        category: category,
                        products: products,
                        categories: req.categories
                    });

                });
            } else {
                next();
            }
        })

    });

    /** PRODUCTS ADMINS GET **/

    /** Опубликованные товары **/
    app.get('/admin/products/published', function(req, res) {
        products.getPublished(function(err, data) { sendingCallback(res, utils.toDataTable)(err, data); });
    });

    /** Неопубликованные товары **/
    app.get('/admin/products/unpublished', xhr(function(req, res) {
        products.getUnpublished(sendingCallback(res, utils.toDataTable));
    }));

    /** Новые товары у поставщика **/
    app.get('/admin/products/new', function(req, res) {
        products.getNew(function(err, data) {
            sendingCallback(res, utils.toDataTable)(err, data);
        });
    });

    /** В наличии у поставщика **/
    app.get('/admin/products/available', xhr(function(req, res) {
        products.getAvailable(sendingCallback(res, utils.toDataTable));
    }));

    /** Нет в наличии **/
    app.get('/admin/products/missing', xhr(function(req, res) {
        products.getMissing(sendingCallback(res, utils.toDataTable));
    }));

    /** Загрузка изображения **/
    app.post('/admin/upload-image', function(req, res) {
        var path = req.files.image.path;

        uploader.uploadFile('/images/', path, function() {
            utils.getImageThumbnail(path, function(err, thumb) {
                uploader.uploadFile('/images/thumbs/', thumb, function() {
                    res.send({
                        img: path,
                        thumb: thumb
                    });
                });
            });
        });
    });

    /** Товары из черного списка **/
    app.get('/admin/products/ignored', xhr(function(req, res) {
        products.getIgnored(sendingCallback(res, utils.toDataTable));
    }));

    /** Групповое редактирование */
    app.post('/admin/products/actions/:action', xhr(function(req, res, next) {
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

    app.post('/admin/category/', saveCategory);
    app.put('/admin/category/:id', saveCategory);
    app.del('/admin/category/:id', xhr(function(req, res, next) {
        if (req.params.id) {
            categories.removeCategory(req.params.id, sendingCallback(res));
        } else {
            next();
        }
    }));

    /** PRODUCTS **/

    var saveProduct = xhr(function(req, res) {
        products.saveProduct(req.body, sendingCallback(res));
    });

    app.get('/admin/product/:id', xhr(function(req, res, next) {
        if (req.params.id) {
            products.getProduct(req.params.id, sendingCallback(res));
        } else {
            next();
        }
    }));
    app.post('/admin/product/', saveProduct);
    app.put('/admin/product/', saveProduct);

    /** CONTRACTORS **/

    app.post('/admin/contractors/sync', xhr(function(req, res) {
        contractors.sync(sendingCallback(res))
    }));

    //The 404 Route (ALWAYS Keep this as the last route)
    app.get('/*', function(req, res) {
        res.status(404).render('404.jade', {
            title: '404 - Not Found'
        });
    });

};
