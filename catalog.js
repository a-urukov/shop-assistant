/**
 * Загрузка прайс-листа с удаленного сервера
 * @constructor
 */
function CatalogDownloader() {
    this._metrics = new TimeMetrics();
    this._requestOptions = {
        host: 'www.suvenirow.ru',
        port: 80,
        path: '/xml/suvenirow.xml',
        method: 'GET'
    };
}

/**
 * Загрузка прайс листа (пробрасывается в виде JSON в callback)
 * @param callback
 */
CatalogDownloader.prototype.download = function(callback) {
    console.log('Start request data from remote host');
    var _this = this;

    this._getXml(function(xml) {
        _this._metrics.writeTimeMark('Xml data received', true);
        _this._parseXml(xml, function(data) {
            _this._metrics.writeTimeMark('Parsing xml data finished');
            callback(data);
        });
    });
}

/**
 * Получение данных в виде XML с удаленного сервера
 * @param callback
 * @private
 */
CatalogDownloader.prototype._getXml = function(callback) {
    var xmlData = '',
        converter = new Iconv('windows-1251', 'utf8'),
        req = http.request(this._requestOptions, function(res) {

            res.setEncoding('binary');

            res.on('data', function(chunk) { xmlData += converter.convert(new Buffer(chunk, 'binary')).toString(); });

            res.on('end', function() { callback(xmlData); });

            res.on('error', function(error) { console.log(error); });
        });

    req.end();
}

/**
 * Преобразование XML в JSON
 * @param callback
 * @private
 */
CatalogDownloader.prototype._parseXml = function(xml, callback) {
    var xmlDoc = libxmljs.parseXml(xml);

    callback(xmlDoc.get('//offers').find('offer').map(function(offer) {
        return {
            name: offer.get('name').text(),
            price: offer.get('price').text(),
            article: offer.get('article').text(),
            description: offer.get('description').text(),
            published: offer.attr('available').value() == 'true'
        };
    }));
}

exports.Downloader = CatalogDownloader;
