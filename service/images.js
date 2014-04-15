// хэш картинок товара
function ProductImages(product) {
    return {
        product: product,
        urls: [],
        image: {
            title: '',
            thumb: '',
            aux: []
        }
    }
}

/**
 * @deprecated Актуально только для suvenirow
 * Класс для выгрузки изображений на удаленный хост, с произвольного url
 * src хэш { host: 'имя хоста', path: 'полный путь (вместе с параметрами)', key: 'имя ключа артикула' }
 * dir каталоги { img: 'каталог изображений', thumb: 'каталог привью' }
 * @constructor
 */
function Images(src, dir) {

    var options = this._options = {
            host: src.host,
            port: 80,
            method: 'GET'
        },

        /**
         * @private
         * Получает url всех картинок со страницы товара
         * product – товар для которого загружаются картинки
         * в callback прокидывается хэш картинок товара
         */
        getProductImages = function(product, callback) {

            if (!product.article) return;

            options.path = src.path +
                (src.path.indexOf('?') == -1 ? '?' : (src.path[src.path.length - 1] == '&' ? '' : '&')) +
                    src.key + '=' + product.article;

            var html = '',
                req = http.request(options, function(res) {

                    res.setEncoding('utf8');

                    res.on('data', function(chunk) { html += chunk });

                    res.on('end', function() {
                        var regExps = {
                                img: /<img src=("|')(\S+\/(\d+b.jpg))("|')>/gi,
                                thumb: /<img src=("|')(\S+\/(\d+s.jpg))("|')>/gi,
                                aux: /<img src=("|')(\S+\/(\d+b-(\d).jpg))("|')>/gi
                            },
                            result = new ProductImages(product),
                            exec;

                        if (exec = regExps.img.exec(html)) {
                            result.urls.push({ path: exec[2], isThumb: 0 });
                            result.image.title = exec[3];
                        }
                        if (exec = regExps.thumb.exec(html)) {
                            result.urls.push({ path: exec[2], isThumb: 1 });
                            result.image.thumb = exec[3];
                        }

                        while (exec = regExps.aux.exec(html)) {
                            var thumb = new RegExp('\<img src=("|\')(\\S+\\/(\\d+b-' + exec[4] + '\\d+.jpg))("|\')\>', 'gi'),
                                tExec = thumb.exec(html);

                            result.image.aux.push({
                                title: exec[3],
                                thumb: (tExec) ? tExec[3] : ''
                            });

                            result.urls.push({ path: exec[2], isThumb: 0 });
                            tExec && result.urls.push({ path: tExec[2], isThumb: 1 });
                        }

                        callback && callback(null, result);
                    });

                    res.on('error', function(error) { callback(error) });
                });

            req.end();
        },

        downloadFiles = function(url, callback) {
            utils.downloadFile({ host: options.host, path: '/' + url.path },
                url.isThumb ? dir.thumb : dir.img, callback);
        };

    /**
     * Загрузка изображений для товара
     * @param product товар
     * @param callback
     * @returns this
     */
    this.download = function(product, callback) {
        console.log('--\nЗагрузка изображений для артикула %s\n--', product.article);

        getProductImages(product, function(err, productImages) {

            if (err) {
                callback && callback(err, productImages);
                return;
            }

            utils.sync(productImages.urls, {
                method: downloadFiles,
                callback: function() { callback && callback(null, productImages) },
                verbose: true,
                ctx: this
            });
        });

        return this;
    };

}

exports.Images = Images;
