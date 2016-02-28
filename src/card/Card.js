import EventEmitter from 'external/EventEmitter';
import CardView from 'card/CardView';
import CardFullView from 'card/CardFullView';
import CreatureView from 'card/CreatureView';
import CardEvent from 'card/CardEvent';
import CardViewEvent from 'card/CardViewEvent';
import FiledObjectsViewEvent from 'FiledObjectsViewEvent';
import Backend from 'Backend';


/**
 * @typedef {Object} CardData
 * @property {Number} id
 * @property {Number} x
 * @property {Number} y
 * @property {Boolean} onField
 * @property {Boolean} tapped
 * @property {Number} mana
 * @property {Number} health
 * @property {Number} maxHealth
 * @property {Number} counter
 * @property {String} title
 * @property {String} text
 * @property {String} imageName
 * @property {String} color
 * @property {String[]} attachedCards
 */


export default class Card extends EventEmitter {
    /**
     * @param {CardData} data
     */
    constructor(data) {
        super();


        /**
         * @type {CardData}
         * @private
         */
        this._data = data;


        /**
         * @type {Card[]}
         * @private
         */
        this._attachedCards = [];


        /**
         * @type {CardView}
         * @protected
         */
        this._cardView = null;


        /**
         * @type {CardFullView}
         * @protected
         */
        this._cardFullView = null;


        /**
         * @type {CreatureView}
         * @protected
         */
        this._fieldView = null;


        this._createCardView(this._data);
        if (this._data.onField) {
            this._createFieldView();
        }
    }


    /**
     * @returns {Number}
     */
    get id() { return this._data.id; }


    /**
     * @returns {Boolean}
     */
    get onField() { return this._data.onField; }


    /**
     * @returns {Boolean}
     */
    get tapped() { return this._data.tapped; }


    /**
     * @returns {String[]}
     */
    get attachedCardsIds() { return this._data.attachedCards; }


    /**
     * @returns {Card[]}
     */
    get attachedCards() { return _.clone(this._attachedCards); }


    /**
     * @returns {Object}
     */
    get position() { return {x: this._data.x, y: this._data.y}; }


    /**
     * @returns {CardView}
     */
    get cardView() { return this._cardView; }


    /**
     * @param {Object} point
     */
    set position(point) {
        //TODO: WTF?!?!
        [this._data.x, this._data.y] = [point.x, point.y];

        if (this._fieldView) {
            this._fieldView.position = point;
        }
    }


    /**
     * @param {Number} value
     */
    set health(value) {
        this._data.health = value;
        this._cardView.render();

        if (this._cardFullView) {
            this._cardFullView.render();
        }
    }


    /**
     * @param {Number} value
     */
    set counter(value) {
        this._data.counter = value;
        this._cardView.render();

        if (this._cardFullView) {
            this._cardFullView.render();
        }
    }


    dispose() {
        this._cardView.dispose();

        if (this._fieldView) {
            this._fieldView.dispose();
        }

        this.emit(CardEvent.DISPOSE);
    }


    tap() {
        this._data.tapped = true;
        this._cardView.tap();
    }


    untap() {
        this._data.tapped = false;
        this._cardView.untap();
    }


    play(position) {
        this._createFieldView();
        this.position = position;
    }


    die() {
        this._fieldView.dispose();
        this._data.onField = false;
    }


    highlightOn() {
        if (this._fieldView) {
            this._fieldView.highlightOn();
        }
        this._cardView.highlightOn();
    }


    highlightOff() {
        if (this._fieldView) {
            this._fieldView.highlightOff();
        }
        this._cardView.highlightOff();
    }


    /**
     * @param {Card} card
     */
    attachCard(card) {
        this._attachedCards.push(card);
        if (!_.contains(this._data.attachedCards)) {
            this._data.attachedCards.push(card.id);
        }
    }


    _createCardView(data) {
        this._cardView = new CardView(data);
        this._cardView.parent = this;

        this._cardView.on(
            CardViewEvent.CLICK, this._onCardViewClick.bind(this)
        );

        this._cardView.on(
            CardViewEvent.RIGHT_CLICK, this._onCardViewRightClick.bind(this)
        );

        this._cardView.on(
            CardViewEvent.CTRL_CLICK, this._onCardViewCtrlClick.bind(this)
        );

        this._cardView.on(
            CardViewEvent.OVER, this._onCardViewOver.bind(this)
        );

        this._cardView.on(
            CardViewEvent.OUT, this._onCardViewOut.bind(this)
        );

        this._cardView.on(
            CardViewEvent.UP_PRESS, this._onCardViewUpPress.bind(this)
        );

        this._cardView.on(
            CardViewEvent.DOWN_PRESS, this._onCardViewDownPress.bind(this)
        );

        this._cardView.on(
            CardViewEvent.LEFT_PRESS, this._onCardViewLeftPress.bind(this)
        );

        this._cardView.on(
            CardViewEvent.RIGHT_PRESS, this._onCardViewRightPress.bind(this)
        );

        this._cardView.on(
            CardViewEvent.ZOOM_IN, this._onCardViewZoomIn.bind(this)
        );

        this._cardView.on(
            CardViewEvent.ZOOM_OUT, this._onCardFullViewZoomOut.bind(this)
        );
    }

    _createCardFullView() {
        this._cardFullView = new CardFullView(this._data);
        this._cardFullView.parent = this;

        this._cardFullView.on(
            CardViewEvent.CLICK, this._onCardFullViewZoomOut.bind(this)
        );
    }

    _createFieldView() {
        var data = this._data;
        this._fieldView = new CreatureView(
            data.x, data.y, data.imageName, data.color
        );
        this._fieldView.parent = this;
        this._data.onField = true;

        this._fieldView.on(
            FiledObjectsViewEvent.CLICK, this._onFieldViewClick.bind(this)
        );

        this._fieldView.on(
            FiledObjectsViewEvent.OVER, this._onFieldViewOver.bind(this)
        );

        this._fieldView.on(
            FiledObjectsViewEvent.OUT, this._onFieldViewOut.bind(this)
        );
    }

    // Field view handlers
    _onFieldViewClick(event) {
        this.emit(CardEvent.FIELD_CLICK);
    }


    _onFieldViewOver(event) {
        this.highlightOn();
    }


    _onFieldViewOut(event) {
        this.highlightOff();
    }


    // Card view handlers
    _onCardViewClick(event) {
        this.emit(CardEvent.CARD_CLICK);
    }


    _onCardViewRightClick(event) {
        if (this._data.tapped) {
            this.emit(CardEvent.PRESS_UNTAP);
        } else {
            this.emit(CardEvent.PRESS_TAP);
        }
    }

    _onCardViewOver(event) {
        this.highlightOn();
        this.emit(CardEvent.OVER);
    }


    _onCardViewOut(event) {
        this.highlightOff();
        this.emit(CardEvent.OUT);
    }


    _onCardViewCtrlClick(event) {
        this.emit(CardEvent.PLAY_AS_MANA);
    }


    _onCardViewUpPress(event) {
        Backend.addHealth(this._data.id, 1);
    }


    _onCardViewDownPress(event) {
        Backend.addHealth(this._data.id, -1);
    }


    _onCardViewLeftPress(event) {
        Backend.addCounter(this._data.id, -1);
    }


    _onCardViewRightPress(event) {
        Backend.addCounter(this._data.id, +1);
    }


    _onCardViewZoomIn(event) {
        if (!this._cardFullView) {
            this._createCardFullView();
        }
        this._cardFullView.visible = true;
    }


    _onCardFullViewZoomOut(event) {
        this._cardFullView.visible = false;
    }
}
