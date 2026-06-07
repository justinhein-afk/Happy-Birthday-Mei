// ─── FIREBASE CONFIG ──────────────────────────────────────────────────────────
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey:            "AIzaSyDz7HpGiDlJwi3EJ55NVF5npbN2GnR-TXE",
    authDomain:        "justin-chatbot-220505.firebaseapp.com",
    projectId:         "justin-chatbot-220505",
    storageBucket:     "justin-chatbot-220505.firebasestorage.app",
    messagingSenderId: "350198259820",
    appId:             "1:350198259820:web:6596474e8ff7d9124ef849",
    measurementId:     "G-FW0R3LYQ57"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// All messages live under this Firestore collection
const COLLECTION = "chat_messages";

// ─── DOM REFS ─────────────────────────────────────────────────────────────────
const chatBoxMain    = document.getElementById('chat-box-main');
const chatBoxHistory = document.getElementById('chat-box-history');
const userInput      = document.getElementById('user-input');
const sendBtn        = document.getElementById('send-btn');
const deleteBtn      = document.querySelector('.delete-button');
const hiddenHistory  = document.querySelector('.history-overlay');

// ─── STATE ────────────────────────────────────────────────────────────────────
// localStorage keeps the hidden flag alive across refreshes.
// Only Ctrl+Alt+R (full wipe) or sending a new message clears it.
let mainIsHidden = localStorage.getItem('main_chat_hidden') === 'true';

// ─── FIRESTORE HELPERS ────────────────────────────────────────────────────────

async function saveToFirestore(text, type, time, dateHeader) {
    try {
        await addDoc(collection(db, COLLECTION), {
            text,
            type,
            time,
            dateHeader: dateHeader || null,
            createdAt: serverTimestamp()   // used for ordering
        });
    } catch (err) {
        console.error("Failed to save message:", err);
    }
}

async function wipeFirestore() {
    try {
        const snapshot = await getDocs(collection(db, COLLECTION));
        const deletes  = snapshot.docs.map(d => deleteDoc(doc(db, COLLECTION, d.id)));
        await Promise.all(deletes);
    } catch (err) {
        console.error("Failed to wipe messages:", err);
    }
}

// ─── REAL-TIME LISTENER ───────────────────────────────────────────────────────
// onSnapshot fires immediately with existing data AND again whenever any device
// adds/removes a message — this is what gives you cross-device sync.

function startRealtimeSync() {
    const q = query(collection(db, COLLECTION), orderBy("createdAt", "asc"));

    onSnapshot(q, (snapshot) => {
        // Re-read from localStorage on every snapshot so refresh cannot bypass the flag
        mainIsHidden = localStorage.getItem('main_chat_hidden') === 'true';

        // Clear both containers and re-render fresh from Firestore
        chatBoxMain.innerHTML    = '';
        chatBoxHistory.innerHTML = '';

        snapshot.forEach(docSnap => {
            const msg = docSnap.data();
            renderToContainer(chatBoxHistory, msg.text, msg.type, msg.time, msg.dateHeader);
            if (!mainIsHidden) {
                renderToContainer(chatBoxMain, msg.text, msg.type, msg.time, msg.dateHeader);
            }
        });

        // Always show the greeting on top (never saved to Firestore)
        // It sits above the synced history visually but isn't stored
        prependGreeting();
    });
}

function prependGreeting() {
    const now     = dayjs();
    const timeStr = now.format('h:mm A');
    const greeting = document.createElement('div');
    greeting.className = 'message bot-msg greeting-msg';
    greeting.innerHTML = `
        <div class="text-content">Hello! I'm the Justin Chatbot. I'm here to help you with anything you need to know about Justin's. What can I help you find today?</div>
        <div style="font-size:10px;opacity:0.7;margin-top:4px;text-align:right;">${timeStr}</div>
    `;
    chatBoxMain.prepend(greeting);
}

// ─── MESSAGING & UI ───────────────────────────────────────────────────────────

function addMessage(text, type, shouldSave = true) {
    const now     = dayjs();
    const timeStr = now.format('h:mm A');
    const dateStr = now.format('dddd, MMMM D, YYYY');

    // Check last date divider in history box to decide if we need a new header
    const dividers  = chatBoxHistory.querySelectorAll('.date-divider');
    const lastText  = dividers.length > 0 ? dividers[dividers.length - 1].innerText : "";
    const dateHeader = lastText.trim() !== dateStr ? dateStr : null;

    // Render immediately to both UIs (optimistic update — feels instant)
    renderToContainer(chatBoxMain, text, type, timeStr, dateHeader);
    renderToContainer(chatBoxHistory, text, type, timeStr, dateHeader);

    if (shouldSave) {
        // Save to Firestore → onSnapshot on other devices will pick this up
        saveToFirestore(text, type, timeStr, dateHeader);
        // If user sends a new message, unhide the main view
        mainIsHidden = false;
        localStorage.removeItem('main_chat_hidden');
    }
}

function renderToContainer(container, text, type, time, dateHeader) {
    if (dateHeader && dateHeader.trim() !== "") {
        const divider       = document.createElement('div');
        divider.className   = 'date-divider';
        divider.innerText   = dateHeader;
        container.appendChild(divider);
    }

    const msgDiv       = document.createElement('div');
    msgDiv.className   = `message ${type}`;
    msgDiv.innerHTML   = `
        <div class="text-content">${text}</div>
        <div style="font-size:10px;opacity:0.7;margin-top:4px;text-align:right;">${time}</div>
    `;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

// ─── EVENTS ───────────────────────────────────────────────────────────────────

// Delete Button — hides main view permanently across refreshes.
// History overlay (Ctrl+M) still shows everything. Only Ctrl+Alt+R wipes Firestore.
deleteBtn.addEventListener('click', () => {
    mainIsHidden = true;
    localStorage.setItem('main_chat_hidden', 'true');
    chatBoxMain.innerHTML = '';
    prependGreeting(); // keep the greeting visible so the page isn't blank
});

// Ctrl + Alt + R — FULL wipe from Firestore (all devices lose history)
document.addEventListener('keydown', async (e) => {
    if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        mainIsHidden = false;
        localStorage.removeItem('main_chat_hidden');
        chatBoxMain.innerHTML    = '';
        chatBoxHistory.innerHTML = '';
        await wipeFirestore();  // deletes from cloud → onSnapshot clears other devices too
    }
});

// Send
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
    if (e.target === hiddenHistory) hiddenHistory.style.display = "none";
});

// ─── BOOT ─────────────────────────────────────────────────────────────────────
// Start listening to Firestore — this loads history AND keeps all devices in sync
startRealtimeSync();