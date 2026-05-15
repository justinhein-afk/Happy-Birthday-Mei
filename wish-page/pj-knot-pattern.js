let audioCtx = null;
let currentStep = 0;
const SECRET_PATTERN = [2, 3, 1, 1, 3, 2, 1, 3];
const NOTE_FREQS = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];

function initAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// The "Main Line" for sound generation
function playTone(freq, duration = 0.35, volume = 4, type = 'triangle') {
    initAudioContext();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.stop(now + duration);
}

// EXACT SOUNDS FROM PREVIOUS FILE
function playEnvelopeSFX() {
    playTone(880, 0.2, 1, 'sawthooth'); // High chirp
}

function playUnlockSFX() {
    // Arpeggio for success
    const now = Date.now();
    [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
        setTimeout(() => playTone(f, 0.5, 1.3), i * 200);
    });
}

function playErrorSFX() {
    playTone(120, 0.4, 2, 'sawtooth'); // Harsh buzz
}

function playButtonSFX() {
    playTone(880, 0.2, 1.3, 'triangle'); // Soft click for keypad
}

// KNOT LOGIC
document.querySelectorAll('.knot-container').forEach((knot, index) => {
    const tassel = knot.querySelector('.knot-tassel');
    const knotNumber = index + 1;

    tassel.addEventListener('click', (e) => {
        e.stopPropagation();

        if (knotNumber === SECRET_PATTERN[currentStep]) {
            playTone(NOTE_FREQS[currentStep], 0.5);
            currentStep++;

            if (currentStep === SECRET_PATTERN.length) {
                playUnlockSFX();
                document.getElementById('secretOverlay').style.display = 'flex';
                currentStep = 0;
                stopAllThemes();
                const secretTrack = document.getElementById('secretTheme');
                if (secretTrack) {
                    secretTrack.volume = 0.6;
                    secretTrack.play();
                }
            }
        } else {
            playErrorSFX();
            currentStep = 0;
        }
    });
});

// Shortcut to open secret content instantly
document.addEventListener('keydown', function (event) {
    // Check if the pressed key is F5
    if (event.key === 'F5') {
        // Prevent the default browser refresh behavior
        event.preventDefault();

        // Show the secret overlay
        const secretOverlay = document.getElementById('secretOverlay');
        if (secretOverlay) {
            secretOverlay.style.display = 'flex';
            stopAllThemes();
            const secretTrack = document.getElementById('secretTheme');
            if (secretTrack) {
                secretTrack.volume = 0.6;
                secretTrack.play();
            }
            // Optional: Play the unlock sound for feedback
            if (typeof playUnlockSFX === "function") {
                playUnlockSFX();
            }
        }
    }
});



