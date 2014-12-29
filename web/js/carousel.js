jQuery(function () {

    'use strict';

    var transformsSupported = 'transform' in document.createElement('div').style;

    jQuery('.carousel').each(function () {

        var timeout, active = -1;
        var container = jQuery(this)
            .toggleClass('with-transformations', transformsSupported)
            .toggleClass('no-transformations', !transformsSupported);
        var tiles = container.children('.tile');
        var duration = parseInt(container.data('duration') || 10, 3) * 1000;
        var iterations = container.data('iterations') || 'infinite';
        var playedIterations = 0;

        var shouldRepeat = function () {
            return iterations === 'infinite' || playedIterations < iterations;
        };

        var finish = function () {
            if (timeout) {
                clearTimeout(timeout);
            }

            var lastTile = container.data('final') || tiles.length - 1;
            if (isNaN(lastTile)) {
                if (lastTile === 'end') {
                    lastTile = tiles.length - 1;
                }
                else if (lastTile === 'start') {
                    lastTile = 0;
                }
            }

            tiles.removeClass('deactivated');
            container.addClass('carousel-complete');

            if (tiles[lastTile]) {
                jQuery(tiles[lastTile]).addClass('active');
            }
        };

        var go = function () {
            if (timeout) {
                clearTimeout(timeout);
            }

            var remove = tiles[active];
            var add = tiles[active += 1];

            if (!add) {
                playedIterations++;
                if (shouldRepeat()) {
                    add = tiles[active = 0];
                }
            }

            tiles.removeClass('deactivated');

            if (remove) {
                jQuery(remove).removeClass('active').addClass('deactivated');
            }

            if (add) {
                jQuery(add).addClass('active')
            }

            if (shouldRepeat()) {
                timeout = setTimeout(go, duration);
            }
            else {
                finish();
            }
        };
        setTimeout(go);
    });

});
