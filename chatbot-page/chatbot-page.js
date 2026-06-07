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

const COLLECTION = "chat_messages";

// ─── DOM REFS ─────────────────────────────────────────────────────────────────
const chatBoxMain    = document.getElementById('chat-box-main');
const chatBoxHistory = document.getElementById('chat-box-history');
const userInput      = document.getElementById('user-input');
const sendBtn        = document.getElementById('send-btn');
const deleteBtn      = document.querySelector('.delete-button');
const hiddenHistory  = document.querySelector('.history-overlay');

// ─── STATE ────────────────────────────────────────────────────────────────────
// When the user clicks Delete, we stamp the current time into localStorage.
// Any message created BEFORE that timestamp is permanently hidden from the main
// view — even after refresh, even after more chatting.
// The history overlay (Ctrl+M) always shows everything regardless of the cutoff.
// Only Ctrl+Alt+R wipes Firestore and resets the cutoff.

function getDeleteCutoff() {
    const v = localStorage.getItem('main_delete_cutoff');
    return v ? Number(v) : 0;
}

function setDeleteCutoff(ts) {
    localStorage.setItem('main_delete_cutoff', String(ts));
}

function clearDeleteCutoff() {
    localStorage.removeItem('main_delete_cutoff');
}

// ─── FIRESTORE HELPERS ────────────────────────────────────────────────────────

async function saveToFirestore(text, type, time, dateHeader) {
    try {
        await addDoc(collection(db, COLLECTION), {
            text,
            type,
            time,
            dateHeader: dateHeader || null,
            createdAt: serverTimestamp()
        });
    } catch (err) {
        console.error("Failed to save message:", err);
    }
}

// saveWithClientTimestamp: saves the message and also stores the client-side ms
// timestamp as a separate field so we can compare against the delete cutoff.
async function saveWithClientTimestamp(text, type, time, dateHeader) {
    try {
        await addDoc(collection(db, COLLECTION), {
            text,
            type,
            time,
            dateHeader: dateHeader || null,
            createdAt:  serverTimestamp(),
            clientMs:   Date.now()        // ← used for cutoff comparison
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

function startRealtimeSync() {
    const q = query(collection(db, COLLECTION), orderBy("createdAt", "asc"));

    onSnapshot(q, (snapshot) => {
        const cutoff = getDeleteCutoff(); // read fresh every time

        chatBoxMain.innerHTML    = '';
        chatBoxHistory.innerHTML = '';

        snapshot.forEach(docSnap => {
            const msg = docSnap.data();

            // History overlay always gets every message
            renderToContainer(chatBoxHistory, msg.text, msg.type, msg.time, msg.dateHeader);

            // Main view skips anything older than the delete cutoff
            const msgTime = msg.clientMs || 0;
            if (msgTime > cutoff) {
                renderToContainer(chatBoxMain, msg.text, msg.type, msg.time, msg.dateHeader);
            }
        });

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

    const dividers  = chatBoxHistory.querySelectorAll('.date-divider');
    const lastText  = dividers.length > 0 ? dividers[dividers.length - 1].innerText : "";
    const dateHeader = lastText.trim() !== dateStr ? dateStr : null;

    renderToContainer(chatBoxMain, text, type, timeStr, dateHeader);
    renderToContainer(chatBoxHistory, text, type, timeStr, dateHeader);

    if (shouldSave) {
        saveWithClientTimestamp(text, type, timeStr, dateHeader);
    }
}

function renderToContainer(container, text, type, time, dateHeader) {
    if (dateHeader && dateHeader.trim() !== "") {
        const divider     = document.createElement('div');
        divider.className = 'date-divider';
        divider.innerText = dateHeader;
        container.appendChild(divider);
    }

    const msgDiv     = document.createElement('div');
    msgDiv.className = `message ${type}`;
    msgDiv.innerHTML = `
        <div class="text-content">${text}</div>
        <div style="font-size:10px;opacity:0.7;margin-top:4px;text-align:right;">${time}</div>
    `;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

// ─── EVENTS ───────────────────────────────────────────────────────────────────

// Delete Button — stamps the current time as the cutoff.
// All messages before this moment are hidden from main view permanently.
// New messages sent after this point will appear normally.
// Ctrl+M history overlay is unaffected — it always shows everything.
deleteBtn.addEventListener('click', () => {
    setDeleteCutoff(Date.now());
    chatBoxMain.innerHTML = '';
    prependGreeting();
});

// Ctrl + Alt + R — full wipe of Firestore AND the delete cutoff
document.addEventListener('keydown', async (e) => {
    if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        clearDeleteCutoff();
        chatBoxMain.innerHTML    = '';
        chatBoxHistory.innerHTML = '';
        await wipeFirestore();
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
startRealtimeSync();