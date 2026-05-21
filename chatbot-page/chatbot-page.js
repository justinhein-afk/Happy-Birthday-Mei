const chatBoxMain = document.getElementById('chat-box-main');
const chatBoxHistory = document.getElementById('chat-box-history');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const deleteBtn = document.querySelector('.delete-button');
const hiddenHistory = document.querySelector('.history-overlay');

// --- Persistence Logic ---

window.onload = () => {
    const history = JSON.parse(localStorage.getItem('chat_history')) || [];
    const isDeleted = localStorage.getItem('main_chat_hidden') === 'true';

    // 1. Reconstruct the history in both containers
    history.forEach(msg => {
        // Always render to history overlay
        renderToContainer(chatBoxHistory, msg.text, msg.type, msg.time, msg.dateHeader);
        
        // Only render to main if the user hasn't clicked "delete"
        if (!isDeleted) {
            renderToContainer(chatBoxMain, msg.text, msg.type, msg.time, msg.dateHeader);
        }
    });

    // 2. Always show the greeting on refresh
    // We set shouldSave to false so the greeting doesn't duplicate in the history logs
    addMessage("Hello! I'm the Justin Chatbot. I'm here to help you with anything you need to know about Justin's. What can I help you find today?", "bot-msg", false);
};

function saveToStorage(text, type, time, dateHeader) {
    const history = JSON.parse(localStorage.getItem('chat_history')) || [];
    history.push({ text, type, time, dateHeader });
    localStorage.setItem('chat_history', JSON.stringify(history));
    // When a new message is sent, ensure the main chat is "visible" again
    localStorage.setItem('main_chat_hidden', 'false');
}

// --- Messaging & UI Logic ---

function addMessage(text, type, shouldSave = true) {
    const now = dayjs();
    const timeStr = now.format('h:mm A');
    const dateStr = now.format('dddd, MMMM D, YYYY');
    
    let dateHeader = null;
    const lastDivider = chatBoxHistory.querySelectorAll('.date-divider');
    const lastDivText = lastDivider.length > 0 ? lastDivider[lastDivider.length - 1].innerText : "";

    if (lastDivText.trim() !== dateStr) {
        dateHeader = dateStr;
    }

    // Render to both
    renderToContainer(chatBoxMain, text, type, timeStr, dateHeader);
    renderToContainer(chatBoxHistory, text, type, timeStr, dateHeader);
    
    if (shouldSave) {
        saveToStorage(text, type, timeStr, dateHeader);
    }
}

function renderToContainer(container, text, type, time, dateHeader) {
    if (dateHeader && dateHeader.trim() !== "") {
        const divider = document.createElement('div');
        divider.className = 'date-divider';
        divider.innerText = dateHeader;
        container.appendChild(divider);
    }

    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;
    msgDiv.innerHTML = `
        <div class="text-content">${text}</div>
        <div style="font-size: 10px; opacity: 0.7; margin-top: 4px; text-align: right;">${time}</div>
    `;
    
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

// --- Events ---

// Delete Button: Hide from Main, Keep in History
deleteBtn.addEventListener('click', () => {
    // 1. Clear the main UI
    chatBoxMain.innerHTML = ''; 
    
    // 2. Set the persistence flag
    localStorage.setItem('main_chat_hidden', 'true');
    
    // 3. Add the confirmation message
    // Note: We set shouldSave to false so this specific notification 
    // doesn't clutter your actual saved history in the overlay.
    addMessage("Chat history deleted. Ready for your next question!", "bot-msg", false);
});

// Ctrl + Alt + R: Total Wipe
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        localStorage.removeItem('chat_history');
        localStorage.removeItem('main_chat_hidden');
        chatBoxMain.innerHTML = '';
        chatBoxHistory.innerHTML = '';
    }
});

// Send Logic
sendBtn.addEventListener('click', () => {
    const text = userInput.value.trim();
    if (text) {
        addMessage(text, 'user-msg');
        userInput.value = '';
        setTimeout(() => {
            const response = getBotResponse(text);
            addMessage(response, 'bot-msg');
        }, 600);
    }
});

userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendBtn.click(); });

// Overlay Controls
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'm') {
        hiddenHistory.style.display = "flex";
    }
});

hiddenHistory.addEventListener('click', (e) => {
    // Only close if clicking the background overlay, not the chat inside it
    if (e.target === hiddenHistory) {
        hiddenHistory.style.display = "none";
    }
});