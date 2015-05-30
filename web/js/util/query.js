define(function () {

    'use strict';

    var empty = [];
    var push = empty.push;
    var dataCache = {};
    var unique = function (node) {
        var elementId;
        if (!(elementId = node.dataset.elementId)) {
            elementId = node.dataset.elementId = (unique.unique = (unique.unique || Date.now()) + 1);
        }

        if (!dataCache[elementId]) {
            dataCache[elementId] = {
                _node: node,
                _has: function (key) {
                    return this.hasOwnProperty(key);
                }
            };
        }

        return elementId;
    };

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

    Query.prototype.addClass = function (className) {
        this._elements.forEach(function (node) {
            node.classList.add(className);
        });
        return this;
    };

    Query.prototype.appendTo = function (toWhat) {
        var elements = this._elements;
        Query.build(toWhat)._elements.forEach(function (element) {
            elements.forEach(element.appendChild, element);
        });
        return this;
    };

    Query.prototype.attr = function (name, value) {
        if (arguments.length === 1) {
            return this._elements[0].getAttribute(name);
        }
        else if (arguments.length === 2) {
            return this.each(function (node) {
                node.setAttribute(name, value);
            });
        }
        else {
            throw new Error("Query#attr requires either one or two arguments");
        }
    };

    Query.prototype.before = function (content) {
        var isString = typeof content === 'string';
        return this.each(function (element) {
            isString
                ? element.insertAdjacentHTML('beforeBegin', content)
                : element.parentNode && element.parentNode.insertBefore(content, element);
        });
    };

    Query.prototype.children = function (matching) {
        var query = new Query(null, this);
        this._elements.forEach(function (element) {
            push.apply(query._elements, empty.filter.call(element.childNodes, function (child) {
                return child.nodeType === 1 && (!matching || child.matches(matching));
            }));
        });
        return query;
    };

    Query.prototype.clone = function () {
        return new Query(this._elements.map(function (element) {
            return element.cloneNode(true);
        }), this);
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

    Query.prototype.css = function (property, value) {
        return this.each(function (element) {
            element.style[property] = value;
        });
    };

    Query.prototype.data = function (name, value) {
        if (arguments.length === 1 && !this._elements.length) {
            return null;
        }
        else if (arguments.length === 1) {
            var element = this._elements[0];
            var elementId = unique(element);

            return dataCache[elementId]._has(name) ? dataCache[elementId][name] : element.dataset[name] || null;
        }
        else if (value && typeof value === 'object') {
            return this.each(function (node) {
                dataCache[unique(node)][name] = value;
            });
        }
        else {
            return this.each(function (node) {
                node.dataset[name] = value;
            });
        }
    };

    Query.prototype.each = function (callback) {
        this._elements.forEach(callback);
        return this;
    };

    Query.prototype.empty = function () {
        return this.each(function (element) {
            while (element.hasChildNodes()) {
                element.removeChild(element.lastChild);
            }
        });
    };

    Query.prototype.end = function () {
        if (!this._parent) {
            throw new Error("Query#end: cannot end chain, already at top level.");
        }
        return this._parent;
    };

    Query.prototype.find = function (matching) {
        if (matching.trim().charAt(0) === '>') {
            return this.children(matching.substr(1));
        }

        var query = new Query(null, this);
        this._elements.forEach(function (element) {
            push.apply(query._elements, element.querySelectorAll(matching));
        });
        return query;
    };

    Query.prototype.get = function (index) {
        return this._elements[index];
    };

    Query.prototype.html = function (content) {
        return this.each(function (element) {
            element.innerHTML = content;
        });
    };

    Query.prototype.insertAfter = function (reference) {
        if (reference instanceof Query) {
            reference = reference.get(0);
        }

        if (!reference) {
            throw new Error("Query:insertAfter requires a valid reference node");
        }

        return this.each(function (node) {
            reference.parentNode.insertBefore(node, reference.nextSibling);
        });
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

    Query.prototype.prop = function (name, value) {
        if (arguments.length === 1) {
            return this._elements.length && this._elements[0][name] || undefined;
        }

        return this.each(function (element) {
            element[name] = value;
        });
    };

    Query.prototype.remove = function () {
        return this.each(function (element) {
            element.parentNode && element.parentNode.removeChild(element);
            delete dataCache[element.dataset.elementId];
        });
    };

    Query.prototype.removeAttr = function (name) {
        return this.each(function (node) {
            node.removeAttribute(name);
        });
    };

    Query.prototype.submit = function () {
        if (!this.is('form')) {
            throw new TypeError("Query#submit: can only be called on a form");
        }
        return this.each(function (node) {
            node.submit();
        });
    };

    Query.prototype.text = function (content) {
        if (!arguments.length) {
            return this._elements.length && this._elements[0].textContent || '';
        }

        return this.empty().each(function (element) {
            element.appendChild(document.createTextNode(content === undefined ? '' : content));
        });
    };

    Query.prototype.val = function (value) {
        return this.each(function (element) {
            element.value = value;
        });
    };

    Query.data = function (node, name, value) {
        var cache = dataCache[unique(node)];
        if (arguments.length === 2) {
            return cache.hasOwnProperty('name') ? cache[name] : cache.dataset[name];
        }

        if (arguments.length === 3) {
            cache[name] = value;
        }
    };

    Query.fragment = function (fragment) {
        fragment = String(fragment).trim();
        if (!Query.fragment[fragment]) {
            (Query.fragment[fragment] = document.createElement('div')).innerHTML = fragment;
        }
        return Query.fragment[fragment].cloneNode(true).childNodes;
    };

    Query.extend = function (name, handler) {
        Query.prototype[name] = handler;
        return Query;
    };

    Query.build = function (selector, baseNode) {
        var elements = [];
        if (selector instanceof Query) {
            return selector;
        }
        else if (/^\s*</.test(selector)) {
            push.apply(elements, Query.fragment(selector));
        }
        else if (typeof selector === "string") {
            push.apply(elements, (baseNode || document).querySelectorAll(selector));
        }
        else if (selector && (selector.nodeType || selector.hasOwnProperty('length'))) {
            push.apply(elements, empty.concat(selector));
        }
        else {
            throw new TypeError("Unknown selector: " + selector);
        }

        return new Query(elements);
    };

    return Query;

});
