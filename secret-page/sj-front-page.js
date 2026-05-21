function startCelebration() {
    if (window.innerWidth <= 900) {
        // Stop the function immediately so nothing opens or plays
        return; 
    }
    const firstInterface = document.querySelector('.first-interface');
    const congratsMsg = document.getElementById('congrats-msg');
    const frontPage = document.querySelector('.front-page')
    const innerContainer = document.querySelector('.inner-container');

    // 1. Hide the "Guess what" screen
    if (firstInterface) {
        firstInterface.style.display = 'none';
    }
    // Inside startCelebration function
    if (frontPage) {
        frontPage.style.display = "flex"; 
    }
    
    playCheeringSFX();

    // 2. Show the Congratulations message
    if (congratsMsg) {
        congratsMsg.style.display = 'flex';

        // 3. Wait 2 seconds, then fade out and remove
        setTimeout(() => {
            congratsMsg.classList.add('fade-out');

            if (frontPage) {
                frontPage.classList.add('final-bg');
            }

            // Clean up the display after fade transition finishes
            setTimeout(() => {
                congratsMsg.style.display = 'none';
                playPageTheme();
            }, 500);
        }, 3000);
    }

    if (innerContainer) {
        setTimeout(() => {
            innerContainer.style.display = "block"; // Or "flex" depending on your layout
            innerContainer.classList.add('fade-in'); // Recommended: add a fade-in class
        }, 5000); // 3s initial wait + 3s BG transition + 0.5s buffer
    }

    // --- Your existing confetti logic below ---
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;

    const defaults = {
        startVelocity: 60,
        spread: 70,
        ticks: 200,
        zIndex: 2000
    };

    const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        const particleCount = 50 * (timeLeft / duration);

        confetti({
            ...defaults,
            particleCount,
            origin: { x: 0, y: 0 },
            angle: 315
        });

        confetti({
            ...defaults,
            particleCount,
            origin: { x: 1, y: 0 },
            angle: 225
        });
    }, 250);

    document.removeEventListener('click', startCelebration);
}

document.addEventListener('click', startCelebration);

// info-icon interation
document.querySelector('.info').addEventListener('click', () => {
    // Redirect to the document page with a hash to trigger scrolling
    window.location.href = '../document-page/document-page.html#scroll-target';
});