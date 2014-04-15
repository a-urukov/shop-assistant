var connect = require('connect'),
    express = require('express'),
    config = require('./config'),
    app = express(),
    MongoClient = require('mongodb').MongoClient,
    dataAdapter,
    port = (process.env.PORT || 8080);

app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view options', { layout: false });
    app.use(connect.static(__dirname + '/static'));
    app.use(connect.bodyParser({ keepExtensions: true, uploadDir: './temp' }));
    app.use(express.cookieParser());
    app.use(function(req, res, next) {
        dataAdapter.getCategories(function(err, categories) {
            req.categories = categories;
            next();
        });
    });
    app.use(app.router);
});

MongoClient.connect(config.mongoConnectionString, {}, function(err, db) {
    if (err) {
        console.log(err);

        throw new Error(JSON.stringify(err));
    }

    dataAdapter = new (require('./service/data-adapter.js').DataAdapter)(db);
    require('./service/uploader.js').init(config.AWS_ACCESS_KEY_ID, config.AWS_SECRET_ACCESS_KEY, 'andrey-shop');
    require('./routes.js').setRoutes(app, dataAdapter);

    app.listen(port);
});


