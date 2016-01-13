import CardStackViewManager from './../CardStackViewManager';


export default class GraveyardView extends CardStackViewManager {
    /**
     * @override
     */
    reorderCards(cardsViews) {
        let lastCardView = _.last(cardsViews);
        this.placeCard(lastCardView, this._x, this._y);

        _.slice(cardsViews, 0, -1).forEach(cv => cv.visible = false);
    }
}
