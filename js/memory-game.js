class MemoryGame {

    constructor(opts) {
        this.node = opts.selector;
        this.cards = opts.cards.concat(opts.cards);
        this.board = this.node.querySelector('.memory-board');
        this.startGame();
    }

    startGame() {
        this.render();
    }

    reset() {      
    }

    render() {
        this.board.innerHTML = '';
        this.cards.forEach((card, i) => {
            this.board.innerHTML += this.renderCard(card, i);
        });
    }

    renderCard(card) {
        return `
            <div class="memory-card-item" data-card="${card.id}">
                <div class="memory-card-item-inner">
                    <div class="memory-card-item-front"></div>
                    <div class="memory-card-item-back">
                        <img src="../${card.img}" />
                    </div>
                </div>
            </div>
        `;
    }

}