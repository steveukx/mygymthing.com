define(function () {

    return {
        camelCase: function (str) {
            return String(str).replace(/[^a-z0-9]+(.)/g, function (all, chr) {
                return chr.toUpperCase();
            });
        }
    };
});
