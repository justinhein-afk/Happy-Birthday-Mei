const passwordInput = document.getElementById('password');
const buttons = document.querySelectorAll('.numbers');
const errorModal = document.getElementById('error-modal');
const modalOk = document.getElementById('modal-ok');
const correctPassword = "27012026";

buttons.forEach(button => {
    button.addEventListener('click', () => {
        const value = button.textContent;
        let deleteTimer;

        if (value === 'Delete') {
            button.onmousedown = () => { deleteTimer = setTimeout(() => passwordInput.value = "", 500); };
            button.onmouseup = () => clearTimeout(deleteTimer);
        }

        // Play button sound for every tap
        if (typeof playButtonSFX === "function") playButtonSFX();

        if (value === 'Enter') {
            if (passwordInput.value === correctPassword) {
                window.location.href = "../secret-page/secret-page.html";
            } else {
                if (typeof playErrorSFX === "function") playErrorSFX();
                errorModal.classList.add('active');
            }
        } else if (value === 'Delete') {
            passwordInput.value = passwordInput.value.slice(0, -1);
        } else if (!isNaN(value)) {
            if (passwordInput.value.length < 8) {
                passwordInput.value += value;
            }
        }
    });
});

modalOk.onclick = () => {
    if (typeof playButtonSFX === "function") playButtonSFX();
    errorModal.classList.remove('active');
    passwordInput.value = "";
};

window.closeSecret = function() {
    if (typeof playButtonSFX === "function") playButtonSFX();
    document.getElementById('secretOverlay').style.display = 'none';
    stopAllThemes();
    playInitialThemes();
};