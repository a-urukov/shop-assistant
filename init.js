var connect = require('connect'),
    express = require('express'),
    io = require('socket.io'),
    port = (process.env.PORT || 8080);

exports.initServer = function() {

    var server = express.createServer();

    server.configure(function() {
        server.set('views', __dirname + '/views');
        server.set('view options', { layout: false });
        server.use(connect.bodyParser());
        server.use(express.cookieParser());
        server.use(express.session({ secret: "shhhhhhhhh!"}));
        server.use(connect.static(__dirname + '/static'));
        server.use(express.logger());
        server.use(express.errorHandler());
        server.use(server.router);
    });


    server.error(function(err, req, res, next) {
        if (err instanceof NotFound) {
            res.render('404.jade', {
                locals: {
                    title: '404 - Not Found',
                    description: '',
                    author: '',
                    analyticssiteid: 'XXXXXXX'
                },
                status: 404
            });
        } else {
            res.render('500.jade', {
                locals: {
                    title: 'The Server Encountered an Error',
                    description: '',
                    author: '',
                    analyticssiteid: 'XXXXXXX',
                    error: err
                },
                status: 500
            });
        }
    });

    server.listen(port);

    return server;
};

exports.initSocketIO = function(server) {
    return io.listen(server);
};

NotFound = function(msg) {
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}

