var xhr = function(callback) {

        return function(req, res, next) {
            if (!req.xhr) {
                next();
            } else {
                callback(req, res, next);
            }
        }
    },

    sendingCallback = function(response) {

        return function(err, data) {
            if (err) {
                throw new Error(JSON.stringify(err));
            }
            response.send(data);
        }
    };

exports.setRoutes = function(server, controllers) {
    var products = controllers.products,
        pages = controllers.pages,
        categories = controllers.categories;

    server.get('/', function(req, res) {
        res.render('index.jade', {
            locals: {
                title: 'Интернет магазин – главная старница',
                description: 'shop assistant',
                author: 'Уруков Андрей'
            }
        });
    });

    server.get('/admin', function(req, res) {
        pages.adminPage(function(err, data) {
            res.render('admin.jade', {
                title: 'Интернет магазин – страница администрирования',
                description: 'shop assistant',
                author: 'Уруков Андрей',
                syncDate: data.lastUpdate,
                categories: data.categories
            });
        });
    });

    server.get('/admin/products/published', xhr(function(req, res) {
        products.getPublished(sendingCallback(res));
    }));

    server.get('/admin/products/unpublished', xhr(function(req, res) {
        products.getUnpublished(sendingCallback(res));
    }));

    server.get('/admin/products/new', xhr(function(req, res) {
        products.getNew(sendingCallback(res));
    }));

    server.get('/admin/products/available', xhr(function(req, res) {
        products.getAvailable(sendingCallback(res));
    }));

    server.get('/admin/products/missing', xhr(function(req, res) {
        products.getMissing(sendingCallback(res));
    }));

    server.get('/admin/products/ignored', xhr(function(req, res) {
        products.getIgnored(sendingCallback(res));
    }));

    var saveCategory = xhr(function(req, res) {
        categories.saveCategory(req.body, sendingCallback(res));
    });

    server.post('/admin/categories/', saveCategory);
    server.put('/admin/categories/', saveCategory);

    server.post('/uncategorized/no-name', function(req, res) {
        res.send({ id: 1 });
    });

    server.put('/uncategorized/no-name', function(req, res) {
        res.send('The best success');
    });

    //The 404 Route (ALWAYS Keep this as the last route)
    server.get('/*', function(req, res) {
        throw new NotFound;
    });
};
