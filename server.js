utils = require('./service/utils.js').utils;

var init = require('./init.js'),
    dataAdapter = new (require('./service/data-adapter.js').DataAdapter)({
        host: 'ylibashki.ru',
        user: 'ylibashki',
        password: 'jk98D(3nASd7akjdA&',
        database: 'ylibashki.ru'
    }),
    server = init.initServer(),
    contractor = new (require('./service/contractor.js').Contractor)(),
    cache = new (require('./cache.js')).Cache(),
    controller = new (require('./controller').Controller)(cache),
    io = init.initSocketIO();

cache.register('contractorPrices', contractor.downloadPriceList, contractor);
cache.register('allProducts', dataAdapter.getAllProducts, dataAdapter);

require('./routes.js').setRoutes(server, controller);
require('./socket.js').initSocket(io);

//TODO выводить категорию в таблицу



