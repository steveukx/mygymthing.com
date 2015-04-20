(function () {

    var closest = function (startFrom, matching) {
        do {
            if (startFrom.matches(matching)) {
                return startFrom;
            }
        }
        while (startFrom = startFrom.parentNode);
    };

    [].forEach.call(document.querySelectorAll('button[data-action'), function (element) {
        element.addEventListener('click', function () {
            var form = closest(element, 'form');
            form.setAttribute('action', element.getAttribute('data-action'));
            form.submit();
        }, true);
    });

}());
