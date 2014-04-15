$.fn.FileUploader = function() {
    var $dom = this,
        id = Math.round(Math.random() * 10000) + 'browse',
        markup = '<div class="thumbnails">' +
            '<label for="#id" class="btn btn-success">Добавить изображение</label>' +
            '<input id="#id" type="file" accept="image/*" multiple style="width: 0; height: 0" />' +
        '</div>';

    this.html(markup.replace(/#id/g, id));

    $('#' + id).on('change', function(e) {
        var files = FileAPI.getFiles(e);

        FileAPI.each(files, function(file) {
            if (file.size >= 25 * FileAPI.MB) {
                alert('Sorrow.\nMax size 25MB')

            } else if (file.size === void 0) {
                alert('Bad file')

            } else {
                FileAPI.getInfo(file, function(err, info) {
                    if (info.width <= 300 && info.height <= 300) {
                        alert('Изображение должно быть больше 300x300');

                        return;
                    }

                    FileAPI.upload({
                        url: '/admin/upload-image',
                        files: { image: file },
                        upload: function() {

                        },
                        progress: function(evt) {
                            console.log(evt.loaded / evt.total * 100 + '%');
                        },
                        complete: function(err, xhr) {
                            err || $dom.trigger('upload', { path: xhr.response });
                        }
                    });
                });
            }
        });


    });

    return this;
};
