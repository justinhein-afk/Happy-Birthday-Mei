const marqueeIcon = document.querySelector('.Marquee-icon');
const marqueeOverlay = document.querySelector('.marquee-overlay');
const marqueeCloseBtn = document.querySelector('.close-marquee-btn')

if (marqueeIcon) { 
    marqueeIcon.addEventListener('click', () => {
        marqueeOverlay.classList.add('active');
        playButtonSFX();
    });
}

if (marqueeCloseBtn) {
    marqueeCloseBtn.addEventListener('click', () => {
        marqueeOverlay.classList.remove('active');
        playButtonSFX();
    })
}
