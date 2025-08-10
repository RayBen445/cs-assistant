// dailyChat.js

// 📅 Utility: Get today's date as YYYY-MM-DD
function getToday() {
  return new Date().toISOString().split("T")[0];
}

// 🧠 Restore or start new chat session
function restoreOrStartNewChat() {
  const today = getToday();
  const lastSession = localStorage.getItem("last-session");

  if (lastSession !== today) {
    localStorage.setItem("last-session", today);
    document.getElementById("user-input").value = "";
    greetUser(); // 👋 Send greeting
  } else {
    const history = JSON.parse(localStorage.getItem("chat-history") || "{}");
    const todayChat = history[today] || [];
    document.getElementById("user-input").value = todayChat.join("\n");
  }

  showTodayLabel();
}

// 🗨️ Greet the user with voice
function greetUser() {
  const chatBox = document.getElementById("chat-box");
  const msg = document.createElement("div");
  msg.className = "cs-message";
  msg.textContent = "CS Assistant: Good morning! Before we begin, may I know your name?";
  chatBox.appendChild(msg);

  const utterance = new SpeechSynthesisUtterance("Good morning! Before we begin, may I know your name?");
  utterance.voice = speechSynthesis.getVoices()[0];
  speechSynthesis.speak(utterance);
}

// 🧠 Handle user input for name
function handleUserInput(inputText) {
  const lower = inputText.toLowerCase();
  if (lower.includes("my name is")) {
    const name = inputText.split("my name is")[1].trim();
    if (name) {
      localStorage.setItem("user-name", name);
      respondWithGreeting(name);
    }
  }
}

// 👋 Respond with personalized greeting
function respondWithGreeting(name) {
  const chatBox = document.getElementById("chat-box");
  const msg = document.createElement("div");
  msg.className = "cs-message";
  msg.textContent = `CS Assistant: Nice to meet you, ${name}! I'm here to help you today.`;
  chatBox.appendChild(msg);

  const utterance = new SpeechSynthesisUtterance(`Nice to meet you, ${name}! I'm here to help you today.`);
  utterance.voice = speechSynthesis.getVoices()[0];
  speechSynthesis.speak(utterance);
}

// 💬 Save chat message under today's date
function saveChat(message) {
  const today = getToday();
  let history = JSON.parse(localStorage.getItem("chat-history") || "{}");
  if (!history[today]) history[today] = [];
  history[today].push(message);
  localStorage.setItem("chat-history", JSON.stringify(history));
  handleUserInput(message); // 👈 Check if it's a name
}

// 🏷️ Show "Today" label
function showTodayLabel() {
  const label = document.getElementById("chat-label");
  if (label) label.textContent = "Today";
}

// 🧹 Delete chats older than X days
function cleanupOldChats(days = 7) {
  const history = JSON.parse(localStorage.getItem("chat-history") || "{}");
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffDate = cutoff.toISOString().split("T")[0];

  for (let date in history) {
    if (date < cutoffDate) {
      delete history[date];
    }
  }

  localStorage.setItem("chat-history", JSON.stringify(history));
}

// ➕ Save reminder
function saveReminder(text) {
  let reminders = JSON.parse(localStorage.getItem("reminders") || "[]");
  reminders.push({ text, timestamp: Date.now() });
  localStorage.setItem("reminders", JSON.stringify(reminders));
}

// ➕ Save goal
function saveGoal(text) {
  let goals = JSON.parse(localStorage.getItem("goals") || "[]");
  goals.push({ text, timestamp: Date.now() });
  localStorage.setItem("goals", JSON.stringify(goals));
}

// 🗑️ Clear reminders
function clearReminders() {
  localStorage.removeItem("reminders");
  displayReminders();
}

// 🗑️ Clear goals
function clearGoals() {
  localStorage.removeItem("goals");
  displayGoals();
}

// 📌 Display reminders in dashboard
function displayReminders() {
  const list = document.getElementById("reminders-list");
  const reminders = JSON.parse(localStorage.getItem("reminders") || "[]");
  list.innerHTML = reminders.map(r => `<li>${r.text}</li>`).join("");
}

// 🎯 Display goals in dashboard
function displayGoals() {
  const list = document.getElementById("goals-list");
  const goals = JSON.parse(localStorage.getItem("goals") || "[]");
  list.innerHTML = goals.map(g => `<li>${g.text}</li>`).join("");
}

// 🕒 Display chat history grouped by date
function displayChatHistory() {
  const container = document.getElementById("chat-history");
  const history = JSON.parse(localStorage.getItem("chat-history") || "{}");

  let html = "";
  for (let date in history) {
    html += `<h3>${date}</h3><ul>`;
    history[date].forEach(msg => {
      html += `<li>${msg}</li>`;
    });
    html += `</ul>`;
  }

  container.innerHTML = html;
}

// 🆕 Start a new chat manually
function startNewChat() {
  const today = getToday();
  localStorage.setItem("last-session", today);
  document.getElementById("user-input").value = "";

  const chatBox = document.getElementById("chat-box");
  const msg = document.createElement("div");
  msg.className = "cs-message";
  msg.textContent = "CS Assistant: Starting a fresh chat session 🆕";
  chatBox.appendChild(msg);

  const utterance = new SpeechSynthesisUtterance("Starting a fresh chat session.");
  utterance.voice = speechSynthesis.getVoices()[0];
  speechSynthesis.speak(utterance);
  }  localStorage.setItem("reminders", JSON.stringify(reminders));
}

// 🎯 Save goal
function saveGoal(text) {
  let goals = JSON.parse(localStorage.getItem("goals") || "[]");
  goals.push({ text, timestamp: Date.now() });
  localStorage.setItem("goals", JSON.stringify(goals));
}

// 📌 Display reminders in dashboard
function displayReminders() {
  const list = document.getElementById("reminders-list");
  const reminders = JSON.parse(localStorage.getItem("reminders") || "[]");
  list.innerHTML = reminders.map(r => `<li>${r.text}</li>`).join("");
}

// 🎯 Display goals in dashboard
function displayGoals() {
  const list = document.getElementById("goals-list");
  const goals = JSON.parse(localStorage.getItem("goals") || "[]");
  list.innerHTML = goals.map(g => `<li>${g.text}</li>`).join("");
}

// 🕒 Display chat history grouped by date
function displayChatHistory() {
  const container = document.getElementById("chat-history");
  const history = JSON.parse(localStorage.getItem("chat-history") || "{}");

  let html = "";
  for (let date in history) {
    html += `<h3>${date}</h3><ul>`;
    history[date].forEach(msg => {
      html += `<li>${msg}</li>`;
    });
    html += `</ul>`;
  }

  container.innerHTML = html;
}    history[date].forEach(msg => {
      html += `<li>${msg}</li>`;
    });
    html += `</ul>`;
  }

  container.innerHTML = html;
}
