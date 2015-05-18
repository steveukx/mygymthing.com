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
    function Dialog (model, header) {
        var dialog = this || Object.create(Dialog.prototype);

        dialog.model = model;
        dialog.header = header;
        dialog.actions = ['Cancel', 'OK'];

        return dialog;
    }
    Dialog.prototype = Object.create(event.prototype);

    Dialog.prototype.buttons = function (ok, cancel) {
        this.actions = [].slice.call(arguments);
        return this;
    };

    Dialog.prototype._createDom = function (content) {
        return (
            this._dom = dom(html)
                .find('> section').html(content).end()
                .find('> footer').on('click', this._onActionClick.bind(this)).end()
                .appendTo('body')
        );
    };

    Dialog.prototype._onActionClick = function (e) {
        var buttonData = dom(e.target).data('templateData');
        var action = typeof buttonData === 'string' ? buttonData : buttonData && buttonData.action;

        if (action) {
            this.emit(action, this.model);
        }

        this._dom.get(0).close();
    };

    Dialog.prototype._onClose = function (e) {
        this.emit('close', this.model);
        this._dom.remove();
    };

    Dialog.prototype.show = function (content) {
        this._createDom(content).get(0).show();
        return this;
    };

    Dialog.prototype.showModal = function (content) {
        this._createDom(content)
            .addClass('modal')
            .on('close', this._onClose.bind(this))
            .model(this)
            .get(0).showModal();

        return this;
    };

    Dialog.prototype.close = function () {

    };

    Dialog.alert = function (message, title) {
        return (new Dialog({}, title || '')
                    .buttons({text: 'OK', action: 'ok'})
                    .showModal(message));
    };

    return Dialog;

});
