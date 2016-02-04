import _ from 'lodash';
import Phaser from 'phaser';


import EventEmitter from 'external/EventEmitter';


import inputHelpers from 'lib/input';


import PhaserWrapper from 'phaserWrapper/PhaserWrapper';


import CardViewEvent from './CardViewEvent';


export default class CardView extends EventEmitter {
    static get CARD_WIDTH() {
        return 90;
    }


    static get CARD_HEIGHT() {
        return 120;
    }


    set faceUp (value) {
        let oldState = this._faceUp;
        this._faceUp = value;

        if (value !== oldState) {
            // TODO events
            this.render();
        }
    }
    get faceUp () { return this._faceUp; }


    set visible (value) { this._sprite.visible = value; }
    get visible () { return this._sprite.visible; }


    /**
     * @param {Object} point
     * @param {Number} point.x
     * @param {Number} point.y
     */
    set position(point) {
        this._sprite.x = point.x;
        this._sprite.y = point.y;
    }


    /**
     * @param {Number} value
     */
    set health(value) {
        this._data.health = value;
        this.render();
    }


    /**
     * @param {Number} value
     */
    set counter(value) {
        this._data.counter = value;
        this.render();
    }


    constructor(data) {
        super();

        this._sprite = null;
        this._background = null;
        this._data = data;
        this._isHighlighted = false;

        this._faceUp = true;

        this._createContainerSprite();
        if (data.isTapped) {
            this.tap();
        }
        this._addHandlers();
    }


    render() {
        this._sprite.removeChild();

        this._addBg();
        if (this.faceUp) {
            this._addHeader()
                ._addMiddle()
                ._addFooter();
        }
    }


    dispose() {
        this._sprite.kill();
    }


    tap() {
        this._sprite.angle = 90;
    }


    untap() {
        this._sprite.angle = 0;
    }


    highlightOn() {
        if (this._isHighlighted == false) {
            this._isHighlighted = true;
            this._background.tint = '0xffcccc';

            // Нужно для сортировки в PhaserWrapper
            this._sprite.highlight = true;
        }
    }


    highlightOff() {
        if (this._isHighlighted == true) {
            this._isHighlighted = false;
            this._background.tint = '0xffffff';

            // Нужно для сортировки в PhaserWrapper
            this._sprite.highlight = false;
        }
    }


    _addHandlers() {
        // Keyboard input
        var upKey = PhaserWrapper.game.input.keyboard.addKey(Phaser.Keyboard.UP);
        var downKey = PhaserWrapper.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        var leftKey = PhaserWrapper.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        var rightKey = PhaserWrapper.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);

        downKey.onDown.add(this._onDownKeyPress, this);
        upKey.onDown.add(this._onUpKeyPress, this);
        leftKey.onDown.add(this._onLeftKeyPress, this);
        rightKey.onDown.add(this._onRightKeyPress, this);

        // Mouse input
        this._sprite.inputEnabled = true;
        this._sprite.events.onInputDown.add(this._onClick, this);
        this._sprite.events.onInputOver.add(this._onOver, this);
        this._sprite.events.onInputOut.add(this._onOut, this);
    }


    _createContainerSprite() {
        this._sprite = PhaserWrapper.game.make.sprite(
            0, 0
        );
        this._sprite.pivot.x = this._sprite.width * .5;
        this._sprite.pivot.y = this._sprite.height * .5;

        PhaserWrapper.addToGroup('cards', this._sprite);

        this.render();
    }


    _addBg() {
        let bgImg = this.faceUp ? 'card_bg' : 'card_bg_facedown';

        this._background = PhaserWrapper.game.make.sprite(
            0, 0, bgImg
        );

        this._sprite.addChild(this._background);

        return this;
    }

    _addHeader() {
        var text = PhaserWrapper.game.make.text(
            8, 1,
            this._data.title,
            {
                font: "9px Arial",
                align: "center"
            }
        );
        var mana = PhaserWrapper.game.make.text(
            CardView.CARD_WIDTH - 14, 0,
            this._data.mana,
            {
                font: "bold 14px Arial",
                fill: "blue",
                align: "center"
            }
        );

        this._sprite.addChild(mana);
        this._sprite.addChild(text);

        return this;
    }

    _addMiddle() {
        var text = PhaserWrapper.game.make.text(
            3, 20,
            this._data.text,
            {
                font: "9px Arial"
            }
        );
        text.wordWrap = true;
        text.wordWrapWidth = CardView.CARD_WIDTH - 6;
        text.lineSpacing = -8;

        this._sprite.addChild(text);

        return this;
    }

    _addFooter() {
        var dmg = PhaserWrapper.game.make.text(
            6, CardView.CARD_HEIGHT - 18,
            this._data.dmg,
            {
                font: "bold 14px Arial",
                align: "center",
                fill: 'black'
            }
        );

        //counters
        var countersQuantity = this._data.counter || 0;
        var counters = _.range(countersQuantity).map(function(n) {
            var padding = n * 5;
            return PhaserWrapper.game.make.sprite(
                padding + (CardView.CARD_WIDTH / 2) - 25, CardView.CARD_HEIGHT - 25, 'counter'
            );
        });

        var hpValue = this._data.health === this._data.maxHealth
            ? '  ' + this._data.health
            : this._data.health + '/' + this._data.maxHealth;

        var hp = PhaserWrapper.game.make.text(
            CardView.CARD_WIDTH - 26, CardView.CARD_HEIGHT - 18,
            hpValue,
            {
                font: "bold 14px Arial",
                align: "center",
                fill: 'black'
            }
        );

        this._sprite.addChild(dmg);
        this._sprite.addChild(hp);
        counters.forEach(c => this._sprite.addChild(c), this);

        return this;
    }


    // Handlers
    _onClick(event, pointer) {
        var button = inputHelpers.getMouseButton(event);

        if (PhaserWrapper.game.input.keyboard.isDown(Phaser.Keyboard.CONTROL)) {
            this.emit(CardViewEvent.CTRL_CLICK);
        } else {
            if (button == Phaser.Mouse.LEFT_BUTTON) {
                this.emit(CardViewEvent.CLICK);
            } else if (button == Phaser.Mouse.RIGHT_BUTTON) {
                this.emit(CardViewEvent.RIGHT_CLICK);
            }
        }
    }


    _onDownKeyPress(event) {
        if (this._isHighlighted) {
            this.emit(CardViewEvent.DOWN_PRESS);
        }
    }


    _onLeftKeyPress(event) {
        if (this._isHighlighted) {
            this.emit(CardViewEvent.LEFT_PRESS);
        }
    }


    _onRightKeyPress(event) {
        if (this._isHighlighted) {
            this.emit(CardViewEvent.RIGHT_PRESS);
        }
    }


    _onUpKeyPress(event) {
        if (this._isHighlighted) {
            this.emit(CardViewEvent.UP_PRESS);
        }
    }


    _onOver(event) {
        if (this.faceUp) {
            this.emit(CardViewEvent.OVER);
        }
    }


    _onOut(event) {
        this.emit(CardViewEvent.OUT);
    }
}
