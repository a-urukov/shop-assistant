var ObjectID = require('mongodb').ObjectID,
    utils = require('./utils.js'),
    DBRef = require('mongodb').DBRef,
    idsFilter = function(ids) {

        return {
            _id: { $in: ids.map(function(id) { return new ObjectID(id) }) }
        };
    },
    idWrap = function(id) {

        return typeof id === 'string' ? new ObjectID(id) : id
    };

/**
 * Доступ к данным
 * @constructor
 */
function DataAdapter(db) {
    this._db = db;
    this._products = this._db.collection('products');
    this._categories = this._db.collection('categories');
    this._contractorsProducts = this._db.collection('contractorsProducts');
}

/**
 * Получение товаров каталога
 * @param {Object} criteria
 * {bool} options.published – опубликованные|неопубликованные товары
 * {bool} options.ignored – игнорируемые|неигнорируемые товары
 * @param callback
 */
DataAdapter.prototype.getProducts = function(criteria, callback) {
    var query = {};

    if (criteria && callback) {
        typeof criteria.published === 'boolean' && (query.published = criteria.published);
        typeof criteria.ignored === 'boolean' && (query.ignored = criteria.ignored);
        typeof criteria._id === 'string' && (query._id = new ObjectID(criteria._id));

        if (criteria.categoriesIds instanceof Array) {
            query.categories = {
                $in: criteria.categoriesIds.map(function(id) {

                    return new DBRef('categories', idWrap(id));
                })
            };
        }

    } else if (!callback) {
        callback = criteria;
    }

    var db = this._db,
        cursor = this._products.find(query),
        result = [],
        product;

    (function prepare() {
        product && result.push(product);

        cursor.nextObject({}, function(err, p) {
            if ((product = p) && !err) {

                if (product.categories instanceof Array) {
                    var categories = [];

                    utils.sync(product.categories, {
                        method: db.dereference,
                        ctx: db,
                        methodCallback: function(err, category) {
                            category && categories.push({
                                _id: category._id,
                                name: category.name
                            });
                        },
                        callback: function() {
                            product.categories = categories;
                            prepare();
                        }
                    });
                } else {
                    prepare();
                }
            } else {
                callback(err, result);
            }
        });
    })();
};

/**
 * Получить все товары, включая подкатегории
 * @param categoryId
 * @param callback
 */
DataAdapter.prototype.getProductsByCategory = function(categoryId, callback) {
    this.getCategoriesIdsByParent(categoryId, function(err, ids) {
        if (err) {
            callback(err);
        } else {
            this.getProducts({ categoriesIds: ids, published: true }, callback);
        }
    }.bind(this));
};

/**
 * Сохранение продукта в каталог
 * @param product
 * @param callback
 */
DataAdapter.prototype.saveProduct = function(product, callback) {
    var name = product.name,
        caps;

    // убираем caps
    while (caps = /[А-Я,A-Z]{2,}/g.exec(name)) {
        caps = caps[0];
        name = name.replace(caps, caps[0].toUpperCase() + caps.substr(1).toLowerCase());
    }


    this._products.save({
        _id: product._id && new ObjectID(product._id),
        name: name,
        article: product.article,
        contractor: product.contractor,
        url: product.url || utils.nameToUrl(name),
        optPrice: +product.optPrice,
        recPrice: +product.recPrice,
        ourPrice: +product.ourPrice,
        description: product.description,
        categories: product.categories && product.categories.map(function(id) {
            return new DBRef('categories', new ObjectID(id));
        }),
        priority: +product.priority,
        published: !!product.published && !product.ignored,
        ignored: !!product.ignored,
        available: !!product.available
    }, callback);
}

/**
 * Возвращает категорию по url (без подкатегорий)
 * @param url
 * @param callback
 */
DataAdapter.prototype.getCategoryByUrl = function(url, callback) {
    this._categories.find({ url: url }).toArray(function(err, categories) { callback(err, categories && categories[0]) });
};

/**
 * Возвращает иерархичный список категорий (массив) и хэш содержащий все категории (id -> category)
 * @param callback
 */
DataAdapter.prototype.getCategories = function(callback) {
    this._categories.find().sort({ posInMenu: 1 }).toArray(function(err, categories) {
        if (err) {
            callback(err);

            return;
        }

        var roots = [],
            hash = {};

        categories.forEach(function(category) {
            category.children = [];
            hash[category._id] = category;
        });

        categories.forEach(function(category) {
            if (!category.parentId) {
                roots.push(category);
            } else {
                hash[category.parentId].children.push(category);
            }
        });

        Object.getOwnPropertyNames(categories)


        callback(null, roots, hash);
    });
};

/**
 * Возвращает id всех подкатегории для категории (включая категорию)
 * @param id
 * @param callback
 */
DataAdapter.prototype.getCategoriesIdsByParent = function(id, callback) {
    this.getCategories(function(err, categories, hash) {
        if (err) { callback(err); return; }

        var result = [],
            category = hash[idWrap(id)];

        category && (function collect(c) {
            result.push(c._id);
            c.children.forEach(collect);
        })(category);

        callback(null, result);
    });
}

/**
 * Создание и редактирование категории
 * @param category
 * @param callback
 */
DataAdapter.prototype.saveCategory = function(category, callback) {
    this._categories.save({
        _id: category._id && new ObjectID(category._id),
        name: category.name,
        url: category.url || utils.nameToUrl(category.name),
        description: category.description,
        nameInMenu: category.nameInMenu || category.name,
        posInMenu: category.posInMenu || 99,
        parentId: category.parentId && new ObjectID(category.parentId),
        published: !!category.published && category !== 'false'
    }, callback);
};

/**
 * Удаление категории и всех вложенных подкатегорий
 * @param id
 * @param callback
 */
DataAdapter.prototype.removeCategory = function(id, callback) {
    var _this = this,
        objId = idWrap(id),
        ref = new DBRef('categories', objId);

    // убираем удаляемую категорию из товаров
    this._products.update({ categories: ref }, { $pull: { categories: ref } }, { multi: true }, function() {

        // удаляем все подкатегории
        _this._categories.find({ parentId: objId }).toArray(function(err, sub) {

            utils.sync(sub.map(function(s) { return s._id }), {
                method: _this.removeCategory,
                ctx: _this,
                callback: function() {

                    // удаляем категорию
                    _this._categories.remove({ _id: objId }, callback);
                }
            });
        });
    });
};

/**
 * Получение товаров поставщиков
 * @param callback
 */
DataAdapter.prototype.getContractorsProducts = function(callback) {
    this._contractorsProducts.find().toArray(callback);
};

/**
 * Синхронизация ассортимента поставщика
 * @param data
 * @param callback
 */
DataAdapter.prototype.syncContractorsData = function(data, callback) {
    utils.sync(data, {
        method: function(product, callback) {
            var price = +product.price || 0;

            this._contractorsProducts.update({
                    article: product.article
                },
                {
                    article: product.article,
                    name: product.name,
                    optPrice: price,
                    available: product.available && price
                },
                { upsert: true },
                callback
            );
        },
        ctx: this,
        callback: callback
    });
};

/**
 * Изменения стейта товара (Опубликованный, Неопубликованный, Черный список)
 * @param state
 * @param ids
 * @param callback
 */
DataAdapter.prototype.changeProductsState = function(state, ids, callback) {
    this._products.update(idsFilter(ids),
        { $set: { published: !!state.published, ignored: !!state.ignored } }, { multi: true }, callback);
};

/**
 * Актуализировать наличие и [цены]
 * @param ids
 * @param callback
 */
DataAdapter.prototype.actualizeProducts = function(ids, callback) {
    var _this = this;

    this._products
        .find(idsFilter(ids))
        .toArray(function(err, products) {
            if (err || !products) {
                callback(err, products);

                return;
            }

            _this._contractorsProducts
                .find({ article: { $in: products.map(function(p) { return p.article }) } })
                .toArray(function(err, contractorProducts) {
                    if (err || !products) {
                        callback(err, products);

                        return;
                    }

                    var availableHash = {};

                    contractorProducts.forEach(function(contractorProduct) {
                        availableHash[contractorProduct.article] = contractorProduct.available;
                    });

                    utils.sync(products, {
                        method: function(product, callback) {
                            _this._products.update({ _id: product._id },
                                { $set: { available: !!availableHash[product.article] } },
                                callback)
                        },
                        ctx: _this,
                        callback: callback
                    });
                });
        });
};

/**
 * Добавление продуктов из ассортимента поставщика
 * @param ids
 * @param callback
 */
DataAdapter.prototype.addFromContractor = function(ids, callback) {
    this._contractorsProducts.find(idsFilter(ids)).toArray(function(err, products) {
        if (err || !products) {
            callback(err, products);

            return;
        }

        this._products.insert(products.map(function(product) {
            return {
                name: product.name,
                available: product.available,
                published: false,
                ignored: false,
                article: product.article,
                optPrice: product.optPrice
            }
        }), callback);
    }.bind(this))
};

/**
 * Удаление продуктов из каталога
 * @param ids
 * @param callback
 */
DataAdapter.prototype.removeProducts = function(ids, callback) {
    this._products.remove(idsFilter(ids), callback);
};

exports.DataAdapter = DataAdapter;




