var USER_ID = 42,
    MANUFACTURER_ID = 1,
    VENDOR_ID = 1,
    CATEGORY_ID = 73,
    PRODUCT_CURRENCY = 131,
    PRODUCT_TABLES = ['orig_virtuemart_products', 'orig_virtuemart_product_manufacturers',
        'orig_virtuemart_products_en_gb', 'orig_virtuemart_product_categories', 'orig_virtuemart_product_prices',
        'orig_virtuemart_medias', 'orig_virtuemart_product_medias' ],
    HARDCODE_PRICES = '92102,94395,92001,94580,94746,90606,94401,93134,93132,93830,93327,91667,91667,94456,91526,94161,93540,92640,91881,91901,89400',
    IMAGES_CATALOG = 'images/stories/virtuemart/product/',
    THUMB_IMAGES_CATALOG = 'images/stories/virtuemart/product/resized/',

    mysql = require('mysql'),
    utils = require('./utils.js').utils,
    MultiQuery = require('./utils.js').MultiQuery;

/**
 * Хэлпер для возвращения connect в pool и вызова callback
 * @param cn
 * @param callback
 * @returns {Function}
 */
function disposeConnect(cn, callback) {
    return function(err) {
        cn.end();
        callback(err);
    }
}

/**
 * Класс для работы с MySql базой virtueMart
 * @constructor
 */
function DataAdapter(options) {
    var pool = mysql.createPool(options);

    this.getConnection = pool.getConnection.bind(pool);
}

/**
 * Получение всех товаров каталога
 * @param callback
 */
DataAdapter.prototype.getAllProducts = function(callback) {
    this.getConnection(function(err, cn) {
        cn.query(
            'SELECT products.virtuemart_product_id, product_sku, published, product_in_stock, products.created_on, prices.product_price, ' +
                'names.product_name,  names.product_s_desc,  names.product_desc FROM orig_virtuemart_products products ' +
                'JOIN orig_virtuemart_product_prices prices ON products.virtuemart_product_id = prices.virtuemart_product_id ' +
                'JOIN orig_virtuemart_products_en_gb names ON products.virtuemart_product_id = names.virtuemart_product_id',

            function(err, res) {

                cn.end();

                if (err) {
                    callback(err);
                    return;
                }

                callback(null, res.map(function(v) {
                    return {
                        id: v.virtuemart_product_id,
                        name: v.product_name,
                        price: v.product_price,
                        article: v.product_sku,
                        description: v.product_desc,
                        smallDescription: v.product_s_desc,
                        available: !!v.published && v.product_in_stock > 100,
                        createdOn: v.created_on
                    }
                }));
            }
        );
    });
}

/**
 * Добавление продукта в каталог virtueMart
 * @param product
 * @param callback
 */
DataAdapter.prototype.insertProduct = function(product, callback) {
    this.getConnection(function(err, cn) {

        var multiQuery = new MultiQuery(PRODUCT_TABLES, disposeConnect(cn, callback)),
            price = utils.getOurPrice(product.price),
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
            };

        cn.query('INSERT INTO orig_virtuemart_products SET ?', tbProductsParams, function(err, res) {

            multiQuery.completeQuery(err, 'orig_virtuemart_products');

            if (err) {
                multiQuery.terminate();
                return;
            }

            var productId = res.insertId,
                fileName = (product.article || productId),
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
                },
                name = product.name,
                caps;

            // убираем caps
            while (caps = /[А-Я,A-Z]{2,}/g.exec(name)) {
                caps = caps[0];
                name = name.replace(caps, caps[0].toUpperCase() + caps.substr(1).toLowerCase());
            }

            cn.query('INSERT INTO orig_virtuemart_product_manufacturers SET ?', {
                virtuemart_manufacturer_id: MANUFACTURER_ID,
                virtuemart_product_id: productId
            }, function(err) { multiQuery.completeQuery(err, 'orig_virtuemart_product_manufacturers') });

            cn.query('INSERT INTO orig_virtuemart_products_en_gb SET ?', {
                virtuemart_product_id: productId,
                product_s_desc: product.description || '',
                product_desc: '',
                product_name: product.name || '',
                metadesc: '',
                metakey: '',
                customtitle: '',
                slug: productId
            }, function(err) { multiQuery.completeQuery(err, 'orig_virtuemart_products_en_gb') });

            cn.query('INSERT INTO orig_virtuemart_product_categories SET ?', {
                virtuemart_product_id: productId,
                virtuemart_category_id: CATEGORY_ID,
                ordering: 1
            }, function(err) { multiQuery.completeQuery(err, 'orig_virtuemart_product_categories') });

            cn.query('INSERT INTO orig_virtuemart_product_prices SET ?', {
                virtuemart_product_id: productId,
                product_price: price,
                product_tax_id: 3,
                product_currency: PRODUCT_CURRENCY,
                created_on: date,
                created_by: USER_ID
            }, function(err) { multiQuery.completeQuery(err, 'orig_virtuemart_product_prices') });

            cn.query('INSERT INTO orig_virtuemart_medias SET ?', tbMediasParams, function(err, res1) {
                multiQuery.completeQuery(err, 'orig_virtuemart_medias');

                if (err) {
                    multiQuery.terminate();
                } else {
                    cn.query('INSERT INTO orig_virtuemart_product_medias SET ?', {
                        virtuemart_product_id: productId,
                        virtuemart_media_id: res1.insertId,
                        ordering: 1
                    }, function(err) { multiQuery.completeQuery(err, 'orig_virtuemart_product_medias') });
                }
            });
        });
    });
}


/**
 * Обновление наличия
 * @param article
 * @param available
 * @param callback
 */
DataAdapter.prototype.updateAvailability = function(article, available, callback) {
    this.getConnection(function(err, cn) {
        cn.query('UPDATE orig_virtuemart_products SET product_in_stock = ?  WHERE product_sku = ?', [available ? 100 : 0, article], function(err) {
            cn.end();
            callback(err);
        });
    });
}

/**
 * Обновление цены
 * @param contractorPrice
 * @param article
 * @param callback
 */
DataAdapter.prototype.updatePrice = function(article, contractorPrice, callback) {

    if (HARDCODE_PRICES.indexOf(article) != -1) {
        callback();
        return;
    }

    this.getConnection(function(err, cn) {
        cn.query('SELECT virtuemart_product_id FROM orig_virtuemart_products WHERE product_sku = ?', [article], function(err, res) {
            var productId = res[0] && res[0].virtuemart_product_id;

            if (err || !productId) {
                callback(err);
                return;
            }

            cn.query('UPDATE orig_virtuemart_product_prices SET product_price = ?  WHERE virtuemart_product_id = ?',
                [utils.getOurPrice(contractorPrice), productId], function(err) {
                    callback(err);
                });

        });
    });
}

/**
 * Удаление продукта из каталога virtueMart
 * @param product
 * @param callback
 */
//TODO Удалять все изображения Переписать!
DataAdapter.prototype._deleteProduct = function(product, callback) {

    if (this._multiQueryFlags || !this.isOpen) return;

    console.log('---\nУдаление продукта с артикулом: %s\n---', product.article);

    if (!product.article) { callback && callback('Артикул не задан'); return; }

    this._startNewMultiQuery(PRODUCT_TABLES, callback);

    var _this = this;
    cn.query('SELECT virtuemart_product_id FROM orig_virtuemart_products WHERE product_sku = ?', [product.article], function(err, res) {
        var productId = res[0] && res[0].virtuemart_product_id;

        if (!productId) {
            callback && callback('Артикул ' + product.article + ' отсутствует в базе');
            _this._terminateMultiQuery();
            return;
        }

        _cn.query('SELECT virtuemart_media_id FROM orig_virtuemart_product_medias WHERE virtuemart_product_id = ?', [productId], function(err, res) {
            var mediaId = res[0] && res[0].virtuemart_media_id;

            _cn.query('DELETE FROM orig_virtuemart_product_medias WHERE virtuemart_product_id = ?', [productId], function(err) {
                _this._onQueryComplete(err, 'orig_virtuemart_product_medias');

                mediaId && _cn.query('DELETE FROM orig_virtuemart_medias WHERE virtuemart_media_id = ?', [mediaId], function(err) {
                    _this._onQueryComplete(err, 'orig_virtuemart_medias');
                });
            });
        });

        _cn.query('DELETE FROM orig_virtuemart_products_en_gb WHERE virtuemart_product_id = ?', [productId], function(err) {
            _this._onQueryComplete(err, 'orig_virtuemart_products_en_gb');
        });

        _cn.query('DELETE FROM orig_virtuemart_product_manufacturers WHERE virtuemart_product_id = ?', [productId], function(err) {
            _this._onQueryComplete(err, 'orig_virtuemart_product_manufacturers');
        });

        _cn.query('DELETE FROM orig_virtuemart_product_categories WHERE virtuemart_product_id = ?', [productId], function(err) {
            _this._onQueryComplete(err, 'orig_virtuemart_product_categories');
        });

        _cn.query('DELETE FROM orig_virtuemart_product_prices WHERE virtuemart_product_id = ?', [productId], function(err) {
            _this._onQueryComplete(err, 'orig_virtuemart_product_prices');
        });

        _cn.query('DELETE FROM orig_virtuemart_products WHERE virtuemart_product_id = ?', [productId], function(err) {
            _this._onQueryComplete(err, 'orig_virtuemart_products');
        });
    });
}

/**
 * Добавление дополнительных фото к товару
 * @param auxPhotos
 * @param callback
 */
//TODO Переписать!
DataAdapter.prototype.addAuxPhoto = function(auxPhotos, callback) {
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

        _cn.query('SELECT id_aux_photo FROM aux_photos WHERE article = ? AND title = ?', [product.article, image.title], function(err, res) {
            if (res[0]) {
                _this._onQueryComplete(err, 'aux_photos');
                return;
            }
            _cn.query('INSERT INTO aux_photos SET ?', { article: product.article, title: image.title }, function(err) {
                _this._onQueryComplete(err, 'aux_photos');
            });
        });
    });

    _cn.query('SELECT virtuemart_product_id FROM orig_virtuemart_products WHERE product_sku = ?', [product.article], function(err, res) {
        var productId = res[0] && res[0].virtuemart_product_id;

        if (!productId) {
            _this._terminateMultiQuery();
            callback && callback('Артикул ' + product.article + ' отсутствует в базе');

            return;
        }

        console.log('id продукта – %s', productId);
        images.forEach(function(image) {
            _cn.query('SELECT virtuemart_product_id FROM orig_virtuemart_product_medias p JOIN orig_virtuemart_medias m ON p.virtuemart_media_id = m.virtuemart_media_id  WHERE virtuemart_product_id = ? AND file_title = ?',
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

                    _cn.query('INSERT INTO orig_virtuemart_medias SET ?', tbMediasParams, function(err, res1) {
                        _this._onQueryComplete(err, 'orig_virtuemart_medias');

                        err && _this._terminateMultiQuery(err);

                        err || _cn.query('INSERT INTO orig_virtuemart_product_medias SET ?', {
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

exports.DataAdapter = DataAdapter;




