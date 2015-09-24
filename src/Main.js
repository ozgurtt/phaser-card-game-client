/**
 *
 * @see:
 * Created by Alex Kalmakov <st00nsa@gmail.com>
 */

var PhaserWrapper = require('phaserWrapper/PhaserWrapper');
var GameField = require('field/GameField');


/**
 * Main class of game.
 */
class Main {
    constructor() {
        PhaserWrapper.createFinished = this._init;
    }


    _init() {
        this.gameField = new GameField();
    }
}


var main = new Main();
