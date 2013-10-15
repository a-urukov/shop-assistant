utils = require('./service/utils.js').utils;
NotFound = function(msg) {
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
};

var connect = require('connect'),
    express = require('express'),
    server = express(),
    MongoClient = require('mongodb').MongoClient,
    dataAdapter,
    port = (process.env.PORT || 8080),
    ProductsController = require('./controllers/products.js').ProductsController,
    PagesController = require('./controllers/pages.js').PagesController,
    CategoriesController = require('./controllers/categories.js').CategoriesController,
    ContractorsController = require('./controllers/contractors.js').ContractorsController;

server.configure(function() {
    server.set('views', __dirname + '/views');
    server.set('view options', { layout: false });
    server.use(connect.bodyParser());
    server.use(express.cookieParser());
    server.use(connect.static(__dirname + '/static'));
    server.use(express.logger());
    server.use(express.errorHandler());
    server.use(server.router);
});

MongoClient.connect('mongodb://127.0.0.1:27017/surprise', {}, function(err, db) {

    if (err) throw new Error(JSON.stringify(err));

    dataAdapter = new (require('./service/data-adapter.js').DataAdapter)(db);

    require('./routes.js').setRoutes(server, {
        products: new ProductsController(dataAdapter),
        pages: new PagesController(dataAdapter),
        categories: new CategoriesController(dataAdapter),
        contractors: new ContractorsController(dataAdapter)
    });

    server.listen(port);
});

