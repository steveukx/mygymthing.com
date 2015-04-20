define([
    './util/dom'
], function (
    dom
) {

    dom('button[data-action')
        .on('click', function () {
            var button = dom(this);
            var form = button.closest('form');
            form.attr('action', button.attr('data-action'));
            form.submit();
        });

});
