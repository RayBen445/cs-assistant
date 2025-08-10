// dailyChat.js

// 📅 Utility: Get today's date as YYYY-MM-DD
function getToday() {
  return new Date().toISOString().split("T")[0];
}

// 🕒 Save chat message under today's date
function saveChat(message) {
  const today = getToday();
  let history = JSON.parse(localStorage.getItem("chat-history") || "{}");
  if (!history[today]) history[today] = [];
  history[today].push(message);
  localStorage.setItem("chat-history", JSON.stringify(history));
}

// 🏷️ Show "Today" label
function showTodayLabel() {
  const label = document.getElementById("chat-label");
  if (label) label.textContent = "Today";
}

// 📅 Restore today's chat or start fresh
function restoreOrStartNewChat() {
  const today = getToday();
  const lastSession = localStorage.getItem("last-session");

  if (lastSession !== today) {
    localStorage.setItem("last-session", today);
    document.getElementById("user-input").value = "";
  } else {
    const history = JSON.parse(localStorage.getItem("chat-history") || "{}");
    const todayChat = history[today] || [];
    document.getElementById("user-input").value = todayChat.join("\n");
  }

  showTodayLabel();
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

// 📝 Save reminder
function saveReminder(text) {
  let reminders = JSON.parse(localStorage.getItem("reminders") || "[]");
  reminders.push({ text, timestamp: Date.now() });
  localStorage.setItem("reminders", JSON.stringify(reminders));
}

// 🎯 Save goal
function saveGoal(text) {
  let goals = JSON.parse(localStorage.getItem("goals") || "[]");
  goals.push({ text, timestamp: Date.now() });
  localStorage.setItem("goals", JSON.stringify(goals));
}

// 📌 Display reminders in dashboard
function displayReminders() {
  const list = document.getElementById("reminder-list");
  const reminders = JSON.parse(localStorage.getItem("reminders") || "[]");
  list.innerHTML = reminders.map(r => `<li>${r.text}</li>`).join("");
}

// 🎯 Display goals in dashboard
function displayGoals() {
  const list = document.getElementById("goal-list");
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
