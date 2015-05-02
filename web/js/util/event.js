define(function () {

    function Event () {
    }

    Event.eventList = function (event, name) {
        if (!event._events) {
            event._events = {};
        }
        if (!event._events[name]) {
            event._events[name] = new EventList();
        }

        return event._events[name];
    };

    Event.eventLists = function (event) {
        return Object.keys(event._events || {}).map(function (name) {
            return event._events[name];
        });
    };

    Event.prototype.on = function (name, handler, scope) {
        Event.eventList(this, name).push(handler, scope);
        return this;
    };

    Event.prototype.off = function (name, handler, scope) {
        switch (arguments.length) {
            case 0:
                delete this._events;
                break;
            case 1:
                if (typeof name === 'string') {
                    Event.eventList(this, name).empty();
                }
                else {
                    Event.eventLists(this).forEach(function (eventList) {
                        eventList.off(name);
                    });
                }
                break;
            case 2:
                if (typeof name === 'string') {
                    Event.eventList(this, name).off(handler);
                }
                else {
                    Event.eventLists(this).forEach(function (eventList) {
                        eventList.off(name, handler);
                    });
                }
                break;

            case 3:
                Event.eventList(this, name).off(handler, scope);
                break;
        }
        return this;
    };

    Event.prototype.emit = function (name) {
        Event.eventList(this, name).run([].slice.call(arguments, 1));
        return this;
    };

    function EventList () {
        this.subscribers = [];
    }

    EventList.prototype.off = function (handler, scope) {
        var both = arguments.length > 1;
        this.subscribers = this.subscribers.filter(function (subscriber) {
            if (subscriber.is(handler) && (!both || subscriber.is(scope))) {
                return false;
            }
        });
    };

    EventList.prototype.empty = function () {
        this.subscribers.length = 0;
    };

    EventList.prototype.push = function (handler, scope) {
        this.subscribers.push(new Subscriber(handler, scope));
    };

    EventList.prototype.run = function (eventData) {
        this.subscribers.every(function (subscriber) {
            return subscriber.run(eventData) !== false;
        });
    };

    function Subscriber (handler, scope) {
        this.handler = handler;
        this.scope = scope;
    }

    Subscriber.prototype.run = function (eventData) {
        return this.handler.apply(this.scope, eventData);
    };

    Subscriber.prototype.is = function (test) {
        return this === test || this.handler === test || (this.scope && this.scope === test);
    };

    return Event;

});
