var s3,
    bucket,
    AWS = require('aws-sdk'),
    fs = require('fs');

/**
 * Модуль загрузки файлов и изображения в Amazon S3
 * @type {{init: Function, uploadFile: Function, uploadImageWithThumb: Function}}
 */
module.exports = {

    /**
     * Инициализация Amazon S3
     * @param accessKeyId
     * @param secretAccessKey
     */
    init: function(accessKeyId, secretAccessKey, bucketName) {
        s3 = new AWS.S3({
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey
        });
        bucket = bucketName;
    },

    /**
     * Загрузка файла в хранилище, имя файла сохраняется
     * @param destDir – путь в Amazon S3
     * @param src
     * @param callback
     */
    uploadFile: function(destDir, src, callback) {
        var name = src.substring(src.lastIndexOf('/') + 1),
            key = destDir + '/' + name;

        fs.readFile(src, function(err, stdout) {
            if (err) {
                throw new Error('Error read file – ' + JSON.stringify(err));
            }

            s3.putObject({ Bucket: bucket, Key: key, Body: stdout, ACL: 'public-read' }, function(err) {
                callback(err, key);
            });
        });
    }
}
