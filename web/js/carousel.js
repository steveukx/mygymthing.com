jQuery(function () {

    'use strict';

    jQuery('.carousel').each(function () {

        var timeout, active = -1;
        var container = jQuery(this);
        var tiles = container.children('.tile').addClass('inactive');
        var duration = parseInt(container.data('duration') || 10, 3) * 1000;
        var go = function () {
            if (timeout) {
                clearTimeout(timeout);
            }

            var remove = tiles[active];
            var add = tiles[active += 1] || tiles[active = 0];

            tiles.removeClass('deactivated');

            if (remove) {
                jQuery(remove).removeClass('active').addClass('deactivated');
            }

            if (add) {
                jQuery(add).removeClass('deactivated').addClass('active')
            }

            timeout = setTimeout(go, duration);
        };
        go();
    });

});
