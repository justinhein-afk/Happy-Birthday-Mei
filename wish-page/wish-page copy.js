// --- AUDIO DATA ---
const BGM_START_BASE64   = "data:audio/mp3;base64,PASTE_START_THEME_HERE"; 
const GLITTER_SFX_BASE64 = "data:audio/mp3;base64,PASTE_GLITTER_SOUND_HERE"; 
const BGM_LETTER_BASE64  = "data:audio/mp3;base64,PASTE_LETTER_OPEN_THEME_HERE"; 
const SFX_CLICK_BASE64   = "data:audio/mp3;base64,PASTE_ENVELOPE_CLICK_SFX_HERE"; 

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let bufferStart, bufferGlitter, bufferLetter, sfxBuffer;
let bgmSource = null;
let glitterSource = null;

async function initAudio() {
    bufferStart = await decodeBase64(BGM_START_BASE64);
    bufferGlitter = await decodeBase64(GLITTER_SFX_BASE64);
    bufferLetter = await decodeBase64(BGM_LETTER_BASE64);
    sfxBuffer = await decodeBase64(SFX_CLICK_BASE64);
}

async function decodeBase64(base64) {
    const binary = window.atob(base64.split(',')[1]);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return await audioCtx.decodeAudioData(bytes.buffer);
}

initAudio();

// Function to play the two starting themes together
function playStartThemes() {
    stopAllBGM(); // Ensure nothing else is playing

    bgmSource = audioCtx.createBufferSource();
    bgmSource.buffer = bufferStart;
    bgmSource.loop = true;
    bgmSource.connect(audioCtx.destination);
    bgmSource.start(0);

    glitterSource = audioCtx.createBufferSource();
    glitterSource.buffer = bufferGlitter;
    glitterSource.loop = true;
    glitterSource.connect(audioCtx.destination);
    glitterSource.start(0);
}

function stopAllBGM() {
    if (bgmSource) {
        bgmSource.stop();
        bgmSource = null;
    }
    if (glitterSource) {
        glitterSource.stop();
        glitterSource = null;
    }
}

function playSFX() {
    if (!sfxBuffer) return;
    const source = audioCtx.createBufferSource();
    source.buffer = sfxBuffer;
    source.connect(audioCtx.destination);
    source.start(0);
}

// --- VISUALS: GLITTERS ---
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

// --- INTERACTIONS ---
const envelope = document.querySelector('.envelope');
const overlay = document.getElementById('letterOverlay');
let hasStarted = false;

// Initial Start
document.addEventListener('click', () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    if (!hasStarted) {
        playStartThemes();
        hasStarted = true;
    }
}, { once: false });

// Open Envelope
if (envelope) {
    envelope.addEventListener('click', (e) => {
        e.stopPropagation();
        playSFX(); 
        
        // Stop the two starting themes and play the letter theme
        stopAllBGM();
        bgmSource = audioCtx.createBufferSource();
        bgmSource.buffer = bufferLetter;
        bgmSource.loop = true;
        bgmSource.connect(audioCtx.destination);
        bgmSource.start(0);

        overlay.style.display = 'flex';
        const noti = envelope.querySelector('.noti');
        if (noti) noti.style.display = "none";
        envelope.style.animation = "none";
    });
}

// Close Letter
window.closeLetter = function() {
    playSFX(); 
    // Go back to the two original themes playing together from the start
    playStartThemes();
    overlay.style.display = 'none';
};

window.onclick = function(event) {
    if (event.target == overlay) {
        closeLetter();
    }
};


// --- ADDITIONAL AUDIO DATA ---
const NOTE_BASE64 = [
    "data:audio/mp3;base64,DO_BASE64...", 
    "data:audio/mp3;base64,RE_BASE64...", 
    "data:audio/mp3;base64,MI_BASE64...", 
    "data:audio/mp3;base64,FA_BASE64...", 
    "data:audio/mp3;base64,SO_BASE64...", 
    "data:audio/mp3;base64,LA_BASE64...", 
    "data:audio/mp3;base64,TI_BASE64...", 
    "data:audio/mp3;base64,HIGH_DO_BASE64..."
];
const ERROR_SFX_BASE64 = "data:audio/mp3;base64,ERROR_BASE64...";

// Configuration
const SECRET_PATTERN = [2, 3, 1, 1, 3, 2, 1, 3];
let currentStep = 0;
let noteBuffers = [];
let errorBuffer;

// Initialize the 8 notes and the error sound
async function initMusicalPassword() {
    for (let base64 of NOTE_BASE64) {
        noteBuffers.push(await decodeBase64(base64));
    }
    errorBuffer = await decodeBase64(ERROR_SFX_BASE64);
    setupKnotListeners();
}

function setupKnotListeners() {
    // Select all tassels inside your knot containers
    const knots = [
        document.querySelector('.knot1 .knot-tassel'),
        document.querySelector('.knot2 .knot-tassel'),
        document.querySelector('.knot3 .knot-tassel')
    ];

    knots.forEach((tassel, index) => {
        if (tassel) {
            const knotId = index + 1; // knot1 is 1, knot2 is 2, knot3 is 3
            tassel.addEventListener('click', (e) => {
                e.stopPropagation();
                handlePatternClick(knotId);
            });
        }
    });
}

function handlePatternClick(id) {
    if (audioCtx.state === 'suspended') audioCtx.resume();

    if (id === SECRET_PATTERN[currentStep]) {
        // Correct step: Play the next note in the "Do Re Mi" sequence
        playBuffer(noteBuffers[currentStep]);
        currentStep++;

        if (currentStep === SECRET_PATTERN.length) {
            unlockSecret();
            currentStep = 0; // Reset after success
        }
    } else {
        // Wrong step: Play error and restart sequence
        playBuffer(errorBuffer);
        currentStep = 0;
    }
}

function playBuffer(buffer) {
    if (!buffer) return;
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start(0);
}

function unlockSecret() {
    // Reusing your existing letter overlay logic or targeting a second one
    const secretOverlay = document.getElementById('letterOverlay');
    if (secretOverlay) secretOverlay.style.display = 'flex';
}

initMusicalPassword();