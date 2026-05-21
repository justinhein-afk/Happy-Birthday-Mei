let audioCtx;

// Initialize or resume the Audio Context
function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}

/**
 * The Master Helper: easy to edit everything in one place
 * @param {number} freq - Starting frequency (Hz)
 * @param {number} duration - Length of sound (seconds)
 * @param {string} type - 'sine', 'square', 'sawtooth', 'triangle'
 * @param {number} endFreq - Ending frequency (optional, for slides/whooshes)
 * @param {number} volume - Volume (0 to 1)
 */
function playTone(freq, duration = 0.2, type = 'sine', endFreq = null, volume = 0.5) {
    const ctx = initAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // If an endFreq is provided, slide the pitch (creates Whooshes/Pops)
    if (endFreq) {
        osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);
    }

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
}

// --- SHORT & EASY TO EDIT FUNCTIONS ---

// 1. Clean "Pop" for Button Taps
function playButtonSFX() {
    playTone(600, 0.1, 'sine', 300, 0.8);
}

// 2. Low "Buzz" for Errors
function playErrorSFX() {
    playTone(150, 0.3, 'sawtooth', 50, 0.5);
}

// 3. "tuu.." for robotic SFX
function playRobotSFX() {
    playTone(100, 0.3, 'sine', 1200, 1);
}

function playRobotButtonsSFX() {
    playTone(1200, 0.15, 'triangle', 400, 0.8);
}

// 4. Quick "Snap/Whoosh" for flipping book pages
function playPaperFlipSFX() {
    const paperFlip = document.getElementById('paper-flip');
    paperFlip.volume = 1;
    paperFlip.play();
}

function playCheeringSFX() {
    const cheeringSound = document.getElementById('CheeringSound');
    cheeringSound.play();
    cheeringSound.volume = 0.6;
}

function playPageTheme() {
    const pageTheme = document.getElementById('page-theme');
    pageTheme.play();
    pageTheme.volume = 0.2;
    pageTheme.currentTime = 8;
}