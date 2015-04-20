define(function () {

    var empty = [];
    var push = empty.push;

    function dom (selector, baseNode) {
        var elements = [];
        if (typeof selector === "string") {
            push.apply(elements, (baseNode || document).querySelectorAll(selector));
        }
        else if (selector.nodeType || selector.length) {
            push.apply(elements, empty.concat(selector));
        }
        else {
            throw new TypeError("Unknown selector: " + selector);
        }

        return new Query(elements);
    }

    function Query (elements, parent) {
        this._elements = empty.concat(elements || empty);
        this._parent = parent;
    }

    Object.defineProperty(Query.prototype, 'length', {
        get: function () {
            return this._elements.length;
        },
        enumerable: false,
        configurable: false
    });

    Query.prototype.attr = function (name, value) {
        if (arguments.length === 1) {
            return this._elements[0].getAttribute(name);
        }
        else if (arguments.length === 2) {
            this._elements.forEach(function (node) {
                node.setAttribute(name, value);
            });
            return this;
        }
        else {
            throw new Error("Query#attr requires either one or two arguments");
        }
    };

    Query.prototype.closest = function (matching) {
        var startFrom = this._elements[0];
        while (startFrom) {
            if (startFrom.matches(matching)) {
                return new Query(startFrom, this);
            }
            else {
                startFrom = startFrom.parentNode;
            }
        }
        return new Query([], this);
    };

    Query.prototype.end = function () {
        if (!this._parent) {
            throw new Error("Query#end: cannot end chain, already at top level.");
        }
        return this._parent;
    };

    Query.prototype.is = function (matching) {
        return this._elements.every(function (node) {
            return node.matches(matching);
        });
    };

    Query.prototype.on = function (event, handler) {
        this._elements.forEach(function (node) {
            node.addEventListener(event, handler, true);
        });
        return this;
    };

    Query.prototype.submit = function () {
        if (!this.is('form')) {
            throw new TypeError("Query#submit: can only be called on a form");
        }
        this._elements.forEach(function (node) {
            node.submit();
        });
        return this;
    };

    return dom;

});
