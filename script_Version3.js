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

  // Scroll handling
  maybeScrollToBottom();
}

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
  const oldText = bubble.textContent;
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

  // Show typing...
  showTypingIndicator();

  // Simulate AI reply with all features
  setTimeout(() => {
    hideTypingIndicator();
    renderMessage({
      role: "bot",
      content: "Here's a response! How can I help?",
      timestamp: nowISO(),
      avatar: assistantAvatar,
      name: assistantName,
      badge: getRoleBadge("bot"),
      quickReplies: ["Show my goals", "Remind me", "Change theme"]
    });
  }, 1500);
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

  // Demo: admin controls
  showAdminControls();

  // Demo: set yourself online
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
};