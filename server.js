var init = require('./init.js'),
    dataAdapter = new (require('./service/data-adapter.js').DataAdapter)({
        host: 'ylibashki.ru',
        user: 'ylibashki',
        password: 'jk98D(3nASd7akjdA&',
        database: 'ylibashki.ru'
    }),
    server = init.initServer(),
    contractor = new (require('./service/contractor.js').Contractor)(),
    controller = new (require('./controller').Controller)(dataAdapter, contractor),
    io = init.initSocketIO();

require('./routes.js').setRoutes(server, controller);
require('./socket.js').initSocket(io);

//TODO выводить категорию в таблицу



