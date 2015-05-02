define([
    'util/dom',
    'util/query',
    'util/string'
], function (
    dom,
    Query,
    string
) {

    /**
     *
     *
     * @name template
     */
    function template (element, model) {
        var handlerCache = [];
        var ignoreTree = [];
        ignoreTree.ignore = function (node) {
            return ignoreTree.some(function (tree) {
                return tree.contains(node);
            });
        };

        var reverseUpdate = function (key, value) {
            model[key] = value;
        };

        Object.observe(model, function (changes) {
            changes.forEach(function (change) {
                handlerCache.forEach(function (entry) {
                    entry.handler(model, change.name);
                });
            });
        }, ['add', 'delete', 'update']);

        dom(element).find('*').each(function (node) {
            if (ignoreTree.ignore(node)) {
                return;
            }

            Object.keys(node.dataset).forEach(function (pluginName) {
                var plugin = template.plugins[pluginName];

                if (!plugin) {
                    return;
                }

                var handler = plugin(
                    dom(node),
                    node.dataset[pluginName],
                    reverseUpdate
                );

                if (plugin.subTree) {
                    ignoreTree.push(node);
                    if (typeof handler === 'function') {
                        handler(model);
                    }
                }
                else if (typeof handler === 'function') {
                    handlerCache.push({
                        node: node,
                        handler: handler
                    });
                }
            });
        });

        handlerCache.forEach(function (entry) {
            entry.handler(model, null);
        });
    }

    template.plugins = [];
    template.plugins.register = function (name, handler) {
        template.plugins[template.plugins.length] = template.plugins[name] = handler;
        [].slice.call(arguments, 3).reduce(function (property, value) {
            if (property) {
                handler[string.camelCase(property)] = value;
            }
            else {
                return value;
            }
        }, arguments[2] || null);
    };

    template.plugins.register('model', function (node, key, reverseUpdate) {
        if (node.is('input[type=checkbox], input[type=radio]')) {
            node.on('click', function () {
                reverseUpdate(key, this.checked);
            });

            return function (model, changed) {
                if (changed === key) {
                    node.prop('checked', model.hasOwnProperty(key) && model[key]);
                }
            }
        }
        else if (node.is('input, textarea')) {
            node.on('change', function () {
                reverseUpdate(key, this.value);
            });

            return function (model, changed) {
                if (changed === key) {
                    node.val(model.hasOwnProperty(key) ? model[key] : '');
                }
            };
        }
    });

    template.plugins.register('bind', function (node, key, reverseUpdate) {
        return function (model) {
            template(node, model[key]);
        };
    }, 'sub-tree', true);

    template.plugins.register('text', function (node, key, reverseUpdate) {
        return function (model) {
            node.text(model[key] || '');
        }
    });

    template.plugins.register('show', function (node, key, reverseUpdate) {
        return function (model) {
            node.css('display', model[key] ? '' : 'none');
        };
    });

    Query.extend('model', function (model) {
        return this.each(function (element) {
            template(element, model);
        });
    });

    return template;
});
