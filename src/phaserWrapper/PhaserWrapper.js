import _ from 'lodash';

global.PIXI = require('pixi.js');
global.p2 = require('p2');

var Phaser = require('phaser');


/**
 * Create, set up, and contain instance of Phaser.Game. Singleton.
 */
class PhaserWrapper {
    set createFinished(value) { this._createFinished = value; }
    get game() { return this._game; }


    constructor() {
        this._game = new Phaser.Game(
            1200, 960, Phaser.AUTO, 'gameView', null, true, true
        );

        // Объект из Phaser.Group, где ключ название группы. @see this._createGroups
        this._groups = {};

        this._game.state.add('Boot', {
            preload: this._preload.bind(this),
            create: this._create.bind(this),
            update: this._update.bind(this),
            render: this._render.bind(this)
        });

        this._game.state.start('Boot');
    }


    /**
     *
     * @param {String} name
     * @param {Phaser.Sprite} sprite
     * @link _createGroups
     * @link refreshGroupSorting
     */
    addToGroup(name, sprite) {
        if (this._groups[name]) {
            this._groups[name].add(sprite);
        } else {
            console.warn('Группы с названием "%s" не существует', name);
        }
    }


    refreshAllGroupsSorting() {
       _.forEach(['creatures', 'areas', 'tiles'], name => this.refreshGroupSorting(name));
    }


    /**
     * @param {String} name
     * @link _sortGroupZByY
     */
    refreshGroupSorting(name) {
        this._sortGroupZByY(name);
    }


    _sortGroupZByY(name) {
        this._groups[name].sort('y', Phaser.Group.SORT_ASCENDING)
    }


    _preload() {
        this._game.load.image('tile', '../assets/tile.png');
        
        MeteorApp.imageFileNames.forEach(function(imageFileName) {
            this._game.load.image(imageFileName, '../assets/creatures/' + imageFileName + '.png');
        }.bind(this));
        
        this._game.load.image('card_bg', '../assets/card1.png');
        this._game.load.image('card_bg_facedown', '../assets/card2.png');
    }


    _create() {
        this._createGroups();
        this._createFinished();
    }


    _update() {
       this.refreshAllGroupsSorting();

    }


    _render() {

    }


    /*
     Создает объект из Phaser.Group, где ключ название группы
     */
    _createGroups() {
        let groupNames = [
            'tiles',
            'areas',
            'creatures',
            'cards'
        ];

        this._groups = _.reduce(groupNames, function (obj, name) {
            obj[name] = this._game.add.group(undefined, name);
            return obj;
        }.bind(this), {});
    }
}


// Всегда отдает один инстанс
export default new PhaserWrapper();
