var AdminPageRouter = require('./router').AdminPageRouter;

$(document).ready(function() {
    new AdminPageRouter();

    Backbone.history.start();
});

