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
 * @param price
 * @returns {number}
 */
function getOurPrice(price) {
    if (!price) return 0;

    var newPrice = (isNaN(price) ? 0 : price) * FACTOR_PRICES,
        k = [500, 1500, 3000, 5000];

    for (var i = 0; k[i] < newPrice && i < k.length; i++) {
        newPrice *= 0.93;
    }

    if (newPrice > 200) {
        var m = newPrice % 100;
        (m < 30) && (newPrice -= m);
    }

    newPrice && (newPrice -= newPrice % 10 + 1);

    return newPrice;
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

/**
 * Представление товара в форамате строки компонента DataRow
 * @param product
 * @returns {Array}
 */
function productToDataTable(product) {
    return [
        product.article,
        product.name,
        product.price,
        product.description ? product.description.substr(0, 300) + '...' : 'отсутствует',
        product.available ? '+' : '-'
    ];
}

/**
 * Транзакция (набор запросов выполняемых параллельно)
 * @param queries массив запросов (может быть задано кол-во выполнений)
 * @param callback вызывается после выполнения ВСЕХ запросов составляющих транзакцию
 * @constructor
 */
function MultiQuery(queries, callback) {

    var q = this._queries = {};

    queries.forEach(function(v) {
        if (typeof v === 'string') {
            q[v] = 1;
        } else {
            q[v.name] = v.count;
        }
    });

    this._callback = callback;
}

/**
 * Функция вызывается при каждом выполнении запроса транзакции, при выполнении всех запросов вызывается callback
 * @param err ошибка
 * @param queryName имя выполненного запроса
 * @public
 */
MultiQuery.prototype.completeQuery = function(err, queryName) {

    var completed = true;

    if (err) {
        this._errors || (this._errors = []);
        this._errors.push(err);
    }
    this._queries[queryName] && this._queries[queryName]--;

    for (var q in this._queries) {
        if (this._queries[q]) {
            completed = false;
            break;
        }
    }

    completed && this.terminate();
}

/**
 * Завершение транзакции
 * @public
 */
MultiQuery.prototype.terminate = function() {
    this._callback(this._errors);
}


exports.TimeMetrics = TimeMetrics;
exports.MultiQuery = MultiQuery;

exports.utils = {
    addRowLogMessage: addRowLogMessage,
    getOurPrice: getOurPrice,
    sync: sync,
    downloadFile: downloadFile,
    productToDataTable: productToDataTable
};
