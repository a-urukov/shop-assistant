var FACTOR_PRICES = 1.9,
    fs = require('fs'),
    path = require('path');

/**
 * Класс для замера времени выполнения
 * @constructor
 */
function TimeMetrics() {
   var startTime = Date.now();

   this.writeTimeMark = function(str, reset) {
       console.log((str ? str + ': ' : '') + (Date.now() - startTime));
       reset && this.reset();
   };

   this.reset = function() { startTime = Date.now() };

   this.writeTime = function(str, reset) {
       var i = Date.now() - startTime,
           m = Math.floor(i / 60000),
           s = Math.floor((i - m * 60000) / 1000);

       console.log('%s: %s:%s', str, m < 10 ? '0' + m : m, s < 10 ? '0' + s : s);
       reset && this.reset();
   };
}

/**
 * Печать сообщения о добавлении строки в таблицу
 * @param err
 * @param tableName
 */
function addRowLogMessage(err, tableName) {
    if (err) {
        console.log(err);
    } else {
        console.log('Добавлена строка в %s', tableName);
    }
}

/**
 * Вычисление цены товара
 * @param product
 * @returns {number}
 */
function getOurPrice(product) {
    if (!product) return 0;

    var price = (isNaN(product.price) ? 0 : product.price) * FACTOR_PRICES,
        k = [500, 1500, 3000, 5000];

    for (var i = 0; k[i] < price && i < k.length; i++) {
        price *= 0.93;
    }

    if (price > 200) {
        var m = price % 100;
        (m < 30) && (price -= m);
    }

    price && (price -= price % 10 + 1);

    return price;
}

function executeMethodSync(n, items, options) {
    var method = options.method || function(i, c) { console.log(i); c(); },
        callback = options.callback,
        verbose = options.verbose,
        ctx = options.ctx;

    if (n >= items.length) {
        callback && callback();
        console.log('Выполнение операций успешно завершено');
        return;
    }

    var _this = ctx || this;
    method.call(ctx, items[n], function(err) {
        err && console.log(err);
        verbose && console.log('%d% операций выполнено (%d из %d)', Math.round((n + 1) / items.length * 100), n + 1, items.length);
        verbose && options.metrics.writeTime('Затрачено времени (мин:cек)');
        executeMethodSync(n + 1, items, options);
    });
}

/**
 * Синхронное выполнение операции для коллекции объектов
 * @param items
 * @param options
 */
function sync(items, options) {
    options.verbose && (options.metrics = new TimeMetrics());
    executeMethodSync(0, items, options)
}

/**
 * Загрузка файлов с удаленного хоста
 * @param src { host, path }
 * @param dest
 * @param callback
 */
function downloadFile(src, dest, callback) {

    var t = src.path.split('/'),
        fileName = dest + (dest[dest.length - 1] != '/' ? '/' : '') + t[t.length - 1];

    if (path.existsSync(fileName)) {
        console.log('Файл %s существует', fileName);
        callback && callback();
        return;
    }

    console.log('Загрузка файла %s в %s', src.host + '/' + src.path, fileName);

    var writeStream = fs.createWriteStream(fileName),
        options = {
            host: src.host,
            path: src.path,
            port: 80,
            method: 'GET'
        },

        req = http.request(options, function(res) {

            res.pipe(writeStream);

            res.on('end', function() { callback && callback() });

            res.on('error', function(error) { callback('Ошибка при загрузки файла. Подробнее: error') });

        });

    req.end();
}

exports.TimeMetrics = TimeMetrics;

exports.utils = {
    addRowLogMessage: addRowLogMessage,
    getOurPrice: getOurPrice,
    sync: sync,
    downloadFile: downloadFile
};
