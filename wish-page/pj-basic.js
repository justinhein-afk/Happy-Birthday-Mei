// Glitter Generation
const glitterContainer = document.querySelector('.glitters');
for (let i = 0; i < 60; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 18 + 5 + 'px';
    star.style.width = size;
    star.style.height = size;
    star.style.left = Math.random() * 100 + 'vw';
    star.style.animationDuration = Math.random() * 3 + 2 + 's';
    star.style.animationDelay = Math.random() * 5 + 's';
    glitterContainer.appendChild(star);
}

// Envelope Logic
const envelope = document.querySelector('.envelope');
const overlay = document.getElementById('letterOverlay');

if (envelope) {
    envelope.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof playEnvelopeSFX === "function") playEnvelopeSFX();
        overlay.style.display = 'flex';

        stopAllThemes();
        document.getElementById('letterTheme').play();
        document.getElementById('letterTheme').volume = 0.5;
        
        const noti = envelope.querySelector('.noti');
        if (noti) noti.style.display = "none";
        envelope.style.animation = "none";
    });
}

window.closeLetter = function() {
    if (typeof playButtonSFX === "function") playButtonSFX();
    overlay.style.display = 'none';
    stopAllThemes();
    playInitialThemes();
};

// Function to stop all background music tracks
function stopAllThemes() {
    const themes = ['bgTheme','glitterSfx', 'letterTheme', 'secretTheme'];
    themes.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.pause();
            el.currentTime = 0; // Reset to start
        }
    });
}

// Global start (triggered on first click)
function playInitialThemes() {
    const bg = document.getElementById('bgTheme');
    const glitter = document.getElementById('glitterSfx');
    const firstInterface = document.querySelector('.first-interface');
    
    if (firstInterface) {
        firstInterface.style.display = 'none';
    }
    
    if (bg) {
        bg.volume = 0.7; 
        bg.play();
    }
    if (glitter) {
        glitter.volume = 0.5; 
        glitter.play();
    }
}

// Listen for first interaction to start BGM
document.body.addEventListener('click', playInitialThemes, { once: true });