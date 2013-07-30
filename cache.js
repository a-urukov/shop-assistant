function Cache() {

}

/**
 * Регитсрация ключа в кэше
 * @param key
 * @param getFunction Функция получения данных (опционально может принимать id)
 * @param ctx контекст выполнения функции получения данных
 */
Cache.prototype.register = function(key, getFunction, ctx) {
    var value;

    this[key] = {

        lastUpdate: new Date(),

        /**
         * Получение данных из кэша
         * @param [id] Необязяательный параметр для коллекций
         * @param callback
         */
        get: function(id, callback) {
            var v;

            if (arguments.length == 1) {
                callback = id;
                v = value;
            } else {
                v = value[id];
            }

            if (v) {
                callback(null, v);
            } else {
                this.update.apply(this, arguments);
            }
        },

        /**
         * Обновление данных в кэше
         * @param [id]
         * @param callback
         */
        update: function(id, callback) {
            var _this = this,
                args = [];

            if (arguments.length == 1) {
                callback = id;
            } else {
                args.push(id);
            }

            // callback
            args.push(function(err, val) {
                value = val;
                _this.lastUpdate = new Date();
                callback(err, val);
            });

            getFunction.apply(ctx, args);
        }
    };
};

var multiAction = function(method, keys, callback, ctx) {
    (function() {
        if (keys.indexOf(' ') == -1) {
            this[keys][method](callback);
        } else {
            var res = {},
                errors = [];

            utils.sync(keys.split(' '), {
                method: this[method],
                ctx: this,
                methodCallback: function(err, val, key) {
                    res[key] = val;
                    err && errors.push(err);
                },
                callback: function() {
                    callback(errors.length && errors, res)
                }
            });
        }
    }).call(ctx)
}

/**
 * Возвращает данные по одному или нескольким ключам
 * @param keys один ключ или несколько ключей через пробелы
 * @param callback
 */
Cache.prototype.get = function(keys, callback) {
    multiAction('get', keys, callback, this);
}

/**
 * Возвращает данные по одному или нескольким ключам
 * @param keys один ключ или несколько ключей через пробелы
 * @param callback
 */
Cache.prototype.update = function(keys, callback) {
    multiAction('update', keys, callback, this);
}

exports.Cache = Cache;
