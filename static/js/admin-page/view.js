var AdminPageView = Backbone.View.extend({

    initialize: function(options) {
        _.bindAll(this, 'onChangeState');
        this.model.on('change:state', this.onChangeState);
        this.router = options.router;
    },

    events: {
        'click .dropdown-item': function(e) {
            $('.text', '.dropdown-toggle ').html(e.target.innerHTML);
        },

        'click .products-tab': function(e) {
            this.router.navigate('products/' + $(e.target).attr('products'), { trigger: true });
            e.preventDefault();
        }
    },

    onChangeState: function() {
        var state = this.model.get('state');

        if (!state) return;

        var dom = $('.products-tab[products=' + state + ']');

        dom.tab('show');
        dom.hasClass('dropdown-item') && $('.text', '.dropdown-toggle ').html(dom.html());

        this.dataTable && this.dataTable.fnDestroy();
        this.dataTable = $('.data-table').dataTable({
            bProcessing: true,
            aLengthMenu: [
                [10, 30, 50, 100],
                [10, 30, 50, 100]
            ],
            iDisplayLength: 30,
            sAjaxSource: this.model.getActionName()
        });
    }
});
