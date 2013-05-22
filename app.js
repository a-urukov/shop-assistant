IMAGES_CATALOG = 'images/stories/virtuemart/product/',
THUMB_IMAGES_CATALOG = 'images/stories/virtuemart/product/resized/',

http = require('http');
libxmljs = require('libxmljs');
Buffer = require('buffer').Buffer;
mysql = require('mysql');
exec = require('child_process').exec;
Iconv = require('iconv').Iconv;
TimeMetrics = require('./utils.js').TimeMetrics;
utils = require('./utils.js').utils;

var path = require('path');


var CatalogDownloader = require('./catalog.js').Downloader,
    Images = require('./images.js').Images,
    DataAdapter = require('./data-adapter.js').DataAdapter,

    catalog = new CatalogDownloader(),
    images = new Images({ host: 'www.suvenirow.ru', path: '/image.php', key: 'id' },
        { img: './temp/', thumb: './temp/resized/' }),

    dataAdapter = new DataAdapter();


//catalog.download(function(products) {
//    dataAdapter.insertProducts(products, function() { console.log('Все!'); })
//});

j = 0;

dataAdapter.openConnection(function(cn) {
    metric = new TimeMetrics();


    for (var i = 0; i <= 1000; i++) {

        dataAdapter.getAllProducts(cn, function(err, data) {
            err && console.log(err);
            console.log(j++);

        });
        metric.writeTimeMark();
    }

})








//pictures._getPicturesUrl({ article: '94438' }, function(pr, u, t) { console.log(u, t) });

//a = new Date(Date1.now());
//console.dir({a: 1, b: 2});


//var picturesUploader = new ImagesDownloader('./temp');
//
//picturesUploader.uploadFile();
