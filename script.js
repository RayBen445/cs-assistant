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
const ADMIN_EMAIL = "oladoyeheritage445@gmail.com";
const assistantName = "CS Assistant";
const assistantAvatar = "🤖";
const userAvatar = "🧑";

// ==========================
// ICONS MAP (SVG)
// ==========================
const ICONS = {
  email: '<img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/gmail.svg" alt="Email" title="Email" style="width:20px;height:20px;vertical-align:middle;">',
  whatsapp: '<img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/whatsapp.svg" alt="WhatsApp" title="WhatsApp" style="width:20px;height:20px;vertical-align:middle;">',
  sms: '<img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/sms.svg" alt="SMS" title="SMS" style="width:20px;height:20px;vertical-align:middle;">',
  facebook: '<img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg" alt="Facebook" title="Facebook" style="width:20px;height:20px;vertical-align:middle;">',
  twitter: '<img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/twitter.svg" alt="Twitter" title="Twitter" style="width:20px;height:20px;vertical-align:middle;">',
  linkedin: '<img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg" alt="LinkedIn" title="LinkedIn" style="width:20px;height:20px;vertical-align:middle;">',
  telegram: '<img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/telegram.svg" alt="Telegram" title="Telegram" style="width:20px;height:20px;vertical-align:middle;">',
  instagram: '<img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instagram.svg" alt="Instagram" title="Instagram" style="width:20px;height:20px;vertical-align:middle;">',
  phone: '<img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/phone.svg" alt="Phone" title="Phone" style="width:20px;height:20px;vertical-align:middle;">',
  website: '<img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/internetexplorer.svg" alt="Website" title="Website" style="width:20px;height:20px;vertical-align:middle;">',
  copy: '<img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/copy.svg" alt="Copy" title="Copy" style="width:20px;height:20px;vertical-align:middle;">',
  share: '<img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/share.svg" alt="Share" title="Share" style="width:20px;height:20px;vertical-align:middle;">',
  pdf: '<img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/adobeacrobatreader.svg" alt="PDF" title="Download PDF" style="width:20px;height:20px;vertical-align:middle;">',
  mute: '<img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/microsoftexcel.svg" alt="Mute" title="Mute" style="width:20px;height:20px;vertical-align:middle;">',
  unmute: '<img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/microsoftpowerpoint.svg" alt="Unmute" title="Unmute" style="width:20px;height:20px;vertical-align:middle;">',
  mic: '<img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/microphone.svg" alt="Mic" title="Mic" style="width:20px;height:20px;vertical-align:middle;">',
  file: '<img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/file.svg" alt="File" title="File" style="width:20px;height:20px;vertical-align:middle;">',
  send: '<img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/send.svg" alt="Send" title="Send" style="width:20px;height:20px;vertical-align:middle;">',
  theme: '<img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/windows.svg" alt="Theme" title="Change Theme" style="width:20px;height:20px;vertical-align:middle;">',
  accent: '<img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/color.svg" alt="Accent" title="Accent Color" style="width:20px;height:20px;vertical-align:middle;">',
  edit: '<img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/edit.svg" alt="Edit" title="Edit" style="width:16px;height:16px;vertical-align:middle;">',
  delete: '<img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/delete.svg" alt="Delete" title="Delete" style="width:16px;height:16px;vertical-align:middle;">'
};

// ==========================
// UTILITIES
// ==========================
function nowISO() { return new Date().toISOString(); }
function formatTime(ts) { return new Date(ts).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"}); }
function isAdmin() {
  return userName && userName.trim().toLowerCase() === ADMIN_USERNAME.toLowerCase();
}

// ==========================
// AUTHENTICATION SYSTEM
// ==========================
function isAuthenticated() {
  return localStorage.getItem("csUserAccount") !== null;
}

function getCurrentUser() {
  const userAccount = localStorage.getItem("csUserAccount");
  return userAccount ? JSON.parse(userAccount) : null;
}

function showLoginModal() {
  document.getElementById("login-modal").style.display = "flex";
  document.getElementById("login-username").focus();
}

function closeLoginModal() {
  document.getElementById("login-modal").style.display = "none";
  document.getElementById("login-form").reset();
  document.getElementById("login-success").style.display = "none";
}

function handleLogin(username, _password = "") {
  // Check if user already exists, if not create new profile
  const existingAccount = getUserProfile(username);
  
  let userAccount;
  if (existingAccount) {
    // Update existing account with new login time
    userAccount = {
      ...existingAccount,
      lastLoginTime: Date.now()
    };
  } else {
    // Create new user account with default profile
    userAccount = {
      username: username,
      displayName: username,
      email: username.trim().toLowerCase() === ADMIN_USERNAME.toLowerCase() ? ADMIN_EMAIL : "",
      profileCreated: Date.now(),
      lastLoginTime: Date.now(),
      isAdmin: username.trim().toLowerCase() === ADMIN_USERNAME.toLowerCase(),
      preferences: {
        theme: "light",
        accentColor: "#0078d4",
        voice: null
      }
    };
  }
  
  localStorage.setItem("csUserAccount", JSON.stringify(userAccount));
  userName = username;
  localStorage.setItem("csUserName", username);
  
  // Apply user preferences
  applyUserPreferences(userAccount.preferences);
  
  // Update UI
  updateLoginStatus();
  hideAuthOverlay();
  closeLoginModal();
  
  // Show success message briefly
  document.getElementById("login-success").style.display = "block";
  setTimeout(() => {
    document.getElementById("login-success").style.display = "none";
  }, 3000);
  
  // Re-enable dashboard features
  enableDashboardFeatures();
  
  // Show admin controls if admin
  if (isAdmin()) {
    showAdminControls();
  }
  
  return true;
}

function handleLogout() {
  // Clear user account
  localStorage.removeItem("csUserAccount");
  localStorage.removeItem("csUserName");
  userName = null;
  
  // Update UI
  updateLoginStatus();
  showAuthOverlay();
  disableDashboardFeatures();
  
  // Hide admin controls
  const adminPanel = document.getElementById("admin-panel");
  if (adminPanel) {
    adminPanel.remove();
  }
}

function updateLoginStatus() {
  const userGreeting = document.getElementById("user-greeting");
  const loginToggleBtn = document.getElementById("login-toggle-btn");
  const profileBtn = document.getElementById("profile-btn");
  
  if (isAuthenticated()) {
    const user = getCurrentUser();
    const displayName = user.displayName || user.username;
    userGreeting.textContent = `Welcome back, ${displayName}!`;
    loginToggleBtn.textContent = "Sign Out";
    loginToggleBtn.className = "login-toggle-btn logout";
    loginToggleBtn.onclick = () => {
      if (confirm("Are you sure you want to sign out? Your chat history will no longer be saved.")) {
        handleLogout();
      }
    };
    profileBtn.style.display = "inline-block";
  } else {
    userGreeting.textContent = "Welcome! Please sign in to save your data.";
    loginToggleBtn.textContent = "Sign In";
    loginToggleBtn.className = "login-toggle-btn";
    loginToggleBtn.onclick = showLoginModal;
    profileBtn.style.display = "none";
  }
}

// ==========================
// PROFILE MANAGEMENT SYSTEM
// ==========================
function getUserProfile(username) {
  // Get user profile from localStorage based on username
  const profiles = JSON.parse(localStorage.getItem("csUserProfiles") || "{}");
  return profiles[username] || null;
}

function saveUserProfile(userAccount) {
  // Save user profile to localStorage
  const profiles = JSON.parse(localStorage.getItem("csUserProfiles") || "{}");
  profiles[userAccount.username] = userAccount;
  localStorage.setItem("csUserProfiles", JSON.stringify(profiles));
  
  // Also update current session
  localStorage.setItem("csUserAccount", JSON.stringify(userAccount));
}

function showProfileModal() {
  if (!isAuthenticated()) return;
  
  const user = getCurrentUser();
  if (!user) return;
  
  // Populate form with current user data
  document.getElementById("profile-username").value = user.username;
  document.getElementById("profile-display-name").value = user.displayName || user.username;
  document.getElementById("profile-email").value = user.email || "";
  document.getElementById("profile-theme").value = user.preferences?.theme || "light";
  document.getElementById("profile-accent").value = user.preferences?.accentColor || "#0078d4";
  
  // Populate voice options
  populateProfileVoices(user.preferences?.voice);
  
  // Update account info
  document.getElementById("profile-created-date").textContent = user.profileCreated ? 
    new Date(user.profileCreated).toLocaleDateString() : "-";
  document.getElementById("profile-last-login").textContent = user.lastLoginTime ? 
    new Date(user.lastLoginTime).toLocaleString() : "-";
  document.getElementById("profile-admin-status").textContent = user.isAdmin ? "Administrator" : "Regular User";
  
  document.getElementById("profile-modal").style.display = "flex";
  document.getElementById("profile-display-name").focus();
}

function closeProfileModal() {
  document.getElementById("profile-modal").style.display = "none";
  document.getElementById("profile-form").reset();
  document.getElementById("profile-success").style.display = "none";
}

function populateProfileVoices(selectedVoice = null) {
  const profileVoiceSelect = document.getElementById("profile-voice");
  profileVoiceSelect.innerHTML = '<option value="">Default</option>';
  
  if ('speechSynthesis' in window) {
    const voices = speechSynthesis.getVoices();
    voices.forEach(voice => {
      const option = document.createElement("option");
      option.value = voice.name;
      option.textContent = `${voice.name} (${voice.lang})`;
      if (selectedVoice === voice.name) {
        option.selected = true;
      }
      profileVoiceSelect.appendChild(option);
    });
  }
}

function applyUserPreferences(preferences) {
  if (!preferences) return;
  
  // Apply theme
  if (preferences.theme) {
    currentTheme = preferences.theme;
    document.body.className = preferences.theme;
    updateThemeToggle();
  }
  
  // Apply accent color
  if (preferences.accentColor) {
    accentColor = preferences.accentColor;
    document.documentElement.style.setProperty("--accent", preferences.accentColor);
    document.getElementById("accent-picker").value = preferences.accentColor;
  }
  
  // Apply voice preference
  if (preferences.voice) {
    selectedVoice = preferences.voice;
    const voiceSelect = document.getElementById("voice-selector");
    if (voiceSelect) {
      voiceSelect.value = preferences.voice;
    }
  }
}

function updateThemeToggle() {
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.textContent = currentTheme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
  }
}

function showAuthOverlay() {
  document.getElementById("auth-overlay").style.display = "flex";
  document.getElementById("show-login-btn").onclick = showLoginModal;
}

function hideAuthOverlay() {
  document.getElementById("auth-overlay").style.display = "none";
}

function disableDashboardFeatures() {
  // Disable goals, reminders, and history sections for non-authenticated users
  const sections = ["goals", "reminders", "history"];
  sections.forEach(id => {
    const section = document.getElementById(id);
    if (section) {
      section.classList.add("disabled");
      section.style.position = "relative";
    }
  });
}

function enableDashboardFeatures() {
  // Enable dashboard features for authenticated users
  const sections = ["goals", "reminders", "history"];
  sections.forEach(id => {
    const section = document.getElementById(id);
    if (section) {
      section.classList.remove("disabled");
    }
  });
  
  // Reload saved data
  displayGoals();
  displayReminders();
  displayChatHistory();
}

// ==========================
// THEME & ACCENT
// ==========================
function setTheme(theme) {
  currentTheme = theme;
  document.body.className = currentTheme;
  
  // Save to user profile if authenticated
  if (isAuthenticated()) {
    const user = getCurrentUser();
    if (user) {
      user.preferences = user.preferences || {};
      user.preferences.theme = theme;
      saveUserProfile(user);
    }
  } else {
    // Fallback to global storage for guests
    localStorage.setItem("csTheme", theme);
  }
  
  updateThemeToggle();
}

function setAccentColor(color) {
  accentColor = color;
  document.documentElement.style.setProperty('--accent', color);
  
  // Save to user profile if authenticated
  if (isAuthenticated()) {
    const user = getCurrentUser();
    if (user) {
      user.preferences = user.preferences || {};
      user.preferences.accentColor = color;
      saveUserProfile(user);
    }
  } else {
    // Fallback to global storage for guests
    localStorage.setItem("csAccent", color);
  }
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

// ==========================
// SPEECH SYNTHESIS (READ OUT)
// ==========================
function speakText(text) {
  if (!window.speechSynthesis || isMuted) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  if (selectedVoice) utter.voice = selectedVoice;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

// ==========================
// MESSAGE RENDERING (edit/delete icons)
// ==========================
function renderMessage({role, content, timestamp, avatar, name, badge, attachments, quickReplies, editable, id, status}) {
  const chatBox = document.getElementById("chat-box");
  const msg = document.createElement("div");
  msg.className = role === "user" ? "user-message" : "cs-message";
  msg.dataset.id = id || Date.now();
  let avatarHTML = `<span class="avatar ${status||''}">${avatar || ''}${status ? `<span class="avatar-status"></span>` : ""}</span>`;
  let badgeHTML = badge ? `<span class="${badge.class}">${badge.label}</span>` : "";
  let nameHTML = name ? `<span class="cs-name">${name}</span>` : "";
  let attachmentsHTML = attachments ? attachments.map(att =>
    `<span class="attachment">${ICONS.file}<a href="${att.url}" target="_blank">${att.name}</a></span>`
  ).join('') : '';
  let actionsHTML = (editable || isAdmin()) ? `<div class="message-actions">
    <button class="edit-btn" title="Edit">${ICONS.edit}</button>
    <button class="delete-btn" title="Delete">${ICONS.delete}</button>
  </div>` : '';
  let timeHTML = timestamp ? `<span class="message-timestamp">${formatTime(timestamp)}</span>` : "";
  let quickHTML = quickReplies ? `<div class="quick-replies">${quickReplies.map(q =>
    `<button>${ICONS.send} ${q}</button>`).join('')}</div>` : "";
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

  if (quickReplies) {
    msg.querySelectorAll('.quick-replies button').forEach(btn => {
      btn.onclick = () => sendMessage(btn.textContent);
    });
  }
  if ((editable || isAdmin()) && msg.querySelector('.edit-btn')) {
    msg.querySelector('.edit-btn').onclick = () => editMessage(msg);
    msg.querySelector('.delete-btn').onclick = () => deleteMessage(msg);
  }
  maybeScrollToBottom();
}

// ==========================
// CONTEXT MENU FOR CS MESSAGES (With icons)
// ==========================
function createContextMenu(x, y, content) {
  let existing = document.getElementById("cs-context-menu");
  if (existing) existing.remove();

  const menu = document.createElement("div");
  menu.id = "cs-context-menu";
  menu.className = "cs-context-menu";
  menu.style.top = y + "px";
  menu.style.left = x + "px";
  menu.innerHTML = `
    <button id="cs-copy-btn">${ICONS.copy} Copy</button>
    <button id="cs-share-btn">${ICONS.share} Share</button>
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
// SUPPORT MODAL - ADVANCED (icons for all contact options)
// ==========================
document.getElementById("support-btn").onclick = function () {
  document.getElementById("support-modal").style.display = "flex";
  loadTicketHistory();
};

function loadTicketHistory() {
  let tickets = JSON.parse(localStorage.getItem("csTickets") || "[]");
  const ul = document.getElementById("ticket-history");
  ul.innerHTML = tickets.length
    ? tickets.map(t => `<li>
      <strong>${t.status}</strong> [${t.date}]<br>
      ${t.message}${t.fileName ? ` <em>(${t.fileName})</em>` : ''}<br>
      ${t.reply ? `<div><strong>Admin Reply:</strong> <span class="ticket-reply">${t.reply}</span></div>` : ''}
      <div class="contact-icons" style="margin-top:6px;">
        <a href="mailto:${t.email}" title="Email" target="_blank" style="margin-right:8px;">${ICONS.email}</a>
        <a href="https://wa.me/?text=${encodeURIComponent(t.message)}" title="WhatsApp" target="_blank" style="margin-right:8px;">${ICONS.whatsapp}</a>
        <a href="sms:${t.email}" title="SMS" style="margin-right:8px;">${ICONS.sms}</a>
        <a href="https://facebook.com/sharer/sharer.php?u=${location.href}&quote=${encodeURIComponent(t.message)}" title="Facebook" target="_blank" style="margin-right:8px;">${ICONS.facebook}</a>
        <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(t.message)}" title="Twitter" target="_blank" style="margin-right:8px;">${ICONS.twitter}</a>
        <a href="https://t.me/share/url?url=${location.href}&text=${encodeURIComponent(t.message)}" title="Telegram" target="_blank" style="margin-right:8px;">${ICONS.telegram}</a>
        <a href="https://www.linkedin.com/shareArticle?mini=true&url=${location.href}&title=${encodeURIComponent(t.message)}" title="LinkedIn" target="_blank" style="margin-right:8px;">${ICONS.linkedin}</a>
        <a href="https://instagram.com/" title="Instagram" target="_blank" style="margin-right:8px;">${ICONS.instagram}</a>
        <a href="tel:${t.email}" title="Phone">${ICONS.phone}</a>
        <a href="${location.origin}" title="Website" target="_blank">${ICONS.website}</a>
      </div>
      </li>`).join('')
    : "<li>No previous requests.</li>";

  if (tickets.length && tickets[0].reply) {
    speakText("Reply from admin: " + tickets[0].reply);
  }
}

// ==========================
// ADMIN CONTROLS (icons for admin actions)
// ==========================
function showAdminControls() {
  if (!isAuthenticated() || !isAdmin()) return;
  let adminPanel = document.getElementById("admin-panel");
  if (!adminPanel) {
    adminPanel = document.createElement("div");
    adminPanel.id = "admin-panel";
    adminPanel.style.margin = "12px 0";
    adminPanel.innerHTML = `
      <button onclick="clearAllHistory()">${ICONS.delete} Clear All Chat History</button>
      <button onclick="setTheme('dark')">${ICONS.theme} Dark Theme</button>
      <button onclick="setTheme('light')">${ICONS.theme} Light Theme</button>
      <label>${ICONS.accent} Accent Color <input type="color" id="admin-accent-picker" value="${accentColor}" style="vertical-align:middle;"></label>
      <div id="admin-tickets-section" style="margin-top:16px;">
        <h3>Support Tickets ${ICONS.file}</h3>
        <ul id="admin-ticket-list"></ul>
      </div>
    `;
    document.body.appendChild(adminPanel);
    document.getElementById("admin-accent-picker").oninput = e => setAccentColor(e.target.value);
    displayAdminTickets();
  }
}

function displayAdminTickets() {
  const ul = document.getElementById("admin-ticket-list");
  if (!ul) return;
  let tickets = JSON.parse(localStorage.getItem("csTickets") || "[]");
  ul.innerHTML = tickets.length
    ? tickets.map((t, idx) =>
        `<li data-ticket-idx="${idx}">
          <strong>Status:</strong> <span class="ticket-status">${t.status}</span> 
          <strong>Date:</strong> ${t.date}<br>
          <strong>Email:</strong> ${t.email}<br>
          <strong>Message:</strong> ${t.message}${t.fileName ? ` <em>(${t.fileName})</em>` : ''}<br>
          ${t.reply ? `<div><strong>Admin Reply:</strong> <span class="ticket-reply">${t.reply}</span></div>` : ''}
          <button class="resolve-btn">${ICONS.edit} Resolve</button>
          <button class="reply-btn">${ICONS.send} Reply</button>
          <div class="reply-area" style="display:none;">
            <textarea rows="2" style="width:90%;margin-top:5px;" class="reply-text"></textarea>
            <button class="submit-reply-btn">${ICONS.send} Send Reply</button>
          </div>
        </li>`
      ).join('')
    : "<li>No support requests yet.</li>";

  Array.from(ul.querySelectorAll('li[data-ticket-idx]')).forEach(li => {
    const idx = Number(li.getAttribute('data-ticket-idx'));
    const resolveBtn = li.querySelector('.resolve-btn');
    const replyBtn = li.querySelector('.reply-btn');
    const replyArea = li.querySelector('.reply-area');
    const submitReplyBtn = li.querySelector('.submit-reply-btn');
    const replyText = li.querySelector('.reply-text');
    resolveBtn.onclick = function () {
      let tickets = JSON.parse(localStorage.getItem("csTickets") || "[]");
      tickets[idx].status = "resolved";
      localStorage.setItem("csTickets", JSON.stringify(tickets));
      displayAdminTickets();
    };
    replyBtn.onclick = function () {
      replyArea.style.display = replyArea.style.display === "none" ? "block" : "none";
    };
    submitReplyBtn.onclick = function () {
      let replyVal = replyText.value.trim();
      if (replyVal) {
        let tickets = JSON.parse(localStorage.getItem("csTickets") || "[]");
        tickets[idx].reply = replyVal;
        localStorage.setItem("csTickets", JSON.stringify(tickets));
        displayAdminTickets();
        speakText("Reply sent: " + replyVal);
      }
    };
  });
}

function clearAllHistory() {
  if (confirm("Are you sure you want to clear all chat history?")) {
    localStorage.clear();
    chatHistory = [];
    location.reload();
  }
}

// ==========================
// GOALS, REMINDERS, HISTORY
// ==========================
function addGoal() {
  if (!isAuthenticated()) {
    alert("Please sign in to save goals!");
    showLoginModal();
    return;
  }
  const input = document.getElementById("new-goal");
  const text = input.value.trim();
  if (text) {
    saveGoal(text);
    displayGoals();
    input.value = "";
  }
}
function saveGoal(text) {
  if (!isAuthenticated()) return;
  let goals = JSON.parse(localStorage.getItem("goals") || "[]");
  goals.push({ text, timestamp: Date.now() });
  localStorage.setItem("goals", JSON.stringify(goals));
}
function clearGoals() {
  if (!isAuthenticated()) {
    alert("Please sign in to manage goals!");
    return;
  }
  localStorage.removeItem("goals");
  displayGoals();
}
function displayGoals() {
  const list = document.getElementById("goals-list");
  if (!isAuthenticated()) {
    list.innerHTML = "<li>Sign in to save and view your goals.</li>";
    return;
  }
  const goals = JSON.parse(localStorage.getItem("goals") || "[]");
  list.innerHTML = goals.map(g => `<li>${g.text}</li>`).join("");
}

function addReminder() {
  if (!isAuthenticated()) {
    alert("Please sign in to save reminders!");
    showLoginModal();
    return;
  }
  const input = document.getElementById("new-reminder");
  const text = input.value.trim();
  if (text) {
    saveReminder(text);
    displayReminders();
    input.value = "";
  }
}
function saveReminder(text) {
  if (!isAuthenticated()) return;
  let reminders = JSON.parse(localStorage.getItem("reminders") || "[]");
  reminders.push({ text, timestamp: Date.now() });
  localStorage.setItem("reminders", JSON.stringify(reminders));
}
function clearReminders() {
  if (!isAuthenticated()) {
    alert("Please sign in to manage reminders!");
    return;
  }
  localStorage.removeItem("reminders");
  displayReminders();
}
function displayReminders() {
  const list = document.getElementById("reminders-list");
  if (!isAuthenticated()) {
    list.innerHTML = "<li>Sign in to save and view your reminders.</li>";
    return;
  }
  const reminders = JSON.parse(localStorage.getItem("reminders") || "[]");
  list.innerHTML = reminders.map(r => `<li>${r.text}</li>`).join("");
}

function displayChatHistory() {
  const container = document.getElementById("chat-history");
  if (!isAuthenticated()) {
    container.innerHTML = "<p>Sign in to save and view your chat history!</p>";
    return;
  }
  const history = JSON.parse(localStorage.getItem("chat-history") || "[]");
  let html = "";
  if (history.length === 0) {
    html = "<p>No chat history yet.</p>";
  } else {
    // Group by date
    const grouped = {};
    history.forEach(msg => {
      const d = new Date(msg.timestamp);
      const dateStr = d.toLocaleDateString();
      if (!grouped[dateStr]) grouped[dateStr] = [];
      grouped[dateStr].push(msg);
    });
    for (let date in grouped) {
      html += `<h3>${date}</h3><ul>`;
      grouped[date].forEach(msg => {
        html += `<li><strong>${msg.role === "user" ? (userName || "User") : "CS"}:</strong> ${msg.content}</li>`;
      });
      html += `</ul>`;
    }
  }
  container.innerHTML = html;
}

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
  const history = JSON.parse(localStorage.getItem("chat-history") || "[]");
  history.forEach(entry => {
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
    chatHistory: JSON.parse(localStorage.getItem("chat-history") || "[]")
  };
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  const url = `${window.location.origin}${window.location.pathname}?chat=${encoded}`;
  navigator.clipboard.writeText(url).then(() => {
    alert("Shareable link copied to clipboard! 📋");
  });
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
  bubble.contentEditable = true;
  bubble.focus();
  bubble.onblur = () => {
    bubble.contentEditable = false;
  };
}
function deleteMessage(msgDiv) {
  const msgId = msgDiv.dataset.id;
  chatHistory = chatHistory.filter(m => m.id !== msgId);
  localStorage.setItem("chat-history", JSON.stringify(chatHistory));
  msgDiv.remove();
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
    const msgObj = {
      role: "user",
      content: "Sent an attachment:",
      attachments: [{name: files[0].name, url: URL.createObjectURL(files[0])}],
      timestamp: nowISO(),
      avatar: userAvatar,
      name: userName,
      badge: isAdmin() ? {class: "user-badge", label: "ADMIN"} : null,
      editable: true,
      id: Date.now().toString()
    };
    renderMessage(msgObj);
    chatHistory.push(msgObj);
    localStorage.setItem("chat-history", JSON.stringify(chatHistory));
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
  document.getElementById("mute-toggle").innerHTML = isMuted ? ICONS.mute : ICONS.unmute;
}

// ==========================
// MESSAGE SEND
// ==========================
async function sendMessage(text=null) {
  const input = document.getElementById("user-input");
  const msgText = text || input.value.trim();
  if (!msgText) return;

  const userMsgObj = {
    role: "user",
    content: msgText,
    timestamp: nowISO(),
    avatar: userAvatar,
    name: userName,
    badge: isAdmin() ? {class: "user-badge", label: "ADMIN"} : null,
    editable: true,
    status: "online",
    id: Date.now().toString()
  };
  renderMessage(userMsgObj);

  // Only save to history if user is authenticated
  if (isAuthenticated()) {
    chatHistory.push(userMsgObj);
    localStorage.setItem("chat-history", JSON.stringify(chatHistory));
  }

  input.value = "";

  showTypingIndicator();

  const preset = checkAboutQuestions(msgText);
  let reply;
  if (preset) {
    reply = preset;
  } else {
    reply = await getAssistantResponse(msgText);
  }
  hideTypingIndicator();

  const botMsgObj = {
    role: "bot",
    content: reply,
    timestamp: nowISO(),
    avatar: assistantAvatar,
    name: assistantName,
    badge: getRoleBadge("bot"),
    id: Date.now().toString()
  };
  renderMessage(botMsgObj);

  // Only save to history if user is authenticated
  if (isAuthenticated()) {
    chatHistory.push(botMsgObj);
    localStorage.setItem("chat-history", JSON.stringify(chatHistory));
  }

  speakText(reply);
}

// ==========================
// PRESET RESPONSES FOR ABOUT/IDENTITY/BIRTHDAY QUESTIONS
// ==========================
function checkAboutQuestions(msgText) {
  const lower = msgText.trim().toLowerCase();

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
      answer: "I'm CS Assistant, an intelligent digital assistant created to help you with your goals, reminders, questions, and daily productivity. I was launched on August 9 by Heritage Oladoye for [...]"
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

  for (const qa of aboutQnA) {
    for (const phrase of qa.triggers) {
      if (lower.includes(phrase)) return qa.answer;
    }
  }
  const today = new Date();
  if (today.getMonth() === 7 && today.getDate() === 9) {
    return "🎉 Today is my birthday! I was created on August 9 by Heritage Oladoye and Cool Shot Systems. Let's celebrate together! 🎂";
  }
  return null;
}

// ==========================
// INIT
// ==========================
window.onload = function () {
  // Initialize authentication first
  if (isAuthenticated()) {
    const user = getCurrentUser();
    userName = user.username;
    hideAuthOverlay();
    enableDashboardFeatures();
  } else {
    showAuthOverlay();
    disableDashboardFeatures();
  }
  updateLoginStatus();

  // Legacy support: if old csUserName exists but no account, migrate to new system
  // Handle legacy user migration and authentication
  let savedName = localStorage.getItem("csUserName");
  if (savedName && !isAuthenticated()) {
    handleLogin(savedName);
  }

  // Load preferences based on authentication status
  if (isAuthenticated()) {
    const user = getCurrentUser();
    if (user && user.preferences) {
      // Load user-specific preferences
      applyUserPreferences(user.preferences);
    } else {
      // Fallback to global settings for users without profiles
      let savedTheme = localStorage.getItem("csTheme");
      if (savedTheme) setTheme(savedTheme);
      let savedAccent = localStorage.getItem("csAccent");
      if (savedAccent) setAccentColor(savedAccent);
    }
  } else {
    // Load global preferences for guests
    let savedTheme = localStorage.getItem("csTheme");
    if (savedTheme) setTheme(savedTheme);
    let savedAccent = localStorage.getItem("csAccent");
    if (savedAccent) setAccentColor(savedAccent);
  }

  // Only load history if authenticated
  if (isAuthenticated()) {
    let savedHistory = localStorage.getItem("chat-history");
    if (savedHistory) {
      chatHistory = JSON.parse(savedHistory);
      chatHistory.forEach(entry => renderMessage({
        ...entry,
        avatar: entry.role === "user" ? userAvatar : assistantAvatar,
        name: entry.role === "user" ? userName : assistantName,
        badge: getRoleBadge(entry.role),
        editable: entry.role === "user"
      }));
    }
  }

  document.getElementById("send-btn").innerHTML = `${ICONS.send} Send`;
  document.getElementById("mute-toggle").innerHTML = isMuted ? ICONS.mute : ICONS.unmute;
  document.getElementById("mic-btn").innerHTML = ICONS.mic;
  document.getElementById("theme-toggle").innerHTML = ICONS.theme;
  document.getElementById("download-pdf").innerHTML = ICONS.pdf + " Export PDF";
  document.getElementById("share-link").innerHTML = ICONS.share + " Share Chat";
  if (document.getElementById("file-input-label")) document.getElementById("file-input-label").innerHTML = ICONS.file + " Attach File";
  if (document.getElementById("accent-picker-label")) document.getElementById("accent-picker-label").innerHTML = ICONS.accent + " Accent";
  document.getElementById("add-goal").innerHTML = ICONS.send + " Add Goal";
  document.getElementById("clear-goals").innerHTML = ICONS.delete + " Clear Goals";
  document.getElementById("add-reminder").innerHTML = ICONS.send + " Add Reminder";
  document.getElementById("clear-reminders").innerHTML = ICONS.delete + " Clear Reminders";

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
  
  // Login form handler
  document.getElementById("login-form").onsubmit = function(e) {
    e.preventDefault();
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();
    
    if (username) {
      handleLogin(username, password);
    } else {
      alert("Please enter a username!");
    }
  };

  // Profile form handler
  document.getElementById("profile-form").onsubmit = function(e) {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      alert("You must be logged in to update your profile!");
      return;
    }
    
    const user = getCurrentUser();
    if (!user) return;
    
    // Get form data
    const displayName = document.getElementById("profile-display-name").value.trim();
    const email = document.getElementById("profile-email").value.trim();
    const theme = document.getElementById("profile-theme").value;
    const accentColor = document.getElementById("profile-accent").value;
    const voice = document.getElementById("profile-voice").value;
    
    // Update user account
    user.displayName = displayName || user.username;
    user.email = email;
    user.preferences = user.preferences || {};
    user.preferences.theme = theme;
    user.preferences.accentColor = accentColor;
    user.preferences.voice = voice;
    user.profileUpdated = Date.now();
    
    // Save profile
    saveUserProfile(user);
    
    // Apply new preferences immediately
    applyUserPreferences(user.preferences);
    
    // Update UI to reflect changes
    updateLoginStatus();
    
    // Show success message
    document.getElementById("profile-success").style.display = "block";
    setTimeout(() => {
      document.getElementById("profile-success").style.display = "none";
      closeProfileModal();
    }, 2000);
  };

  displayGoals();
  displayReminders();
  displayChatHistory();

  // Only show admin controls for authenticated admin users
  if (isAuthenticated() && isAdmin()) {
    showAdminControls();
  }

  // Initialize presence (could be used for future features like online status)
  // updatePresence(true);

  if (!userName) {
    renderMessage({
      role: "bot",
      content: "Welcome! Please enter your name:",
      timestamp: nowISO(),
      avatar: assistantAvatar,
      name: assistantName,
      badge: getRoleBadge("bot")
    });
    speakText("Welcome! Please enter your name:");
  }

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
    speakText("Hooray! Today is my birthday! I was created on August 9 by Heritage Oladoye and Cool Shot Systems. Thank you for being part of my journey!");
  }
};
