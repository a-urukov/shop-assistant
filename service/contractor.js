var iconv = require('iconv-lite'),
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

    this._getXml(function(err, xml) {

        if (err) { callback(err, null); return; }

        _this._parseXml(xml, callback);
    });
}

/**
 * Получение данных в виде XML с удаленного сервера поставщика
 * @param callback
 * @private
 */
Contractor.prototype._getXml = function(callback) {
    var xmlData = '',

        req = http.request(this._requestOptions, function(res) {

            res.setEncoding('binary');

            res.on('data', function(chunk) { xmlData += iconv.decode(new Buffer(chunk, 'binary'), 'win1251') });

            res.on('end', function() { callback(null, xmlData) });

            res.on('error', function(err) { callback('Can\'t sync data from contractor: ' + JSON.stringify(err), null) });
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
    var parser = utils.getXmlParser(),
        offer,
        products = [];

    while (offer = parser('offer', xml, true)) {
        var name = parser('name', offer.content),
            article = parser('article', offer.content),
            price = parser('price', offer.content);

        name && article && products.push({
            name: name.content,
            article: article.content,
            price: price && price.content,
            available: offer.attrs && (offer.attrs.available === 'true')
        });

    }

    callback(null, products);
}

exports.Contractor = Contractor;


