$(function() {

    $('.b-main-categories__item')
        .bind('mouseenter', function(e) {
            var $this = $(this);

            $this.data({ preventShow: false });
            setTimeout(function() {
                var data = $this.data();

                data && data.preventShow || $this.find('.b-main-categories__dropdown').show();
            }, 250);
        })

        .bind('mouseleave', function(e) {
            $(this)
                .data({ preventShow: true })
                .find('.b-main-categories__dropdown').hide();
        })
});
