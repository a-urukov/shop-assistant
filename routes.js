exports.setRoutes = function(server, controller) {

    server.get('/', function(req, res) {
        res.render('index.jade', {
            locals: {
                title: 'Your Page Title',
                description: 'Your Page Description',
                author: 'Your Name',
                analyticssiteid: 'XXXXXXX'
            }
        });
    });

    server.get('/all-products', function(req, res) {
        controller.getAllProducts(function(err, response) { res.send(response) });
    });

    server.get('/new-products', function(req, res) {
        controller.getNewProducts(function(err, response) { res.send(response) });
    });

    server.get('/available-products', function(req, res) {
        controller.getAvailableProducts(function(err, response) {
            res.send(response)
        });
    });

    server.get('/missing-products', function(req, res) {
        controller.getMissingProducts(function(err, response) {
            res.send(response)
        });
    });

    //A Route for Creating a 500 Error (Useful to keep around)
    server.get('/500', function(req, res) {
        throw new Error('This is a 500 Error');
    });

    //The 404 Route (ALWAYS Keep this as the last route)
    server.get('/*', function(req, res) {
        throw new NotFound;
    });
};
