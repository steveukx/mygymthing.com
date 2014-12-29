jQuery(function () {

    'use strict';

    var transformsSupported = 'transform' in document.createElement('div').style;

    jQuery('.carousel').each(function () {

        var timeout;
        var container = jQuery(this)
            .toggleClass('with-transformations', transformsSupported)
            .toggleClass('no-transformations', !transformsSupported);
        var active = isNaN(container.data('first')) ? -1 : parseInt(container.data('first'), 10) - 1;
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

            var lastTile = container.data('final');
            if (isNaN(lastTile)) {
                if (lastTile === 'end' || lastTile === undefined) {
                    lastTile = tiles.length - 1;
                }
                else if (lastTile === 'start') {
                    lastTile = 0;
                }
            }
            else {
                lastTile = parseInt(lastTile, 10);
            }

            tiles.removeClass('deactivated');

            if (tiles[lastTile]) {
                jQuery(tiles[lastTile]).addClass('active');
            }

            setTimeout(function () {
                container.addClass('carousel-complete').trigger('carouselComplete');
            }, duration);
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
                timeout = setTimeout(finish);
            }
        };
        setTimeout(go);
    });

});
