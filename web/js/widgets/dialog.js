define([
    'util/dom',
    'util/event',
    'util/template',
    'text!fragments/dialog.html'
], function (
    dom,
    event,
    template,
    html
) {

    'use strict';

    /**
     *
     * @constructor
     */
    function Dialog (model) {
        if (!this) {
            return new Dialog(model);
        }

        this.model = model;
        this.ok = 'OK';
        this.cancel = 'Cancel';
    }
    Dialog.prototype = Object.create(event.prototype);

    Dialog.prototype.buttons = function (ok, cancel) {
        this.ok = ok;
        this.cancel = cancel;
        return this;
    };

    Dialog.prototype._createDom = function (header, content) {
        return (
            this._dom = dom(html)
                .find('> header').text(header).end()
                .find('> section').html(content).end()
                .appendTo('body')
        );
    };

    Dialog.prototype._onClose = function (e) {
        debugger;
        this.emit('close', this.model);
    };

    Dialog.prototype.show = function (header, content) {
        this._createDom(header, content).get(0).show();
        return this;
    };

    Dialog.prototype.showModal = function (header, content) {
        debugger

        this._createDom(header, content)
            .addClass('modal')
            .on('close', this._onClose.bind(this))
            .model(this)
            .get(0).showModal();

        return this;
    };

    Dialog.prototype.close = function () {

    };

    return Dialog;

});
