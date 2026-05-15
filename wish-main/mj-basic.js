const passwordInput = document.getElementById('birthday');
const buttons = document.querySelectorAll('.numbers');
const errorModal = document.getElementById('error-modal');
const modalOk = document.getElementById('modal-ok');
const modalNo = document.getElementById('modal-no');

const correctPassword = "22052005";
let deleteTimer;

// --- KEYBOARD BLOCK ---
passwordInput.addEventListener('keydown', (e) => {
    e.preventDefault();
});

passwordInput.addEventListener('click', () => {
    passwordInput.focus();
});

// --- MODAL LOGIC ---
modalOk.onclick = () => {
    errorModal.classList.remove('active');
    passwordInput.value = "";
};

modalNo.onclick = () => {
    window.location.href = "../document-page/document-page.html"; 
};

// --- BUTTON INTERACTIONS ---
buttons.forEach(button => {
    const value = button.textContent;

    if (value === 'Delete') {
        button.onmousedown = () => { deleteTimer = setTimeout(() => passwordInput.value = "", 500); };
        button.onmouseup = () => clearTimeout(deleteTimer);
    }
    
    button.addEventListener('click', () => {

        playButtonSFX();

        if (value === 'Enter') {
            if (passwordInput.value === correctPassword) {
                window.location.href = "../wish-page/wish-page.html";
            } else {
                errorModal.classList.add('active'); // Show "Try Again" blur box
            }
        } else if (value === 'Delete') {
            passwordInput.value = passwordInput.value.slice(0, -1);
        } else if (!isNaN(value)) { // If it's a number
            if (passwordInput.value.length < 8) passwordInput.value += value;
        }
        buttonSfx.currentTime = 0;
        buttonSfx.play();
    });
});

function playInitialThemes() {
    const bg = document.getElementById('bgTheme');
    const firstInterface = document.querySelector('.first-interface');
    
    if (firstInterface) {
        firstInterface.style.display = 'none';
    }
    
    if (bg) {
        bg.volume =1; 
        bg.play();
    }
}

// Listen for first interaction to start BGM
document.body.addEventListener('click', playInitialThemes, { once: true });

// --- AUDIO SYSTEM ---

let audioCtx;

function initAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playTone(freq, duration = 0.35, volume = 0.5, type = 'triangle') {
    initAudioContext(); // Ensure context is active
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

function playButtonSFX() {
    // 880Hz is an A5 note - crisp and clear for buttons
    playTone(880, 0.15, 2, 'triangle'); 
}


