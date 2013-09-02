exports.setRoutes = function(server, controller) {

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
        controller.adminPage(function(err, response) {
            res.render('admin.jade', {
                title: 'Интернет магазин – страница администрирования',
                description: 'shop assistant',
                author: 'Уруков Андрей',
                syncDate: response.lastUpdate,
                categories: response.categories
            });
        });
    });

    // проверку req.xhr перенести на middle layer
    server.get('/all-products', function(req, res, next) {
        if (!req.xhr) {
            next();
        } else {
            controller.getAllProducts(function(err, response) { res.send(response) });
        }
    });

    server.get('/new-products', function(req, res, next) {
        if (!req.xhr) {
            next();
        } else {
            controller.getNewProducts(function(err, response) { res.send(response) });
        }
    });

    server.get('/available-products', function(req, res, next) {
        if (!req.xhr) {
            next();
        } else {
            controller.getAvailableProducts(function(err, response) { res.send(response) });
        }
    });

    server.get('/missing-products', function(req, res, next) {
        if (!req.xhr) {
            next();
        } else {
            controller.getMissingProducts(function(err, response) { res.send(response) });
        }
    });

    server.get('/sync-data', function(req, res, next) {
        if (!req.xhr) {
            next();
        } else {
            controller.syncData(function(err, response) {
                res.send(response)
            });
        }
    });

    server.post('/catalog/', function(req, res, next) {
        controller.saveCategory(req.body, function(err, category) {
            err && console.log(JSON.stringify(err));
            res.send(category ? { id: category._id } : err || 'Error adding category');
        })
    });

    server.put('/catalog/', function(req, res, next) {
        controller.saveCategory(req.body, function(err, category) {
            err && console.log(JSON.stringify(err));
            res.send(category ? { id: category._id } : err || 'Error updating category');
        })
    });

    server.post('/uncategorized/no-name', function(req, res) {
        res.send({ id: 1 })
    });

    server.put('/uncategorized/no-name', function(req, res) {
        res.send('The best success')
    });

    //The 404 Route (ALWAYS Keep this as the last route)
    server.get('/*', function(req, res) {
        throw new NotFound;
    });
};
