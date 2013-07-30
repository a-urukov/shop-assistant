exports.setRoutes = function(server, controller) {

    server.get('/', function(req, res) {
        controller.indexPage(function(err, response) {
            res.render('index.jade', {
                locals: {
                    title: 'Анализ ассортимента «Улыбашки»',
                    description: 'Анализ ассортимента «Улыбашки»',
                    author: 'Уруков Андрей',
                    syncDate: response.lastUpdate
                }
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

    //The 404 Route (ALWAYS Keep this as the last route)
    server.get('/*', function(req, res) {
        throw new NotFound;
    });
};
