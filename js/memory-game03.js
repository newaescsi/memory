class MemoryGame {

    /*
    Der Konstruktor der Klasse MemoryGame nimmt ein opts-Objekt als Argument entgegen. 
    Er initialisiert verschiedene Eigenschaften wie 
    node, 
    cards, 
    clickedCards, 
    timeout, 
    cardMoves, 
    cardsCollected, 
    cardsMatch und Referenzen zu verschiedenen DOM-Elementen, die mit dem Spiel zusammenhängen.
    */
    constructor(opts) {
        this.node = opts.selector;
        this.cards = opts.cards.concat(opts.cards);

        this.clickedCards = [];
        this.timeout = null;

        this.cardMoves = 0;

        // how many cards have been collected so far
        this.cardsCollected = 0;
        this.cardsMatch = 0;

        this.board = this.node.querySelector('.memory-board');
        this.modal = this.node.querySelector('.modal');
        this.playBtn = this.node.querySelector('.playBtn');
        this.memoryMoves = this.node.querySelector('#memoryMoves');
        this.memoryMatches = this.node.querySelector('#memoryMatches');

        this.playBtn.addEventListener('click', (e) => {
            this.closeModal();
            this.startGame();
        });

        this.startGame();
    }

    /*
    startGame(): 
    Diese Methode wird zu Beginn aufgerufen, 
    um ein neues Spiel zu starten. Sie setzt den Spielstatus zurück, 
    mischt die Karten, 
    rendert sie auf dem Spielfeld und richtet Klick-Ereignis-Listener für jedes Karten-Element ein.
    */
    startGame() {
        this.reset();
        this.shuffleCards();
        this.render();
        this.updateUI();

        this.cardCollectionBox = document.getElementById('memoryMatchesCards').getBoundingClientRect();

        const cardElements = this.node.querySelectorAll('.memory-card-item');
        cardElements.forEach(cardElement => {
            cardElement.addEventListener('click', (e) => {
                e.preventDefault()
                // prevent double click
                if (!e.detail || e.detail === 1) {
                    this.cardClicked(e);
                }
            });
        });
    }

   /*
   cardClicked(e): 
   Diese Methode ist der Klick-Event-Handler für die Karten-Elemente. 
   Wenn eine Karte angeklickt wird, überprüft sie,
   ob die Karte bereits gelöst oder sichtbar ist (bereits gefunden oder bereits umgedreht). 
   Falls nicht, 
   fügt sie die angeklickte Karte zum clickedCards-Array hinzu und prüft, 
   ob zwei Karten angeklickt wurden. Wenn zwei Karten angeklickt wurden, 
   überprüft sie, ob sie übereinstimmen, 
   aktualisiert den Spielzustand entsprechend (übereinstimmende Karten werden gesammelt und versteckt, 
   nicht übereinstimmende Karten werden wieder umgedreht) und überprüft, ob das Spiel beendet ist.
   */
    cardClicked(e) {
        const clickedCard = e.currentTarget;

        if (clickedCard.classList.contains('solved') || clickedCard.classList.contains('visible')) {
            return false;
        }

        if (this.clickedCards.length >= 2) {
            return false;
        }

        if (this.clickedCards.length <= 1) {
            clickedCard.classList.toggle('visible');
            this.clickedCards.push(clickedCard);

            if (this.clickedCards.length < 2) {
                return false;
            }
        }

        if (this.matchCards(this.clickedCards[0].getAttribute('data-card'), this.clickedCards[1].getAttribute('data-card'))) {
            this.cardsCollected += 2;
            this.cardsMatch++;

            setTimeout(() => {
                this.moveSlide('#match');
            }, 300);

            setTimeout(() => {
                this.clickedCards.forEach(card => {
                    card.classList.add('solved');
                    this.collectCard(card);
                });

                this.clickedCards = [];
                this.checkGameEnd();
            }, 1000);

        } else {

            setTimeout(() => {
                this.clickedCards.forEach(card => {
                    card.classList.add('visible');
                });
                this.moveSlide('#noMatch');
            }, 300);

            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {

                this.clickedCards.forEach(card => {
                    card.classList.remove('visible');
                    card.classList.remove('no-match');
                });
                this.clickedCards = [];
            }, 1000);
        }

        this.cardMoves++;
        this.updateUI();
    }

   
    /*
    reset(): 
    Diese Methode setzt die Spielvariablen wie cardMoves, cardsCollected und cardsMatch auf ihre Anfangswerte zurück.
    */
    reset() {
        this.cardMoves = 0;
        this.cardsCollected = 0;
        this.cardsMatch = 0;
    }

    
    /*
    matchCards(a, b): Diese Methode überprüft, 
    ob zwei Karten die gleiche id haben, was bedeutet, dass sie übereinstimmen.
    */
    matchCards(a, b) {
        return a === b;
    }

    /*
    collectCard(card): Diese Methode animiert eine Karte von ihrer ursprünglichen Position zu einer Sammelbox, 
    was bedeutet, dass die Karte als Teil eines gefundenen Paares gesammelt wurde.
    */
    collectCard(card) {
        const cardBox = card.getBoundingClientRect();
        const cardPosX = window.scrollX + cardBox.left;
        const cardPosY = window.scrollY + cardBox.top;

        let moveItemA = document.createElement('div');
        moveItemA.className = 'move-item';
        moveItemA.style.width = cardBox.width + 'px';
        moveItemA.style.height = cardBox.height + 'px';
        moveItemA.style.left = `${cardPosX}px`;
        moveItemA.style.top = `${cardPosY}px`;
        moveItemA.appendChild(card.querySelector('img').cloneNode());
        document.body.appendChild(moveItemA);

        setTimeout(() => {
            moveItemA.style.left = `${window.scrollX + this.cardCollectionBox.left}px`;
            moveItemA.style.top = `${window.scrollY + this.cardCollectionBox.top}px`;
            moveItemA.style.opacity = '0.0';
            moveItemA.style.scale = '0.5';
        }, 50);
    }

   
    /*
    shuffleCards(): Diese Methode mischt die Reihenfolge der Karten zufällig, um eine neue Spielanordnung zu erstellen.
    */
    shuffleCards() {
        this.cards.sort(() => Math.random() - 0.5);
    }

    
    /*
    render(): Diese Methode rendert die Karten auf dem Spielfeld, 
    indem sie die entsprechenden HTML-Elemente erstellt.
    */
    render() {
        this.board.innerHTML = '';
        this.cards.forEach((card, i) => {
            this.board.innerHTML += this.renderCard(card, i);
        });
    }

    
    /*
    renderCard(card): 
    Diese Methode liefert den HTML-Code für ein einzelnes Karten-Element mit einer Vorder- und Rückseite. 
    Die Vorderseite ist anfangs sichtbar, und die Rückseite enthält ein Bild, das die Karte repräsentiert.
    */
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


    /*
    updateUI(): 
    Diese Methode aktualisiert die Benutzeroberfläche und zeigt die aktuelle Anzahl der Züge und Übereinstimmungen auf dem Spielfeld an.
    */
    updateUI() {
        this.memoryMoves.innerHTML = this.cardMoves;
        this.memoryMatches.innerHTML = this.cardsMatch;
    }
    /*
    checkGameEnd(): 
    Diese Methode überprüft, 
    ob alle Karten gesammelt wurden (alle Paare wurden gefunden) und löst die Anzeige eines Modals aus, 
    um anzuzeigen, dass das Spiel beendet ist.
    */
    checkGameEnd() {
        if (this.cards.length === this.cardsCollected) {
            this.openModal('#modal-finish');
        }
    }

    /*
    moveSlide(slideId): Diese Methode fügt eine CSS-Klasse hinzu, 
    um eine bestimmte Folie anzuzeigen, und entfernt sie dann nach einer kurzen Verzögerung, 
    um einen Animations-Effekt zu erzeugen.
    */
    moveSlide(slideId) {
        let moveSlide = this.node.querySelector(slideId);
        moveSlide.classList.add('show');
        setTimeout(() => {
            moveSlide.classList.remove('show');
        }, 1000);
    }

    /*
    openModal() und closeModal(): 
    Diese Methoden zeigen ein Modal an bzw. verbergen es. Das Modal wird verwendet, 
    um das Spielende anzuzeigen, wenn das Spiel beendet ist.
    */
    openModal() {
        this.modal.classList.add('modal-show');
    }

    closeModal() {
        this.modal.classList.remove('modal-show');
    }
}