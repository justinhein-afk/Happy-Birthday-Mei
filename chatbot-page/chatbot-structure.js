// justin-chatbot.js
// Justin's Ultimate Chatbot
// Powered by fuzzy string similarity from SuperSimpleDev's Chatbot library.

// ─── 1. SECRET VAULT ──────────────────────────────────────────────────────────
const secrets = {
    goat: `Congratualtion!! Now, you've found 2 letters I was hiding in the box, don't you? Well, this is the final letter for the girl I was in LOVE in my whole University Life. Thanks for making me feel that teenage LOVE again. It was also a wonderful experience being with my dream girl for 2 months period (not 34 days lol). It was worth a try than being regret for not trying, wasn't it? And now, I left no regrets. I've found myself and I wish you too have found yourself again. We were meant for each other but we couldn't... Maybe in another life? I have something to say for the last time... I LOVE YOU.`
};

// ─── 2. JUSTIN'S RESPONSE RULES ───────────────────────────────────────────────
// Each key is the phrase the fuzzy matcher will compare against.
// Values can be a plain string or a function that returns a string.
const justinResponses = {
    // Greetings and Basics

    "hi hello are you": "Hello! I am Justin Chatbot. How are you doing?",

    "good i am fine nice great": "Great!! What can I help you?",

    "is your name who are": "I am Justin Chatbot, your friendly assistant to guide you about Justin's!",

    "who created you who made": "I was created by successful tech CEO, Justin Hein!",

    "how are you is it going sup": "I'm doing great, thank you! How can I help you today?",

    "help can you do task capabilities": "I can chat with you, answer basic questions about Justin's, and reveal some hidden secrets!",

    "is who justin": "Justin is a successful tech CEO and the creator of this chatbot!",

    "who is mei" :"She is someone I am currently talking to. Am I right? ",

    "ai artificial intelligence": "I'm not AI, I'm just a chatbot built by tech CEO, Justin Hein!",

    // Dates and Games

    "what is the time what is the date what day is it": function () {
        return `The current date and time is: ${new Date().toLocaleString()}.`;
    },

    "flip a coin": function () {
        return Math.random() < 0.5 ? "Sure! You got heads 🪙" : "Sure! You got tails 🪙";
    },

    "roll a dice": function () {
        return `Sure! You got ${Math.floor(Math.random() * 6) + 1} 🎲`;
    },

    // Justin's Personal Information

    "type you he like love": "Justin's type of woman is someone who is sweet, caring and loving. If you are asking about physical appearance he has the same taste as Todo.",

    "do you love me like me": "Of course. Justin loves you. He loves you so much that he created this website just for you.",

    "should i ask": "You can ask me anything you want to know about Justin's!",

    "exact location where are you": "Why do you want to know that? Are you a stalker?",

    "is he doing right now": "I don't know. I'm just a chatbot. But if you want to know, just ask go ask him.",

    "is his future girlfriend": "Why do you want to know that? you are suspicious. But all the information I know about him is that he is currently building for his future so I guess he doesn't have time for a girlfriend. If he has one, she might be qulified to be his future wife.",

    "rude": "I'm sorry if I came across that way. I'm just a chatbot trying to help you. How can I assist you better?",

    // Common Phrases

    "yes yep yeah": "tf you meant YES?? I'm not AI and I don't know our previous conversation. Sorry!! What can I help you?",

    "no nope": "tf you meant NO?? I'm not AI and I don't know our previous conversation. Sorry!! What can I help you?",

    "')": "You still doing that emoji? It's been a while since I've only used it with you '). Nevermind, how can I help you?",

    "ok okay kk": "Ok...",

    "thz thx thank you thanks": "You're very welcome! Let me know if you need anything else.",

    "i miss you him": "If you are genuine about that, go talk to him. If you don't even know what you want, you should just keep it yourself.",

    "i love you him too": "I LOVE YOU three my Darling <3",

    "tata bye goodbye see you တာ့တာ": "တာ့တာ<3",

    // Secrets and Easter Eggs

    "secret hiding help me with": "Justin's secret is that he was the bat man all along. If you want to really know, just ask me to guide you.",

    "guide tutorial": `Here is a list of what I can do for you.<br>
    <ul>
      <li> Exact location of Justin's. </li>
      <li> What is he doing right now. </li>
      <li> Who is his future girlfriend. </li>
      <li> flip a coin or roll a dice. </li>
      <li> What is one word to describe you. </li>
      <li> What is code 1235. </li>
    </ul>`,

    "1 one word describe define": `If I have to describe you with one word, I would define "Exception". Because out of all the red flags you are, I still keep falling for you. Foolish me.`,

    "code 1235": "Code 1235 basically means nothing. I made that up to let you know what I was hiding in the gift box. There is 1 flower (also one letter but that didn't count), 3 prints and 5 chocolates but what is 2?? Go find it before it was too late!!",

    "goat": `A goat is either a horned, cud-chewing farm animal or a popular acronym used in sports and pop culture to mean the "Greatest Of All Time". But it you want to know about what I meant, just send me "goat"`,

    "truth": "The harsh truth is that, I have built this project to win you back but I have no strength to stay with you, I'm sorry! I realized about LOVE is that it doesn't matter how we feel and it only matters by the actions or how they act during relationship. No matter how attractive a baddie is, at the end of day it was just better to be with a goodie. I believe you will also be a Goodie with someone else so... တာ့တာ<3",
};

// ─── 3. FUZZY MATCHING ENGINE (from SuperSimpleDev library) ───────────────────
function compareTwoStrings(first, second) {
    first = first.replace(/\s+/g, "");
    second = second.replace(/\s+/g, "");
    if (first === second) return 1;
    if (first.length < 2 || second.length < 2) return 0;

    const firstBigrams = new Map();
    for (let i = 0; i < first.length - 1; i++) {
        const bigram = first.substring(i, i + 2);
        firstBigrams.set(bigram, (firstBigrams.get(bigram) || 0) + 1);
    }

    let intersectionSize = 0;
    for (let i = 0; i < second.length - 1; i++) {
        const bigram = second.substring(i, i + 2);
        const count = firstBigrams.get(bigram) || 0;
        if (count > 0) {
            firstBigrams.set(bigram, count - 1);
            intersectionSize++;
        }
    }

    return (2.0 * intersectionSize) / (first.length + second.length - 2);
}

function findBestMatch(query, candidates) {
    let bestRating = -1;
    let bestKey = null;

    for (const candidate of candidates) {
        const rating = compareTwoStrings(query, candidate);
        if (rating > bestRating) {
            bestRating = rating;
            bestKey = candidate;
        }
    }

    return { bestKey, bestRating };
}

// ─── 4. MAIN RESPONSE FUNCTION ────────────────────────────────────────────────
const SIMILARITY_THRESHOLD = 0.25; // tune 0.0–1.0 (lower = more lenient)

function getBotResponse(input) {
    if (!input || !input.trim()) {
        return "I didn't hear anything. How can I help you?";
    }

    const query = input.toLowerCase().trim();

    // 1. Check secrets first (exact match)
    if (secrets[query]) {
        document.getElementById('secretTheme').play();
        document.getElementById('secretTheme').volume = 0.3;
        return secrets[query];
    }
    // 2. Fuzzy match against Justin's response keys
    const { bestKey, bestRating } = findBestMatch(query, Object.keys(justinResponses));

    if (bestRating >= SIMILARITY_THRESHOLD) {
        const response = justinResponses[bestKey];
        return typeof response === "function" ? response() : response;
    }

    // 3. Fallback
    return "I don't have any information about this. Sorry!";
}

// ─── 5. ASYNC WRAPPER (optional — mirrors library's getResponseAsync) ─────────
function getBotResponseAsync(input) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(getBotResponse(input)), 800);
    });
}

// ─── 6. EXPORTS (works in browser AND Node.js) ────────────────────────────────
(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.JustinChatbot = factory();
    }
})(typeof self !== "undefined" ? self : this, function () {
    return { getBotResponse, getBotResponseAsync, justinResponses, secrets };
});
