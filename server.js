var init = require('./init.js'),
    dataAdapter = new (require('./service/data-adapter.js').DataAdapter)({
        host: 'ylibashki.ru',
        user: 'ylibashki',
        password: 'jk98D(3nASd7akjdA&',
        database: 'ylibashki.ru'
    }),
    server = init.initServer(),
    io = init.initSocketIO();


dataAdapter.getAllProducts(function(err, products) { console.log(products.length) });

require('./routes.js').setRoutes(server);
require('./socket.js').initSocket(io);





