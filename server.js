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
    contractor = new (require('./service/contractor.js').Contractor)({
        host: 'www.suvenirow.ru',
        port: 80,
        path: '/xml/suvenirow.xml',
        method: 'GET'
    }),
    cache = new (require('./cache.js')).Cache(),
    controller,
    port = (process.env.PORT || 8080);


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

//server.error(function(err, req, res, next) {
//    if (err instanceof NotFound) {
//        res.render('404.jade', {
//            locals: {
//                title: '404 - Not Found',
//                description: '',
//                author: '',
//                analyticssiteid: 'XXXXXXX'
//            },
//            status: 404
//        });
//    } else {
//        res.render('500.jade', {
//            locals: {
//                title: 'The Server Encountered an Error',
//                description: '',
//                author: '',
//                analyticssiteid: 'XXXXXXX',
//                error: err
//            },
//            status: 500
//        });
//    }
//});

//MongoClient.connect('mongodb://nodejitsu:a3c449c508f7e1eb377af56f4b526dd3@dharma.mongohq.com:10000/nodejitsudb1870458715', function(err, db) {
MongoClient.connect('mongodb://127.0.0.1:27017/surprise', function(err, db) {

    if (err) throw new Error(err);

    dataAdapter = new (require('./service/data-adapter.js').DataAdapter)(db);
    controller = new (require('./controller').Controller)(cache, dataAdapter);

    cache.register('contractorPrices', contractor.downloadPriceList, contractor);
    cache.register('allProducts', dataAdapter.getAllProducts, dataAdapter);

    require('./routes.js').setRoutes(server, controller);

    server.listen(port);
});

