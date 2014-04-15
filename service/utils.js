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
        methodCallback = options.methodCallback,
        callback = options.callback,
        verbose = options.verbose,
        ctx = options.ctx;

    if (n >= items.length) {
        callback && callback();
        verbose && console.log('Выполнение операций успешно завершено');

        return;
    }

    method.call(ctx, items[n], function(err, res) {
        if (err) { callback(err); return; }

        methodCallback && methodCallback(err, res, items[n]);
        verbose && console.log('%d% операций выполнено (%d из %d)', Math.round((n + 1) / items.length * 100), n + 1, items.length);
        verbose && options.metrics.writeTime('Затрачено времени (мин:cек)');
        executeMethodSync(n + 1, items, options);
    });
}

/**
 * Синхронное выполнение операции для коллекции объектов
 * @param items
 * @param options опции
 * method - операция
 * callback - колбэк вызываемый после выполнения всех операций
 * methodCallback - колбэк вызываем после выполнения каждой операции
 * ctx - контекст выполнения method
 * verbose - подробный вывод
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
 * Преобразование наименования в url (транслитерация и замена пробелов на дефис)
 * @param {String} name
 * @returns {String}
 */
function nameToUrl(name) {
    var rules = {'Ё': 'YO', 'Й': 'I', 'Ц': 'TS', 'У': 'U', 'К': 'K', 'Е': 'E', 'Н': 'N', 'Г': 'G', 'Ш': 'SH', 'Щ': 'SCH', 'З': 'Z', 'Х': 'H', 'Ъ': '', 'ё': 'yo', 'й': 'i', 'ц': 'ts', 'у': 'u', 'к': 'k', 'е': 'e', 'н': 'n', 'г': 'g', 'ш': 'sh', 'щ': 'sch', 'з': 'z', 'х': 'h', 'ъ': '', 'Ф': 'F', 'Ы': 'I', 'В': 'V', 'А': 'a', 'П': 'P', 'Р': 'R', 'О': 'O', 'Л': 'L', 'Д': 'D', 'Ж': 'ZH', 'Э': 'E', 'ф': 'f', 'ы': 'i', 'в': 'v', 'а': 'a', 'п': 'p', 'р': 'r', 'о': 'o', 'л': 'l', 'д': 'd', 'ж': 'zh', 'э': 'e', 'Я': 'Ya', 'Ч': 'CH', 'С': 'S', 'М': 'M', 'И': 'I', 'Т': 'T', 'Ь': '', 'Б': 'B', 'Ю': 'YU', 'я': 'ya', 'ч': 'ch', 'с': 's', 'м': 'm', 'и': 'i', 'т': 't', 'ь': '', 'б': 'b', 'ю': 'yu', ' ': '-'};

    return name && name.split('').map(function(symbol) {
        return rules[symbol];
    }).join('').toLowerCase();
};

/**
 * Поверхностная копия объекта
 * @param obj
 * @returns {Object}
 */
function clone(obj) {
    var copy = {};

    for (var f in obj) {
        if (obj.hasOwnProperty(f)) copy[f] = obj[f];
    }

    return copy;
}

/**
 * Представление товара в форамате компонента DataTable
 * @param {Array} products
 * @returns {Object}
 */
function toDataTable(products) {
    return {
        aaData: products.map(function(product) {
            var name = product.name,
                priority = product.priority || '0',
                label = (function() {
                    switch (+priority) {
                        case 1:
                            return '';
                        case 2:
                            return 'info';
                        case 3:
                            return 'success';
                        case 4:
                            return 'warning';
                        case 5:
                            return 'important';
                        default:
                            return 'inverse';
                    }
                })();
                id = product._id;

            return [
                product.article,
                '<a class="product-name" href="#" data-title="' + name + '" data-content="' +
                    (product.description || 'Описание отсутствует') + '">' + name + '</a>',
                product.optPrice || '-',
                product.recPrice || '-',
                product.ourPrice || '-',
                product.categories ?
                    product.categories.map(function(c) { return c.name }).join(', ') :
                   '(нет категории)',
                product.contractor || '–',
                '<span class="label ' + 'label-' + label + '">' + priority + '</span>',
                product.available ? '+' : '-',
                '<button class="btn btn-info edit-product" data-product-id="' + id + '">Редактировать</button>',
                '<input type="checkbox" value=' + id + ' class="product-checkbox">'
            ]
        })
    };
}

/**
 * @deprecated актуально для SQL
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
};


/**
 * Завершение транзакции
 * @public
 */
MultiQuery.prototype.terminate = function() {
    this._callback(this._errors);
};

/**
 * Возвращает простой парсер xml, принимает тег и строку xml, возвращает аттрибуты и контент
 * @returns {Function}
 */
function getXmlParser() {
    var regs = {},
        attrReg = /([A-z]+)="(\S+)"/gi

    return function(tag, str, multi) {
        if (!regs[tag]) (regs[tag] = new RegExp('(<' + tag + '>|<' + tag + '[^A-z1-9>]+(\.*?)>)((\.|\n)*?)</' + tag + '>', 'i' + (multi ? 'g' : '')));

        var res = regs[tag].exec(str);

        return res && {
            attrs: res[2] && (function(str) {
                var result = {},
                    attr;

                while (attr = attrReg.exec(str)) {
                    attr[1] && (result[attr[1]] = attr[2]);
                }

                return result;
            })(res[2]),
            content: res[3]
        }
    }
}

/**
 * Получение превью изображения
 * src {String} – путь к файлу
 * callback – прокидывается path, stream
 */
function getImageThumbnail(src, callback) {
    var reg = src.match(/(.*[A-z\.\-0-9_А-я]+)(\.[A-z0-9]+)$/),
        thumb = reg[1] + '_thumb' + reg[2];

    require('imagemagick').resize({
        srcPath: src,
        dstPath: thumb,
        width: 130
    }, function(err) {
        if (err) {
            throw new Error('image magic error: ')
        }

        callback(err, thumb);
    });
}

module.exports = {
    TimeMetrics: TimeMetrics,
    MultiQuery: MultiQuery,

    // helpers
    addRowLogMessage: addRowLogMessage,
    getOurPrice: getOurPrice,
    sync: sync,
    downloadFile: downloadFile,
    toDataTable: toDataTable,
    clone: clone,
    nameToUrl: nameToUrl,
    getXmlParser: getXmlParser,
    getImageThumbnail: getImageThumbnail
};
