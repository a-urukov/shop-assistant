$(document).ready(function() {

    function setDataTable(source) {

        var dataTableSettings = {
                bProcessing: true,
                aLengthMenu: [
                    [10, 30, 50, 100],
                    [10, 30, 50, 100]
                ],
                iDisplayLength: 30,
                sAjaxSource: source
            };

        dataTable && dataTable.fnDestroy();

        return $('.data-table').dataTable(dataTableSettings);
    }

    var dataTable = setDataTable('/new-products');

    $('.dropdown-item').bind('click', function(e, data) {
        $('.text', '.dropdown-toggle ').html(e.target.innerHTML);
    });

    $('#missing-link').bind('click', function(e, data) {
        dataTable = setDataTable('/missing-products');
    });

    $('#available-link').bind('click', function(e, data) {
        dataTable = setDataTable('/available-products');
    });

    $('#new-link').bind('click', function(e, data) {
        dataTable = setDataTable('/new-products');
    });

    $('#all-link').bind('click', function(e, data) {
        dataTable = setDataTable('/all-products');
    });


});
