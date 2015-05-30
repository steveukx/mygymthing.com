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

        typeof model ==="object" && Object.observe(model, function (changes) {
            changes.forEach(function (change) {
                handlerCache.forEach(function (entry) {
                    entry.handler(model, change.name);
                });
            });
        }, ['add', 'delete', 'update']);

        var bindTemplate = function (isChildNode) {
            return function (node) {
                if (ignoreTree.ignore(node)) {
                    return;
                }

                var plugins = Object.keys(node.dataset).map(function (pluginName) {
                    return template.plugins[pluginName];
                }).filter(Boolean).sort(function (a, b) {
                    return a.priority - b.priority
                });

                plugins.some(function (plugin) {
                    if (plugin.subTree && !isChildNode) {
                        return;
                    }

                    var handler = plugin(
                        dom(node),
                        node.dataset[plugin.plugin],
                        reverseUpdate
                    );

                    if (plugin.subTree) {
                        ignoreTree.push(node);
                        if (typeof handler === 'function' && !plugin.handlerCache) {
                            handler(model);
                        }
                    }

                    if (typeof handler === 'function' && (!plugin.subTree || plugin.handlerCache)) {
                        handlerCache.push({
                            node: node,
                            handler: handler
                        });
                    }

                    if (typeof handler !== 'function' && plugin.templateData) {
                        Query.data(node, 'templateData', model);
                    }

                    return plugin.subTree;
                });
            };
        };

        dom(element)
            .each(bindTemplate(false))
            .find('*').each(bindTemplate(true));

        handlerCache.forEach(function (entry) {
            dom(entry.node).data('templateData', model);
            entry.handler(model, null);
        });
    }

    template.eval = function (model, key) {
        var cacheKey = ':' + key;

        if (!template.eval[cacheKey]) {
            template.eval[cacheKey] = new Function ('model', 'return model.' + key + ';');
        }
        return template.eval[cacheKey](model);
    };

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

        if (handler.hasOwnProperty('priority')) {
            template.plugins.splice(handler.prority, 0, template.plugins.pop());
        }
        else {
            handler.priority = 1000;
        }
        handler.plugin = name;
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

    template.plugins.register('if', function (node, key, reverseUpdate) {
        var placeHolder = node.before('<!-- if -->').get(0).previousSibling;
        var content = node.remove().clone();
        var current;

        return function (model, update) {
            var exists = template.eval(model, key);
            if (exists && !current) {
                current = content
                    .clone()
                    .insertAfter(placeHolder)
                    .model(model);
            }
            else if (!exists && current) {
                console.log('TODO: validate');
                current.remove();
            }
        };
    }, 'sub-tree', true, 'handler-cache', true);

    template.plugins.register('bind', function (node, key, reverseUpdate) {
        return function (model) {
            template(node, model[key]);
        };
    }, 'sub-tree', true);

    template.plugins.register('text', function (node, key, reverseUpdate) {
        return function (model) {
            var data = (key === 'text' && typeof model === 'string') ? model : template.eval(model, key);
            node.text(data || '');
        };
    });

    template.plugins.register('show', function (node, key, reverseUpdate) {
        return function (model) {
            node.css('display', model[key] ? '' : 'none');
        };
    });

    template.plugins.register('repeat', function (node, key, reverseUpdate) {
        var placeholder, items = [], obj, observer, built;

        var observe = function (_obj, _observer) {
            if (obj && observer) {
                Object.unobserve(obj, observer);
            }
            Object.observe(obj = _obj, observer = _observer);

            if (!built) {
                placeholder = node.get(0);
                placeholder.insertAdjacentHTML('beforeBegin', '<!-- repeater -->');
                placeholder = placeholder.previousSibling;

                node.removeAttr('data-repeat').remove();
            }
        };

        var populate = function (item, index) {
            var referenceNode = items.slice(0, index).pop() || placeholder;

            items[index] = (node
                            .clone()
                            .insertAfter(referenceNode)
                            .model(item));
        };

        return function (model) {
            var repeatable = template.eval(model, key);
            observe(repeatable, function (changes) {
                console.log('TODO, observing change in repeat model')
            });

            repeatable.forEach(populate);
        };
    }, 'sub-tree', true, 'priority', 0);

    template.plugins.register('click', function (node, key) {
        node.on('click', function (e) {
            var model = node.data('templateData');
            var handler = template.eval(model, key);

            if (typeof handler === 'function') {
                handler.call(model, e);
            }
        });
    }, 'template-data', true);

    Query.extend('model', function (model) {
        return this.each(function (element) {
            template(element, model);
        });
    });

    return template;
});
