const chatbotIcon = document.querySelector('.Chatbot-icon');
const chatbotOverlay = document.querySelector('.chatbot-overlay');
const chatbotCloseBtn = document.querySelector('.close-chatbot-btn');

if (chatbotIcon) {
    chatbotIcon.addEventListener('click', () => {
        chatbotOverlay.style.display = 'flex';
        playRobotSFX()
    });
}

if (chatbotCloseBtn) {
    chatbotCloseBtn.addEventListener('click', () => {
        chatbotOverlay.style.display = 'none';
        playRobotSFX();
    })
}

const passwordInput = document.getElementById('password');
const buttons = document.querySelectorAll('.numbers');
const errorModal = document.getElementById('error-modal');
const modalOk = document.getElementById('modal-ok');
const correctPassword = "29012026";

buttons.forEach(button => {
    button.addEventListener('click', () => {
        const value = button.textContent;
        let deleteTimer;

        if (value === 'Delete') {
            button.onmousedown = () => { deleteTimer = setTimeout(() => passwordInput.value = "", 500); };
            button.onmouseup = () => clearTimeout(deleteTimer);
        }

        // Play button sound for every tap
        if (typeof playRobotButtonsSFX === "function") playRobotButtonsSFX();

        if (value === 'Enter') {
            if (passwordInput.value === correctPassword) {
                window.location.href = "../chatbot-page/chatbot-page.html";
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
    if (typeof playRobotButtonsSFX === "function") playRobotButtonsSFX();
    errorModal.classList.remove('active');
    passwordInput.value = "";
};