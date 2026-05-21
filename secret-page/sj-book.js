const bookIcon = document.querySelector('.Book-icon');
const bookOverlay = document.querySelector('.book-overlay');
const bookCloseBtn = document.querySelector('.close-book-btn');

if (bookIcon) {
    bookIcon.addEventListener('click', () => {
        bookOverlay.classList.add('active');
        playButtonSFX();
    });
}

if (bookCloseBtn) {
    bookCloseBtn.addEventListener('click', () => {
        bookOverlay.classList.remove('active');
        playButtonSFX();
    })
}

const preBtn = document.querySelector('.pre-btn');
const nextBtn = document.querySelector('.next-btn');
const book = document.querySelector('.book');

const paper1 = document.getElementById('p1');
const paper2 = document.getElementById('p2');
const paper3 = document.getElementById('p3');

preBtn.addEventListener('click', goPrePage);
nextBtn.addEventListener('click', goNextPage);

let currentLocation = 1;
let numberOfPaper = 3;
let maxLocation = numberOfPaper + 1;

function openBook () {
    book.style.transform = "translateX(50%)";
    preBtn.style.transform = "translateX(-30%)";
    nextBtn.style.transform = "translateX(30%)";
}

function closeBook (isAtBeginning) {
    if (isAtBeginning){
        book.style.transform = "translateX(0%)";
    } else {
        book.style.transform = "translateX(100%)";
    }
    
    preBtn.style.transform = "translateX(0%)";
    nextBtn.style.transform = "translateX(0%)";
}

function goNextPage () {
    if (currentLocation < maxLocation) {
        playPaperFlipSFX();
        switch(currentLocation) {
            case 1: 
                openBook();
                paper1.classList.add('flipped');
                paper1.style.zIndex = 1;
                break;
            case 2: 
                paper2.classList.add('flipped');
                paper2.style.zIndex = 2;
                break;
            case 3:
                paper3.classList.add('flipped');
                paper3.style.zIndex = 3;
                closeBook(false);
                break;
            default:
                throw new Error ('unknown state');
        }
        currentLocation++;
    }
}

function goPrePage () {
    if (currentLocation > 1) {
        playPaperFlipSFX();
        switch(currentLocation) {
            case 2: 
                closeBook(true);
                paper1.classList.remove('flipped');
                paper1.style.zIndex = 3;
                break;
            case 3: 
                paper2.classList.remove('flipped');
                paper2.style.zIndex = 2;
                break;
            case 4:
                openBook();
                paper3.classList.remove('flipped');
                paper3.style.zIndex = 1;
                break;
            default:
                throw new Error ('unknown state');
        }
        currentLocation--;
    }
}