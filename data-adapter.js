var USER_ID = 42,
    MANUFACTURER_ID = 1,
    VENDOR_ID = 1,
    CATEGORY_ID = 73,
    PRODUCT_CURRENCY = 131,
    PRODUCT_TABLES = ['orig_virtuemart_products', 'orig_virtuemart_product_manufacturers',
        'orig_virtuemart_products_en_gb', 'orig_virtuemart_product_categories', 'orig_virtuemart_product_prices',
        'orig_virtuemart_medias', 'orig_virtuemart_product_medias' ];

/**
 * Класс для работы с MySql базой virtueMart
 * @constructor
 */
function DataAdapter() {
    this._options = {
        host: 'ylibashki.ru',
        user: 'ylibashki',
        password: 'AS3jAdj7asd&ASd2Dsac@Ds',
        database: 'ylibashki.ru'
    };
    this._metrics = new TimeMetrics();
    this.hardcodePrices = '92102,94395,92001,94580,94746,90606,94401,93134,93132,93830,93327,91667,91667,94456,91526,94161,93540,92640,91881,91901,89400';
}

/**
 * Функция вызывается при каждом выполнении запроса транзакции, при выполнении всех запросов вызывается callback
 * @param err ошибки
 * @param queryName имя выполненного запроса
 * @private
 */
DataAdapter.prototype._onQueryComplete = function(err, queryName) {
    var flags = this._multiQueryFlags,
        allCompleted = true;

    if (err || !flags) {
        this._terminateMultiQuery(queryName + ' error: ' + err);
        return;
    }

    flags[queryName]--;
    for (var tb in flags) {
        if (flags.hasOwnProperty(tb) && flags[tb] > 0) {
            allCompleted = false;
            break;
        }
    }

    allCompleted && this._terminateMultiQuery();
}

/**
 * Начало транзакции (мультизапроса)
 * @param queryNames массив имен запросов
 * @param cnt кол-во запросов данного типа
 * @param callback
 * @private
 */
DataAdapter.prototype._startNewMultiQuery = function(queryNames, callback, cnt) {
    if (!queryNames.length) return;

    this._multiQueryFlags = {};
    queryNames.forEach(function(v) {
        v && (this._multiQueryFlags[v] = cnt || 1);
    }, this);

    this._multiQueryCallback = callback;
}

/**
 * Завершение мультизапроса
 * @private
 */
DataAdapter.prototype._terminateMultiQuery = function(err) {
    this._multiQueryFlags = undefined;
    this._multiQueryCallback && this._multiQueryCallback(err);
}

/**
 * Добавление продукта в каталог virtuaeMart
 * @param product
 * @param callback
 */
DataAdapter.prototype._insertProduct = function(product, callback) {

    if (this._multiQueryFlags || !this.isOpen) {
        console.log('Нет подключения к БД');
        return;
    }

    if (!product.article) {
        callback && callback('Артикул не задан');
        return;
    }

    this._startNewMultiQuery(PRODUCT_TABLES, callback);

    var price = utils.getOurPrice(product),
        date = new Date(),
        tbProductsParams = {
            created_by: USER_ID,
            created_on: date,
            product_sku: product.article,
            published: price ? 1 : 0,
            product_in_stock: 100,
            product_ordered: 0,
            low_stock_notification: 0,
            product_special: 0,
            product_params: 'min_order_level="0"|max_order_level="0"|',
            layout: 0,
            product_packaging: 0
        },
        _this = this;

    console.log('---\nДобавление продукта с артикулом: %s\n---', product.article);

    this._cn.query('INSERT INTO orig_virtuemart_products SET ?', tbProductsParams, function(err, res) {

        _this._onQueryComplete(err, 'orig_virtuemart_products');

        if (err) {
            _this._terminateMultiQuery('Ошибка добавления артикула' + product.article);
            return;
        }

        var productId = res.insertId;

        _this._cn.query('INSERT INTO orig_virtuemart_product_manufacturers SET ?', {
            virtuemart_manufacturer_id: MANUFACTURER_ID,
            virtuemart_product_id: productId
        }, function(err) { _this._onQueryComplete(err, 'orig_virtuemart_product_manufacturers') });

        _this._cn.query('INSERT INTO orig_virtuemart_products_en_gb SET ?', {
            virtuemart_product_id : productId,
            product_s_desc: product.description || '',
            product_desc: '',
            product_name: product.name || '',
            metadesc: '',
            metakey: '',
            customtitle: '',
            slug: productId
        }, function(err) { _this._onQueryComplete(err, 'orig_virtuemart_products_en_gb') });

        _this._cn.query('INSERT INTO orig_virtuemart_product_categories SET ?', {
            virtuemart_product_id: productId,
            virtuemart_category_id: CATEGORY_ID,
            ordering: 1
        }, function(err) { _this._onQueryComplete(err, 'orig_virtuemart_product_categories') });

        _this._cn.query('INSERT INTO orig_virtuemart_product_prices SET ?', {
            virtuemart_product_id: productId,
            product_price: price,
            product_tax_id: 3,
            product_currency: PRODUCT_CURRENCY,
            created_on: date,
            created_by: USER_ID
        }, function(err) { _this._onQueryComplete(err, 'orig_virtuemart_product_prices') });

        var fileName = (product.article || productId),
            tbMediasParams = {
                virtuemart_vendor_id: VENDOR_ID,
                file_title: fileName,
                file_description: '',
                file_meta: '',
                file_mimetype: 'image/jpeg',
                file_type: 'product',
                file_url: IMAGES_CATALOG + fileName + 'b.jpg',
                file_url_thumb: THUMB_IMAGES_CATALOG + fileName + 's.jpg',
                created_on: date,
                created_by: USER_ID
            };

        _this._cn.query('INSERT INTO orig_virtuemart_medias SET ?', tbMediasParams, function(err, res1) {
            _this._onQueryComplete(err, 'orig_virtuemart_medias');

            err || _this._cn.query('INSERT INTO orig_virtuemart_product_medias SET ?', {
                virtuemart_product_id: productId,
                virtuemart_media_id: res1.insertId,
                ordering: 1
            }, function(err) { _this._onQueryComplete(err, 'orig_virtuemart_product_medias') });
        });
    });
}

DataAdapter.prototype._hideProduct = function(product, callback) {
    if (this._multiQueryFlags || !this.isOpen) return;

    if (!product.article) {
        callback && callback('Артикул не задан');
        return;
    }

    console.log('Отмена публикации товара с артикулом %s', product.article);

    this._startNewMultiQuery(['orig_virtuemart_products'], callback);

    this._cn.query('UPDATE orig_virtuemart_products SET published = ?  WHERE product_sku = ?', [0, product.article], function(err) {
        this._onQueryComplete(err, 'orig_virtuemart_products');
    }.bind(this));
}

/**
 * Обновление цены
 * @param product
 * @param callback
 */
DataAdapter.prototype._updatePrice = function(product, callback) {

    if (this._multiQueryFlags || !this.isOpen) return;

    var price = utils.getOurPrice(product);

    if (!price) {
        this._hideProduct(product, callback);
        return;
    }

    console.log('---\nОбновление цены продукта с артикулом: %s\n---', product.article);

    if (!product.article) {
        callback && callback('Артикул не задан');
        return;
    }

    if (this.hardcodePrices.indexOf(product.article) != -1) {
        callback && callback('Цена артикула захардкодена');
        return;
    }

    this._startNewMultiQuery(['orig_virtuemart_product_prices'], callback);

    var _this = this;
    this._cn.query('SELECT virtuemart_product_id FROM orig_virtuemart_products WHERE product_sku = ?', [product.article], function(err, res) {
        var productId = res[0] && res[0].virtuemart_product_id;


        if (!productId) {
            callback && callback('Артикул ' + product.article + ' отсутствует в базе');
            _this._terminateMultiQuery();
            return;
        }


        _this._cn.query('UPDATE orig_virtuemart_product_prices SET product_price = ?  WHERE virtuemart_product_id = ?', [price, productId], function(err) {
            _this._onQueryComplete(err, 'orig_virtuemart_product_prices');
        });

    });
}

/**
 * Удаление продукта из каталога virtueMart
 * @param product
 * @param callback
 */
//TODO Удалять все изображения
DataAdapter.prototype._deleteProduct = function(product, callback) {

    if (this._multiQueryFlags || !this.isOpen) return;

    console.log('---\nУдаление продукта с артикулом: %s\n---', product.article);

    if (!product.article) { callback && callback('Артикул не задан'); return; }

    this._startNewMultiQuery(PRODUCT_TABLES, callback);

    var _this = this;
    this._cn.query('SELECT virtuemart_product_id FROM orig_virtuemart_products WHERE product_sku = ?', [product.article], function(err, res) {
        var productId = res[0] && res[0].virtuemart_product_id;

        if (!productId) {
            callback && callback('Артикул ' + product.article + ' отсутствует в базе');
            _this._terminateMultiQuery();
            return;
        }

        _this._cn.query('SELECT virtuemart_media_id FROM orig_virtuemart_product_medias WHERE virtuemart_product_id = ?', [productId], function(err, res) {
            var mediaId = res[0] && res[0].virtuemart_media_id;

            _this._cn.query('DELETE FROM orig_virtuemart_product_medias WHERE virtuemart_product_id = ?', [productId], function(err) {
                _this._onQueryComplete(err, 'orig_virtuemart_product_medias');

                mediaId && _this._cn.query('DELETE FROM orig_virtuemart_medias WHERE virtuemart_media_id = ?', [mediaId], function(err) {
                    _this._onQueryComplete(err, 'orig_virtuemart_medias');
                });
            });
        });

        _this._cn.query('DELETE FROM orig_virtuemart_products_en_gb WHERE virtuemart_product_id = ?', [productId], function(err) {
            _this._onQueryComplete(err, 'orig_virtuemart_products_en_gb');
        });

        _this._cn.query('DELETE FROM orig_virtuemart_product_manufacturers WHERE virtuemart_product_id = ?', [productId], function(err) {
            _this._onQueryComplete(err, 'orig_virtuemart_product_manufacturers');
        });

        _this._cn.query('DELETE FROM orig_virtuemart_product_categories WHERE virtuemart_product_id = ?', [productId], function(err) {
            _this._onQueryComplete(err, 'orig_virtuemart_product_categories');
        });

        _this._cn.query('DELETE FROM orig_virtuemart_product_prices WHERE virtuemart_product_id = ?', [productId], function(err) {
            _this._onQueryComplete(err, 'orig_virtuemart_product_prices');
        });

        _this._cn.query('DELETE FROM orig_virtuemart_products WHERE virtuemart_product_id = ?', [productId], function(err) {
            _this._onQueryComplete(err, 'orig_virtuemart_products');
        });
    });
}

/**
 * Добавление дополнительных фото к товару
 * @param auxPhotos
 * @param callback
 */
DataAdapter.prototype._addAuxPhoto = function(auxPhotos, callback) {
    var images = auxPhotos.images,
        product = auxPhotos.product,
        _this = this;

    if (this._multiQueryFlags || !this.isOpen) return;

    if (!images.length || !product.article) {
        callback && callback();
        return;
    }

    console.log('--\nДобавление фото к продукту с артикулом %s\n--', product.article);

    _this._startNewMultiQuery([ 'orig_virtuemart_medias', 'orig_virtuemart_product_medias', 'aux_photos' ], callback, images.length);

    images.forEach(function(image) {

        _this._cn.query('SELECT id_aux_photo FROM aux_photos WHERE article = ? AND title = ?', [product.article, image.title], function(err, res) {
            if (res[0]) {
                _this._onQueryComplete(err, 'aux_photos');
                return;
            }
            _this._cn.query('INSERT INTO aux_photos SET ?', { article: product.article, title: image.title }, function(err) {
                _this._onQueryComplete(err, 'aux_photos');
            });
        });
    });

    _this._cn.query('SELECT virtuemart_product_id FROM orig_virtuemart_products WHERE product_sku = ?', [product.article], function(err, res) {
        var productId = res[0] && res[0].virtuemart_product_id;

        if (!productId) {
            _this._terminateMultiQuery();
            callback && callback('Артикул ' + product.article + ' отсутствует в базе');

            return;
        }

        console.log('id продукта – %s', productId);
        images.forEach(function(image) {
            _this._cn.query('SELECT virtuemart_product_id FROM orig_virtuemart_product_medias p JOIN orig_virtuemart_medias m ON p.virtuemart_media_id = m.virtuemart_media_id  WHERE virtuemart_product_id = ? AND file_title = ?',
                [productId, image.title], function(err, res) {

                    if (res[0]) {
                        _this._onQueryComplete(err, 'orig_virtuemart_product_medias');
                        _this._onQueryComplete(err, 'orig_virtuemart_medias');
                        return;
                    }

                    var date = new Date(),
                        tbMediasParams = {
                            virtuemart_vendor_id: VENDOR_ID,
                            file_title: image.title,
                            file_description: '',
                            file_meta: '',
                            file_mimetype: 'image/jpeg',
                            file_type: 'product',
                            file_url: IMAGES_CATALOG + image.title,
                            file_url_thumb: THUMB_IMAGES_CATALOG + image.thumb,
                            created_on: date,
                            created_by: USER_ID
                        };

                    _this._cn.query('INSERT INTO orig_virtuemart_medias SET ?', tbMediasParams, function(err, res1) {
                        _this._onQueryComplete(err, 'orig_virtuemart_medias');

                        err && _this._terminateMultiQuery(err);

                        err || _this._cn.query('INSERT INTO orig_virtuemart_product_medias SET ?', {
                            virtuemart_product_id: productId,
                            virtuemart_media_id: res1.insertId,
                            ordering: 1
                        }, function(err) {
                            console.log('Фото %s добавлено', image.title);
                            _this._onQueryComplete(err, 'orig_virtuemart_product_medias')
                        });
                    });
                }
            );
        });
    });
}

DataAdapter.prototype.openConnection = function(callback) {
    if (this.isOpen) { callback && callback(); return; }

    var _this = this,
        cn = mysql.createConnection(this._options);

    cn.connect(function(err){
        err && console.log(err);
        _this.isOpen = true;
        console.log('---------------------------');
        console.log('Соединение с БД установлено');
        callback && callback(cn);
    });
}

DataAdapter.prototype.closeConnection = function(cn) {
    this.isOpen = false;
    cn.end();
    console.log('------------------------');
    console.log('Подключение к БД закрыто');
}

/**
 * Удаление товаров из каталога
 * @param products
 * @param callback
 */
DataAdapter.prototype.deleteProducts = function(products, callback) {
    if (!products.length) return;

    var _this = this;
    this.openConnection(function() {
        console.log('Удаление продуктов из каталога');
        utils.sync(products, {
            method: _this._deleteProduct,
            verbose: true,
            ctx: _this,
            callback: function() { _this.closeConnection(); callback(); }
        });
    });
}

/**
 * Добавление товаров в каталог
 * @param products
 * @param callback
 */
DataAdapter.prototype.insertProducts = function(products, callback) {
    if (!products.length) return;

    var _this = this;
    this.openConnection(function() {
        console.log('Добавление продуктов в каталог');
        utils.sync(products, {
            method: _this._insertProduct,
            verbose: true,
            ctx: _this,
            callback: function() { _this.closeConnection(); callback(); }
        });
    });
}

/**
 * Обновление цен в каталоге
 * @param products
 * @param callback
 */
DataAdapter.prototype.updatePrices = function(products, callback) {
    if (!products.length) return;


    var _this = this;

    this.openConnection(function() {
        console.log('Обновление цен в каталоге');
        utils.sync(products, {
            method: _this._updatePrice,
            verbose: true,
            ctx: _this,
            callback: function() { _this.closeConnection(); callback(); }
        });
    });
}

DataAdapter.prototype.addAuxPhotos = function(auxPhotos, callback) {
    if (!auxPhotos.length) return;

    var _this = this;

    this.openConnection(function() {
        console.log('Доваление фотографий в каталог');
        _this._metrics.reset();
        utils.sync(auxPhotos, {
            method: _this._addAuxPhoto,
            verbose: true,
            ctx: _this,
            callback: function() { _this.closeConnection(); callback(); }
        });
    });
}

DataAdapter.prototype.getAllProducts = function(cn, callback) {
    var _this = this;
    var m = new TimeMetrics();

    console.log('Получение перечня товаров из базы');


        cn.query(
            'SELECT product_sku, published, products.created_on, prices.product_price, ' +
            'names.product_name,  names.product_s_desc,  names.product_desc FROM orig_virtuemart_products products ' +
            'JOIN orig_virtuemart_product_prices prices ON products.virtuemart_product_id = prices.virtuemart_product_id ' +
            'JOIN orig_virtuemart_products_en_gb names ON products.virtuemart_product_id = names.virtuemart_product_id',

            function(err, res) {

                if (err) {
                    callback(err);
                    return;
                }


                callback(null, res.map(function(v){
                    return {
                        name: v.product_name,
                        price: v.product_price,
                        article: v.product_sku,
                        description: v.product_desc,
                        smallDescription: v.product_s_desc,
                        published: !!v.published,
                        createdOn: v.created_on
                    }
                }));

                m.writeTime();
            }
        );
}

exports.DataAdapter = DataAdapter;




