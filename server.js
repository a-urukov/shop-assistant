var init = require('./init.js'),
    server = init.initServer(),
    io = init.initSocketIO();

require('./routes.js').setRoutes(server);
require('./socket.js').initSocket(io);



