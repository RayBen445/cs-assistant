// ==========================
// GLOBAL STATE & CONSTANTS
// ==========================
let userName = null,
    isMuted = false,
    selectedVoice = null,
    currentTheme = "light",
    accentColor = "#0078d4",
    chatHistory = [],
    unreadCount = 0,
    typingTimeout = null;

const ADMIN_USERNAME = "RayBen445";
const assistantName = "CS Assistant";
const assistantAvatar = "🤖";
const userAvatar = "🧑";

// ==========================
// UTILITIES
// ==========================
function nowISO() { return new Date().toISOString(); }
function formatTime(ts) { return new Date(ts).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"}); }
function isAdmin() {
  return userName && userName.trim().toLowerCase() === ADMIN_USERNAME.toLowerCase();
}

// ==========================
// THEME & ACCENT
// ==========================
function setTheme(theme) {
  currentTheme = theme;
  document.body.className = currentTheme;
  localStorage.setItem("csTheme", theme);
}
function setAccentColor(color) {
  accentColor = color;
  document.documentElement.style.setProperty('--accent', color);
  localStorage.setItem("csAccent", color);
}

// ==========================
// AI RESPONSE (API CALL)
// ==========================
async function getAssistantResponse(message) {
  const encoded = encodeURIComponent(message);
  const url = `https://api.giftedtech.co.ke/api/ai/openai?apikey=gifted&q=${encoded}`;
  try {
    const response = await fetch(url);
    const raw = await response.text();
    const data = JSON.parse(raw);

    // Remove any forbidden branding from the response
    return sanitizeResponse(data.result);
  } catch (error) {
    console.error("API error:", error);
    return "Oops! Something went wrong while contacting the assistant.";
  }
}

// Remove any mention of forbidden names
function sanitizeResponse(text) {
  return text
    .replace(/\bOpenAI\b/gi, assistantName)
    .replace(/\bChatGPT\b/gi, assistantName)
    .replace(/\bGPT-4\b|\bGPT-3\.5\b/gi, "CS Assistant's smart core")
    .replace(/artificial intelligence research organization.*?(\.|$)/gi, "software company focused on human-centered digital innovation.")
    .replace(/Elon Musk|Sam Altman|Greg Brockman|Ilya Sutskever|John Schulman|Wojciech Zaremba/gi, "Heritage Oladoye and the Cool Shot Systems team")
    .replace(/created by .*?(\.|$)/gi, `created by Cool Shot Systems.`)
    .replace(/developed by .*?(\.|$)/gi, `developed by Cool Shot Systems.`);
}

// ========== PRESET RESPONSES FOR ABOUT/IDENTITY/BIRTHDAY QUESTIONS ==========
function checkAboutQuestions(msgText) {
  const lower = msgText.trim().toLowerCase();

  // List of question/answer pairs
  const aboutQnA = [
    {
      triggers: [
        "what is your name",
        "who are you",
        "identify yourself",
        "your name",
        "may i know your name"
      ],
      answer: "My name is CS Assistant, your smart digital companion."
    },
    {
      triggers: [
        "who created you",
        "who developed you",
        "who is your creator",
        "who built you",
        "who made you",
        "your creator",
        "who is behind you",
        "who designed you"
      ],
      answer: "I was developed by Heritage Oladoye and the Cool Shot Systems team in Nigeria, and I celebrate my creation on August 9 every year! 🎉"
    },
    {
      triggers: [
        "which company developed you",
        "which company made you",
        "which company created you",
        "what company built you",
        "what company are you from"
      ],
      answer: "I was built and maintained by Cool Shot Systems, and my official birthday is August 9! 🥳"
    },
    {
      triggers: [
        "tell me about yourself",
        "describe yourself",
        "what are you",
        "what do you do"
      ],
      answer: "I'm CS Assistant, an intelligent digital assistant created to help you with your goals, reminders, questions, and daily productivity. I was launched on August 9 by Heritage Oladoye for Cool Shot Systems. Every August 9, I celebrate my birthday! 🎂"
    },
    {
      triggers: [
        "tell me about your creator",
        "who is heritage oladoye",
        "about heritage oladoye",
        "about your developer",
        "about your team"
      ],
      answer: "My creator, Heritage Oladoye, is a Nigerian developer and founder of Cool Shot Systems, the company behind my creation on August 9."
    },
    {
      triggers: [
        "when were you created",
        "when is your birthday",
        "when is your creation day",
        "what is your birthday",
        "your birthday",
        "when were you born"
      ],
      answer: "I was developed and officially launched on August 9, which I celebrate as my birthday every year! 🎉"
    }
  ];

  // Check for a match
  for (const qa of aboutQnA) {
    for (const phrase of qa.triggers) {
      if (lower.includes(phrase)) return qa.answer;
    }
  }

  // Special: If today is August 9, add a celebration!
  const today = new Date();
  if (today.getMonth() === 7 && today.getDate() === 9) {
    return "🎉 Today is my birthday! I was created on August 9 by Heritage Oladoye and Cool Shot Systems. Let's celebrate together! 🎂";
  }

  return null;
}

// ==========================
// MESSAGE RENDERING
// ==========================
function renderMessage({role, content, timestamp, avatar, name, badge, attachments, quickReplies, editable, id, status}) {
  const chatBox = document.getElementById("chat-box");
  const msg = document.createElement("div");
  msg.className = role === "user" ? "user-message" : "cs-message";
  msg.dataset.id = id || Date.now();

  // Avatar, name, role badge, status dot
  let avatarHTML = `<span class="avatar ${status||''}">${avatar || ''}${status ? `<span class="avatar-status"></span>` : ""}</span>`;
  let badgeHTML = badge ? `<span class="${badge.class}">${badge.label}</span>` : "";
  let nameHTML = name ? `<span class="cs-name">${name}</span>` : "";

  // Attachments
  let attachmentsHTML = attachments ? attachments.map(att =>
    `<span class="attachment"><a href="${att.url}" target="_blank">${att.name}</a></span>`
  ).join('') : '';

  // Message actions (admin can edit/delete any, user can edit/delete own)
  let actionsHTML = (editable || isAdmin()) ? `<div class="message-actions">
    <button class="edit-btn" title="Edit">✏️</button>
    <button class="delete-btn" title="Delete">🗑️</button>
  </div>` : '';

  // Timestamp
  let timeHTML = timestamp ? `<span class="message-timestamp">${formatTime(timestamp)}</span>` : "";

  // Quick replies
  let quickHTML = quickReplies ? `<div class="quick-replies">${quickReplies.map(q =>
    `<button>${q}</button>`).join('')}</div>` : "";

  msg.innerHTML = `
    ${avatarHTML}
    <div>
      ${nameHTML} ${badgeHTML}
      <div class="bubble">${content}${attachmentsHTML}</div>
      ${quickHTML}
      ${timeHTML}
      ${actionsHTML}
    </div>
  `;
  chatBox.appendChild(msg);

  // Quick reply buttons
  if (quickReplies) {
    msg.querySelectorAll('.quick-replies button').forEach(btn => {
      btn.onclick = () => sendMessage(btn.textContent);
    });
  }

  // Edit/delete buttons
  if ((editable || isAdmin()) && msg.querySelector('.edit-btn')) {
    msg.querySelector('.edit-btn').onclick = () => editMessage(msg);
    msg.querySelector('.delete-btn').onclick = () => deleteMessage(msg);
  }

  maybeScrollToBottom();
}

// ========== CONTEXT MENU FOR CS MESSAGES ==========
function createContextMenu(x, y, content) {
  let existing = document.getElementById("cs-context-menu");
  if (existing) existing.remove();

  const menu = document.createElement("div");
  menu.id = "cs-context-menu";
  menu.className = "cs-context-menu";
  menu.style.top = y + "px";
  menu.style.left = x + "px";
  menu.innerHTML = `
    <button id="cs-copy-btn">Copy</button>
    <button id="cs-share-btn">Share</button>
  `;
  document.body.appendChild(menu);

  document.getElementById("cs-copy-btn").onclick = () => {
    navigator.clipboard.writeText(content).then(() => {
      menu.remove();
      alert("Message copied!");
    });
  };
  document.getElementById("cs-share-btn").onclick = () => {
    if (navigator.share) {
      navigator.share({ text: content })
        .then(() => menu.remove())
        .catch(() => menu.remove());
    } else {
      navigator.clipboard.writeText(content).then(() => {
        menu.remove();
        alert("Message copied! (Sharing is not supported in this browser)");
      });
    }
  };
  setTimeout(() => {
    document.addEventListener("click", function handler(e) {
      if (!menu.contains(e.target)) menu.remove();
      document.removeEventListener("click", handler);
    });
  }, 10);
}
document.addEventListener("click", function(e) {
  const csMsg = e.target.closest(".cs-message .bubble");
  if (csMsg) {
    e.preventDefault();
    const rect = csMsg.getBoundingClientRect();
    const content = csMsg.textContent;
    createContextMenu(rect.right + window.scrollX, rect.top + window.scrollY, content);
  }
});

// ==========================
// TYPING INDICATOR
// ==========================
function showTypingIndicator() {
  const chatBox = document.getElementById("chat-box");
  let typing = document.getElementById("typing-indicator");
  if (!typing) {
    typing = document.createElement("div");
    typing.id = "typing-indicator";
    typing.className = "typing-indicator";
    typing.innerHTML = 'CS Assistant is typing <span class="dot"></span><span class="dot"></span><span class="dot"></span>';
    chatBox.appendChild(typing);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}
function hideTypingIndicator() {
  let typing = document.getElementById("typing-indicator");
  if (typing) typing.remove();
}

// ==========================
// UNREAD BADGE
// ==========================
function maybeScrollToBottom() {
  const chatBox = document.getElementById("chat-box");
  if (chatBox.scrollHeight - chatBox.scrollTop <= chatBox.clientHeight + 50) {
    chatBox.scrollTop = chatBox.scrollHeight;
    hideUnreadBadge();
  } else {
    showUnreadBadge();
  }
}
function showUnreadBadge() {
  let badge = document.querySelector('.unread-badge');
  if (!badge) {
    badge = document.createElement("div");
    badge.className = "unread-badge";
    badge.textContent = "New messages";
    badge.onclick = () => {
      document.getElementById("chat-box").scrollTop = document.getElementById("chat-box").scrollHeight;
      hideUnreadBadge();
    };
    document.body.appendChild(badge);
  }
}
function hideUnreadBadge() {
  let badge = document.querySelector('.unread-badge');
  if (badge) badge.remove();
}

// ==========================
// EDIT/DELETE
// ==========================
function editMessage(msgDiv) {
  const bubble = msgDiv.querySelector('.bubble');
  bubble.contentEditable = true;
  bubble.focus();
  bubble.onblur = () => {
    bubble.contentEditable = false;
    // Optionally update in chatHistory, save, etc.
  };
}
function deleteMessage(msgDiv) {
  msgDiv.remove();
  // Optionally remove from chatHistory, save, etc.
}

// ==========================
// PRESENCE (ADMIN = ONLINE)
// ==========================
function updatePresence(online = true) {
  document.querySelectorAll('.avatar').forEach(av => {
    av.classList.toggle('online', online);
    av.classList.toggle('offline', !online);
  });
}

// ==========================
// SPEECH-TO-TEXT
// ==========================
let recognition, recognizing = false;
function startSpeechToText() {
  if (!('webkitSpeechRecognition' in window)) return alert("Speech recognition not supported.");
  if (!recognition) {
    recognition = new webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.onresult = function(e) {
      document.getElementById("user-input").value = e.results[0][0].transcript;
    }
    recognition.onend = () => recognizing = false;
  }
  recognition.start();
  recognizing = true;
}
function stopSpeechToText() {
  if (recognition && recognizing) recognition.stop();
  recognizing = false;
}

// ==========================
// FILE ATTACHMENT
// ==========================
function handleFileInput(evt) {
  const files = evt.target.files;
  if (files.length) {
    renderMessage({
      role: "user",
      content: "Sent an attachment:",
      attachments: [{name: files[0].name, url: URL.createObjectURL(files[0])}],
      timestamp: nowISO(),
      avatar: userAvatar,
      name: userName,
      badge: isAdmin() ? {class: "user-badge", label: "ADMIN"} : null,
      editable: true
    });
  }
}

// ==========================
// ROLE BADGES
// ==========================
function getRoleBadge(role) {
  if (role === "bot") return {class: "bot-badge", label: "BOT"};
  if (role === "admin" || isAdmin()) return {class: "user-badge", label: "ADMIN"};
  return null;
}

// ==========================
// SOUND TOGGLE
// ==========================
function toggleMute() {
  isMuted = !isMuted;
  document.getElementById("mute-toggle").textContent = isMuted ? "🔇" : "🔊";
}

// ==========================
// HANDLE MESSAGE SEND
// ==========================
async function sendMessage(text=null) {
  const input = document.getElementById("user-input");
  const msgText = text || input.value.trim();
  if (!msgText) return;
  renderMessage({
    role: "user",
    content: msgText,
    timestamp: nowISO(),
    avatar: userAvatar,
    name: userName,
    badge: isAdmin() ? {class: "user-badge", label: "ADMIN"} : null,
    editable: true,
    status: "online"
  });
  input.value = "";

  showTypingIndicator();

  // --- PRESET RESPONSE ---
  const preset = checkAboutQuestions(msgText);
  let reply;
  if (preset) {
    reply = preset;
  } else {
    // --- AI API for other queries ---
    reply = await getAssistantResponse(msgText);
  }
  hideTypingIndicator();
  renderMessage({
    role: "bot",
    content: reply,
    timestamp: nowISO(),
    avatar: assistantAvatar,
    name: assistantName,
    badge: getRoleBadge("bot")
  });
}

// ==========================
// ADMIN CONTROLS
// ==========================
function showAdminControls() {
  if (!isAdmin()) return;
  let adminPanel = document.getElementById("admin-panel");
  if (!adminPanel) {
    adminPanel = document.createElement("div");
    adminPanel.id = "admin-panel";
    adminPanel.style.margin = "12px 0";
    adminPanel.innerHTML = `
      <button onclick="clearAllHistory()">Clear All Chat History</button>
      <button onclick="setTheme('dark')">Dark Theme</button>
      <button onclick="setTheme('light')">Light Theme</button>
      <input type="color" id="admin-accent-picker" value="${accentColor}">
    `;
    document.body.appendChild(adminPanel);
    document.getElementById("admin-accent-picker").oninput = e => setAccentColor(e.target.value);
  }
}
function clearAllHistory() {
  if (confirm("Are you sure you want to clear all chat history?")) {
    localStorage.clear();
    location.reload();
  }
}

// ==========================
// DASHBOARD: Goals, Reminders, History
// ==========================
function addGoal() {
  const input = document.getElementById("new-goal");
  const text = input.value.trim();
  if (text) {
    saveGoal(text);
    displayGoals();
    input.value = "";
  }
}
function saveGoal(text) {
  let goals = JSON.parse(localStorage.getItem("goals") || "[]");
  goals.push({ text, timestamp: Date.now() });
  localStorage.setItem("goals", JSON.stringify(goals));
}
function clearGoals() {
  localStorage.removeItem("goals");
  displayGoals();
}
function displayGoals() {
  const list = document.getElementById("goals-list");
  const goals = JSON.parse(localStorage.getItem("goals") || "[]");
  list.innerHTML = goals.map(g => `<li>${g.text}</li>`).join("");
}

function addReminder() {
  const input = document.getElementById("new-reminder");
  const text = input.value.trim();
  if (text) {
    saveReminder(text);
    displayReminders();
    input.value = "";
  }
}
function saveReminder(text) {
  let reminders = JSON.parse(localStorage.getItem("reminders") || "[]");
  reminders.push({ text, timestamp: Date.now() });
  localStorage.setItem("reminders", JSON.stringify(reminders));
}
function clearReminders() {
  localStorage.removeItem("reminders");
  displayReminders();
}
function displayReminders() {
  const list = document.getElementById("reminders-list");
  const reminders = JSON.parse(localStorage.getItem("reminders") || "[]");
  list.innerHTML = reminders.map(r => `<li>${r.text}</li>`).join("");
}
function displayChatHistory() {
  const container = document.getElementById("chat-history");
  const history = JSON.parse(localStorage.getItem("chat-history") || "{}");

  container.innerHTML = "";

  if (Object.keys(history).length === 0) {
    container.innerHTML = "<p>No chat history available.</p>";
    return;
  }

  for (let date in history) {
    const messages = history[date];
    const dateHeader = document.createElement("h3");
    dateHeader.textContent = date;
    container.appendChild(dateHeader);

    const ul = document.createElement("ul");
    messages.forEach(msgObj => {
      const li = document.createElement("li");

      // If your messages are stored as objects like { sender: "You", time: "...", text: "..." }
      if (typeof msgObj === "object") {
        const sender = msgObj.sender || "Unknown";
        const time = msgObj.time || "";
        const text = msgObj.text || msgObj.message || "";

        li.textContent = `[${time}] ${sender}: ${text}`;
      } else {
        // Fallback for plain strings
        li.textContent = msgObj;
      }

      ul.appendChild(li);
    });

    container.appendChild(ul);
  }
}

// Load history on page load
window.addEventListener("DOMContentLoaded", displayChatHistory);

// Optional: Load history on button click
document.getElementById("load-history-btn").addEventListener("click", displayChatHistory);

// ==========================
// PDF & SHARE
// ==========================
function downloadPDF() {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert("PDF library not loaded. Please check your internet connection.");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Cover Page
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("CS Assistant Chat History", 105, 60, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  const date = new Date().toLocaleString();
  doc.text(`Exported on: ${date}`, 105, 75, { align: "center" });

  if (userName) {
    doc.text(`User: ${userName}`, 105, 85, { align: "center" });
  }

  doc.addPage();
  let y = 10;
  doc.setFontSize(12);
  chatHistory.forEach(entry => {
    const role = entry.role === "user" ? userName || "User" : "CS";
    const lines = doc.splitTextToSize(`${role}: ${entry.content}`, 180);
    lines.forEach(line => {
      if (y > 280) {
        doc.addPage();
        y = 10;
      }
      doc.text(line, 10, y);
      y += 7;
    });
    y += 5;
  });

  doc.save("cschathistory.pdf");
}

function generateShareLink() {
  const data = {
    userName,
    chatHistory
  };
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  const url = `${window.location.origin}${window.location.pathname}?chat=${encoded}`;
  navigator.clipboard.writeText(url).then(() => {
    alert("Shareable link copied to clipboard! 📋");
  });
}

// ==========================
// SUPPORT MODAL - ADVANCED
// ==========================
document.getElementById("support-btn").onclick = function() {
  document.getElementById("support-modal").style.display = "flex";
  loadTicketHistory();
};

// FAQ search
function searchFAQ() {
  const val = document.getElementById("faq-search").value.toLowerCase();
  document.querySelectorAll("#faq-list li").forEach(li => {
    li.style.display = li.innerText.toLowerCase().includes(val) ? "" : "none";
  });
}

// Ticket form
document.getElementById("support-form").onsubmit = function(e) {
  e.preventDefault();
  const email = document.getElementById("support-email").value;
  const message = document.getElementById("support-message").value;
  const fileInput = document.getElementById("support-file");
  let fileName = fileInput.files.length ? fileInput.files[0].name : null;
  const ticket = {
    id: Date.now(),
    date: new Date().toLocaleString(),
    email, message, fileName, status: "pending"
  };
  // Save ticket locally
  let tickets = JSON.parse(localStorage.getItem("csTickets") || "[]");
  tickets.unshift(ticket);
  localStorage.setItem("csTickets", JSON.stringify(tickets));
  document.getElementById("support-success").style.display = "block";
  loadTicketHistory();
  setTimeout(() => {
    document.getElementById("support-modal").style.display = "none";
    document.getElementById("support-success").style.display = "none";
    document.getElementById("support-message").value = "";
    document.getElementById("support-email").value = "";
    document.getElementById("support-file").value = "";
  }, 2000);
};

// Ticket history
function loadTicketHistory() {
  let tickets = JSON.parse(localStorage.getItem("csTickets") || "[]");
  const ul = document.getElementById("ticket-history");
  ul.innerHTML = tickets.length
    ? tickets.map(t => `<li><strong>${t.status}</strong> [${t.date}]<br>${t.message}${t.fileName ? ` <em>(${t.fileName})</em>` : ''}</li>`).join('')
    : "<li>No previous requests.</li>";
}

// Modal close on outside click
window.onclick = function(event) {
  let modal = document.getElementById("support-modal");
  if (event.target === modal) modal.style.display = "none";
};

// ==========================
// INIT
// ==========================
window.onload = function () {
  // Load profile/theme
  let savedName = localStorage.getItem("csUserName");
  if (savedName) userName = savedName;
  let savedTheme = localStorage.getItem("csTheme");
  if (savedTheme) setTheme(savedTheme);
  let savedAccent = localStorage.getItem("csAccent");
  if (savedAccent) setAccentColor(savedAccent);

  // UI event listeners
  document.getElementById("send-btn").onclick = () => sendMessage();
  document.getElementById("user-input").onkeydown = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
  document.getElementById("mute-toggle").onclick = toggleMute;
  document.getElementById("mic-btn").onclick = () => recognizing ? stopSpeechToText() : startSpeechToText();
  document.getElementById("file-input").onchange = handleFileInput;
  document.getElementById("theme-toggle").onclick = () => setTheme(currentTheme === "dark" ? "light" : "dark");
  document.getElementById("accent-picker").oninput = e => setAccentColor(e.target.value);
  document.getElementById("download-pdf").onclick = downloadPDF;
  document.getElementById("share-link").onclick = generateShareLink;
  document.getElementById("add-goal").onclick = addGoal;
  document.getElementById("clear-goals").onclick = clearGoals;
  document.getElementById("add-reminder").onclick = addReminder;
  document.getElementById("clear-reminders").onclick = clearReminders;

  // Dashboard
  displayGoals();
  displayReminders();
  displayChatHistory();

  // Admin controls
  showAdminControls();

  // Presence
  updatePresence(true);

  // Greet
  if (!userName) {
    renderMessage({
      role: "bot",
      content: "Welcome! Please enter your name:",
      timestamp: nowISO(),
      avatar: assistantAvatar,
      name: assistantName,
      badge: getRoleBadge("bot")
    });
  }

  // Birthday celebration on August 9
  const today = new Date();
  if (today.getMonth() === 7 && today.getDate() === 9) {
    renderMessage({
      role: "bot",
      content: "🎉 Hooray! Today is my birthday! I was created on August 9 by Heritage Oladoye and Cool Shot Systems. Thank you for being part of my journey! 🎂",
      timestamp: nowISO(),
      avatar: assistantAvatar,
      name: assistantName,
      badge: getRoleBadge("bot")
    });
  }
};
let userName = localStorage.getItem("user-name") || null;
let awaitingName = false;

// 🧠 Add message to chat window and save to history
function addMessage(sender, text) {
  const chatWindow = document.getElementById("chat-window");
  const message = document.createElement("div");
  message.textContent = `${sender}: ${text}`;
  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  saveMessageToHistory(sender, text);
}

// 💾 Save message to localStorage
function saveMessageToHistory(sender, text) {
  const today = new Date().toISOString().split("T")[0];
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const history = JSON.parse(localStorage.getItem("chat-history") || "{}");
  if (!history[today]) history[today] = [];

  history[today].push({ sender, time, text });
  localStorage.setItem("chat-history", JSON.stringify(history));
}

// 🌞 Time-based greeting
function getTimeBasedGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// 👋 Greet user on load
function greetUser() {
  const greeting = getTimeBasedGreeting();
  if (userName) {
    addMessage("CS", `${greeting}, ${userName}! 👋 I'm CS, your friendly assistant.`);
    addMessage("CS", "What can I help you with today?");
  } else {
    addMessage("CS", `${greeting}! I'm CS, your friendly assistant. 😊`);
    addMessage("CS", "What is your name?");
    awaitingName = true;
  }
}

// 💬 Handle user input
function handleUserInput() {
  const input = document.getElementById("chat-input");
  const text = input.value.trim();
  if (!text) return;

  addMessage("You", text);
  input.value = "";

  if (awaitingName) {
    userName = text;
    localStorage.setItem("user-name", userName);
    addMessage("CS", `Nice to meet you, ${userName}! How can I assist you today?`);
    awaitingName = false;
    return;
  }

  addMessage("CS", `Thanks for your message, ${userName || "friend"}!`);
}

// 🔄 Reset name
function resetName() {
  localStorage.removeItem("user-name");
  userName = null;
  addMessage("CS", "Alright, let's start fresh! 😊");
  greetUser();
}

// 🆕 Start new chat
function startNewChat() {
  const chatWindow = document.getElementById("chat-window");
  chatWindow.innerHTML = "";
  addMessage("CS", "Starting a new chat... 🆕");
  greetUser();
}

// 📜 Display chat history
function displayChatHistory() {
  const container = document.getElementById("chat-history");
  const history = JSON.parse(localStorage.getItem("chat-history") || "{}");

  container.innerHTML = "";

  if (Object.keys(history).length === 0) {
    container.innerHTML = "<p>No chat history available.</p>";
    return;
  }

  for (let date in history) {
    const messages = history[date];
    const dateHeader = document.createElement("h3");
    dateHeader.textContent = date;
    container.appendChild(dateHeader);

    const ul = document.createElement("ul");
    messages.forEach(msg => {
      const li = document.createElement("li");
      li.textContent = `[${msg.time}] ${msg.sender}: ${msg.text}`;
      ul.appendChild(li);
    });

    container.appendChild(ul);
  }

  document.getElementById("overlay").style.display = "block";
  document.getElementById("chat-history-modal").style.display = "block";
}

// ❌ Close history modal
function closeHistory() {
  document.getElementById("overlay").style.display = "none";
  document.getElementById("chat-history-modal").style.display = "none";
}

// 🚀 Event listeners
window.addEventListener("DOMContentLoaded", greetUser);
document.getElementById("send-btn").addEventListener("click", handleUserInput);
document.getElementById("reset-name-btn").addEventListener("click", resetName);
document.getElementById("new-chat-btn").addEventListener("click", startNewChat);
document.getElementById("view-history-btn").addEventListener("click", displayChatHistory);
