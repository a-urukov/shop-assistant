var Contractor = require('../service/contractor.js').Contractor;

function ContractorsController(data) {
    this._data = data;
}

ContractorsController.prototype.sync = function(callback) {
    var contractor = new Contractor({
        host: 'www.suvenirow.ru',
        port: 80,
        path: '/xml/suvenirow.xml',
        method: 'GET'
    });

    contractor.downloadPriceList(function(err, data) {
        if (err) { callback(err); return; }

        this._data.syncContractorsData(data, callback);
    }.bind(this));
};

exports.ContractorsController = ContractorsController;
