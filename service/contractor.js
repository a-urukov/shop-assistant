var libxmljs = require('libxmljs'),
    Iconv = require('iconv').Iconv,
    http = require('http'),
    Buffer = require('buffer').Buffer;

/**
 * Работа с каталогом
 * @constructor
 */
function Contractor(options) {
    this._requestOptions = options;
}

/**
 * Загрузка прайс листа
 * @param callback
 */
Contractor.prototype.downloadPriceList = function(callback) {
    var _this = this;

    this._getXml(function(error, xml) {

        if (error) callback(error, null);

        _this._parseXml(xml, function(data) {
            callback(null, data);
        });
    });
}

/**
 * Получение данных в виде XML с удаленного сервера поставщика
 * @param callback
 * @private
 */
Contractor.prototype._getXml = function(callback) {
    var xmlData = '',
        converter = new Iconv('windows-1251', 'utf-8'),
        req = http.request(this._requestOptions, function(res) {

            res.setEncoding('binary');

            res.on('data', function(chunk) { xmlData += converter.convert(new Buffer(chunk, 'binary')).toString() });

            res.on('end', function() { callback(null, xmlData) });

            res.on('error', function(error) { callback("Can't sync data from contractor: " + JSON.stringify(error), null) });
        });

    req.end();
}

/**
 * Преобразование XML в JSON
 * @param callback
 * @param xml
 * @private
 */
Contractor.prototype._parseXml = function(xml, callback) {

    var xmlDoc = libxmljs.parseXml(xml.replace('windows-1251', 'utf-8'));

    callback(xmlDoc.get('//offers').find('offer').map(function(offer) {
        return {
            name: offer.get('name').text(),
            price: offer.get('price').text(),
            article: offer.get('article').text(),
            description: offer.get('description').text(),
            available: offer.attr('available') && offer.attr('available').value() == 'true'
        };
    }));
}

exports.Contractor = Contractor;
