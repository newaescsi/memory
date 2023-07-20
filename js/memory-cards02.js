

const imageDirectory = '/img/horror/';
const numberOfImages = 16;

function getCards(){
    const cards = [];
    for (let i =1; i <= numberOfImages; i++){
        cards.push({
            id: i,
            img: `${imageDirectory}${i < 10 ? '0' : ''}${i}.jpg`
        });
       
    }
    return cards;

}

export default{
    dir : imageDirectory,
    amount: numberOfImages,
    getCards
};

