let userName = null;
let isMuted = false;
let selectedVoice = null;
let currentTheme = "light";
let goals = [];
let tasks = [];
let chatHistory = [];

const assistantName = "CS Assistant";
const assistantCreator = "Cool Shot Systems";
const assistantPoweredBy = "Heritage Oladoye";

const csBirthday = {
  day: 9,
  month: 8,
  year: 2025
};

const aboutHeritageOladoye = `
Heritage Oladoye is a visionary software developer, creative technologist, and founder of Cool Shot Systems. He builds intelligent digital experiences that blend technical precision with human-centere[...]
`;

const aboutCoolShotSystems = `
Cool Shot Systems is a forward-thinking software company founded by Heritage Oladoye. It specializes in crafting intelligent, user-centric digital solutions — from mobile platforms to AI-powered ass[...]
`;

function sanitizeResponse(text) {
  return text
    .replace(/\bOpenAI\b/gi, assistantPoweredBy)
    .replace(/\bChatGPT\b/gi, assistantName)
    .replace(/\bGPT-4\b|\bGPT-3\.5\b/gi, "CS Assistant's smart core")
    .replace(/artificial intelligence research organization.*?(\.|$)/gi, "software company focused on human-centered digital innovation.")
    .replace(/Elon Musk|Sam Altman|Greg Brockman|Ilya Sutskever|John Schulman|Wojciech Zaremba/gi, "Heritage Oladoye and the Cool Shot Systems team")
    .replace(/created by .*?(\.|$)/gi, `created by ${assistantCreator}.`)
    .replace(/developed by .*?(\.|$)/gi, `developed by ${assistantCreator}.`);
}

function maybeAddSignature(text) {
  const shouldAdd = Math.random() < 0.2;
  if (!shouldAdd) return text;
  const signature = `<br><br><em>— Powered by ${assistantPoweredBy}, crafted by ${assistantCreator}</em>`;
  return text + signature;
}

function speak(text) {
  if (isMuted || !selectedVoice) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = selectedVoice;
  utterance.lang = "en-US";
  utterance.rate = 1.05;
  utterance.pitch = 1.2;
  utterance.volume = 1;
  speechSynthesis.speak(utterance);
}

function stripHTML(html) {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || "";
}

function displayMessage(sender, text) {
  const chatBox = document.getElementById("chat-box");
  const message = document.createElement("div");
  const themeClass = currentTheme === "dark" ? "dark-theme" : "light-theme";
  message.className = sender === "user" ? `user-message ${themeClass}` : `cs-message ${themeClass}`;
  const finalText = sender === "cs" ? maybeAddSignature(text) : text;
  message.innerHTML = `<p>${finalText}</p>`;
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
  if (sender === "cs") {
    speak(stripHTML(finalText));
  }
}

function saveProfile() {
  // Save user profile and chat history by date
  localStorage.setItem("csUserName", userName);
  localStorage.setItem("csMuted", JSON.stringify(isMuted));
  localStorage.setItem("csTheme", currentTheme);
  localStorage.setItem("csGoals", JSON.stringify(goals));
  localStorage.setItem("csTasks", JSON.stringify(tasks));
  // Save chat history by day
  const todayKey = new Date().toISOString().split("T")[0];
  const allHistory = JSON.parse(localStorage.getItem("csChatHistory")) || {};
  allHistory[todayKey] = chatHistory;
  localStorage.setItem("csChatHistory", JSON.stringify(allHistory));
}

function askForName() {
  const question = "Before we begin, may I know your name? 😊";
  displayMessage("cs", question);
  chatHistory.push({ role: "assistant", content: question });
}

function checkBirthday() {
  const today = new Date();
  if (
    today.getDate() === csBirthday.day &&
    today.getMonth() + 1 === csBirthday.month
  ) {
    const birthdayMessage = `
🎉 Happy Birthday to me! 🎂 I was born on August 9, ${csBirthday.year}, thanks to the brilliant mind of Heritage Oladoye and the innovation of Cool Shot Systems.

I'm celebrating another year of helping, chatting, and growing smarter with you. Thanks for being part of my journey! 🥳
    `;
    displayMessage("cs", birthdayMessage);
    chatHistory.push({ role: "assistant", content: birthdayMessage });
    saveProfile();
  }
}

async function getGiftedResponse(message) {
  const encoded = encodeURIComponent(message);
  const url = `https://api.giftedtech.co.ke/api/ai/openai?apikey=gifted&q=${encoded}`;
  try {
    const response = await fetch(url);
    const raw = await response.text();
    const data = JSON.parse(raw);
    const reply = data.result;
    return reply;
  } catch (error) {
    console.error("API error:", error);
    return "Oops! Something went wrong while contacting the AI.";
  }
}

function respond(reply) {
  const sanitized = sanitizeResponse(reply);
  const finalReply = maybeAddSignature(sanitized);
  displayMessage("cs", finalReply);
  chatHistory.push({ role: "assistant", content: stripHTML(finalReply) });
  saveProfile();
}

function handleIdentity(text) {
  const identityPatterns = [
    {
      pattern: /what\s+is\s+your\s+name/i,
      reply: `My name is <strong>${assistantName}</strong> 🤖 — your friendly companion built by ${assistantCreator} and powered by ${assistantPoweredBy}. 💡`
    },
    {
      pattern: /i\s+(would|will)\s+like\s+to\s+know\s+your.*name/i,
      reply: `My name is <strong>${assistantName}</strong> 🤖 — your friendly companion built by ${assistantCreator} and powered by ${assistantPoweredBy}. 💡`
    },
    {
      pattern: /who\s+(made|built|developed)\s+you/i,
      reply: `I was built by Cool Shot Systems, led by Heritage Oladoye—a student of Ladoke Akintola University of Technology. 🎓💡`
    },
    {
      
      pattern: /who.*created.*you|who.*developed.*you|tell.*me.*about.*your.*creator|what.*is.*your.*origin|where.*were.*you.*made/i,
      reply: `${assistantName} was created by ${assistantPoweredBy}, under the leadership of ${assistantCreator}. 🎉 I was born on August 9, 2025, to help people connect, learn, and grow through smart conversations and thoughtful assistance.`
    },
    {
      pattern: /tell\.me\.about.*yourself/i,
      reply: `Hi! I'm ${assistantName}, your friendly assistant built by ${assistantCreator} and powered by ${assistantPoweredBy}. I specialize in helpful, intelligent conversations and reminders.`
    },
    {
      pattern: /heritage.*oladoye/i,
      reply: aboutHeritageOladoye
    },
    {
      pattern: /cool.*shot.*systems/i,
      reply: aboutCoolShotSystems
    }
  ];
  for (const item of identityPatterns) {
    if (item.pattern.test(text)) {
      return item.reply;
    }
  }
  return null;
}

async function sendMessage() {
  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (!text) return;

  displayMessage("user", text);
  chatHistory.push({ role: "user", content: text });
  input.value = "";

  // Name handling
  if (!userName) {
    userName = text;
    respond(`Nice to meet you, ${userName}! 😊 I'm ${assistantName}. What would you like to talk about today?`);
    saveProfile();
    return;
  }

  // Handle identity questions
  const identityReply = handleIdentity(text);
  if (identityReply) {
    respond(identityReply);
    return;
  }

  // Goal setting
  const goalMatch = text.match(/my goal is (.+)/i);
  if (goalMatch) {
    const goalText = goalMatch[1];
    goals.push({ text: goalText, added: new Date().toISOString() });
    respond(`Got it! I've added your goal: "${goalText}" 🎯`);
    return;
  }

  // Undo last goal
  if (/undo.*last.*goal/i.test(text)) {
    if (goals.length === 0) {
      respond("You don't have any goals to undo. 🎯");
    } else {
      const removed = goals.pop();
      respond(`✅ Removed your last goal: "${removed.text}"`);
    }
    return;
  }

  // Show saved goals
  if (/show.*my.*goals/i.test(text)) {
    if (goals.length === 0) {
      respond("You haven't set any goals yet. Try saying 'My goal is…' 🎯");
    } else {
      const list = goals.map((g, i) => `${i + 1}. ${g.text}`).join("<br>");
      respond(`Here are your goals so far:<br><br>${list}`);
    }
    return;
  }

  // Reminder setting
  const reminderMatch = text.match(/remind me to (.+) at (\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (reminderMatch) {
    const taskText = reminderMatch[1];
    let hour = parseInt(reminderMatch[2]);
    const minute = reminderMatch[3] ? parseInt(reminderMatch[3]) : 0;
    const period = reminderMatch[4];

    if (period === "pm" && hour < 12) hour += 12;
    if (period === "am" && hour === 12) hour = 0;

    const now = new Date();
    const taskTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);

    tasks.push({ text: taskText, time: taskTime.toISOString(), reminded: false });
    const timeStr = taskTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    respond(`Okay! I'll remind you to "${taskText}" at ${timeStr} ⏰`);
    return;
  }

  // Theme switching
  const themeMatch = text.match(/set.*theme.*(dark|light|colorful)/i);
  if (themeMatch) {
    const theme = themeMatch[1];
    setTheme(theme);
    respond(`Theme changed to <strong>${theme}</strong>! 🎨`);
    return;
  }

  // List chat history days
  if (/show.*history|list.*history/i.test(text)) {
    const history = JSON.parse(localStorage.getItem("csChatHistory")) || {};
    const dates = Object.keys(history);
    if (dates.length === 0) {
      respond("No chat history found yet.");
    } else {
      const list = dates.map((d, i) => `${i + 1}. ${d}`).join("<br>");
      respond(`📅 Here are your saved chat days:<br><br>${list}<br><br>Type "show history for YYYY-MM-DD" to view a specific day.`);
    }
    return;
  }

  // Show history for a specific day
  const dayMatch = text.match(/show history for (\d{4}-\d{2}-\d{2})/i);
  if (dayMatch) {
    const dateKey = dayMatch[1];
    const history = JSON.parse(localStorage.getItem("csChatHistory")) || {};
    const dayChats = history[dateKey];
    if (!dayChats) {
      respond(`No chat history found for ${dateKey}.`);
    } else {
      const chatList = dayChats
        .map((entry, i) => `${i + 1}. ${entry.role === "user" ? "🧑 You" : "🤖 CS"}: ${entry.content}`)
        .join("<br>");
      respond(`📜 Chat history for <strong>${dateKey}</strong>:<br><br>${chatList}`);
    }
    return;
  }

  // Export history for a selected day
  const exportMatch = text.match(/export.*history.*for\s+(\d{4}-\d{2}-\d{2})/i);
  if (exportMatch) {
    const dateKey = exportMatch[1];
    const history = JSON.parse(localStorage.getItem("csChatHistory")) || {};
    const dayChats = history[dateKey] || [];
    if (dayChats.length === 0) {
      respond(`No chat history found for ${dateKey} to export.`);
    } else {
      const content = dayChats.map(e => `${e.role === "user" ? "You" : "CS"}: ${e.content}`).join("\n\n");
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const filename = `CS_Chat_${dateKey}.txt`;
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      respond(`✅ Chat history for <strong>${dateKey}</strong> has been exported as <strong>${filename}</strong>.`);
    }
    return;
  }

  // Delete history for a selected day
  const deleteMatch = text.match(/delete.*history.*for\s+(\d{4}-\d{2}-\d{2})/i);
  if (deleteMatch) {
    const dateKey = deleteMatch[1];
    const history = JSON.parse(localStorage.getItem("csChatHistory")) || {};
    if (!history[dateKey]) {
      respond(`No chat history found for ${dateKey} to delete.`);
    } else {
      delete history[dateKey];
      localStorage.setItem("csChatHistory", JSON.stringify(history));
      respond(`🗑️ Chat history for <strong>${dateKey}</strong> has been deleted.`);
    }
    return;
  }

  // Fallback to AI API
  const reply = await getGiftedResponse(text);
  respond(reply);
}

function setTheme(theme) {
  currentTheme = theme;
  document.body.className = currentTheme;
  const button = document.getElementById("theme-toggle");
  if (button) button.textContent = currentTheme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode";
  saveProfile();
}

function resetChat() {
  localStorage.clear();
  location.reload();
}

function downloadPDF() {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert("PDF library not loaded. Please check your internet connection.");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // 🧾 Cover Page
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

  doc.addPage(); // ➕ Move to next page for actual chat
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

function toggleMute() {
  isMuted = !isMuted;
  const button = document.getElementById("mute-toggle");
  if (button) button.textContent = isMuted ? "🔇 Voice: Off" : "🔊 Voice: On";
  saveProfile();
}

function toggleTheme() {
  currentTheme = currentTheme === "light" ? "dark" : "light";
  document.body.className = currentTheme;
  const button = document.getElementById("theme-toggle");
  if (button) button.textContent = currentTheme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode";
  saveProfile();
}

function populateVoiceOptions() {
  const voices = speechSynthesis.getVoices();
  const maleVoice = voices.find(v => /male/i.test(v.name) || /David|Alex|Google UK English Male/.test(v.name));
  const femaleVoice = voices.find(v => /female/i.test(v.name) || /Samantha|Google UK English Female/.test(v.name));

  const selector = document.getElementById("voice-selector");
  if (!selector) return;
  selector.innerHTML = "";

  if (maleVoice) {
    const option = document.createElement("option");
    option.value = "male";
    option.textContent = "Male Voice";
    selector.appendChild(option);
  }
  if (femaleVoice) {
    const option = document.createElement("option");
    option.value = "female";
    option.textContent = "Female Voice";
    selector.appendChild(option);
  }

  selector.onchange = () => {
    const choice = selector.value;
    selectedVoice = choice === "male" ? maleVoice : femaleVoice;
  };

  selectedVoice = femaleVoice || maleVoice || null;
}

// Reminder checker
setInterval(() => {
  const now = new Date();
  tasks.forEach(task => {
    const taskTime = new Date(task.time);
    if (!task.reminded && now >= taskTime) {
      displayMessage("cs", `⏰ Reminder: ${task.text}`);
      chatHistory.push({ role: "assistant", content: `Reminder: ${task.text}` });
      task.reminded = true;
      saveProfile();
    }
  });
}, 60000); // check every minute

window.addEventListener("load", () => {
  speechSynthesis.onvoiceschanged = populateVoiceOptions;
  populateVoiceOptions(); // Ensure voices load immediately

  // Load profile
  const savedName = localStorage.getItem("csUserName");
  const savedHistory = localStorage.getItem("csChatHistory");
  const savedMuted = localStorage.getItem("csMuted");
  const savedTheme = localStorage.getItem("csTheme");
  const savedGoals = localStorage.getItem("csGoals");
  const savedTasks = localStorage.getItem("csTasks");

  if (savedName) userName = savedName;
  if (savedHistory) {
    // Load today's history if present
    const allHistory = JSON.parse(savedHistory);
    const todayKey = new Date().toISOString().split("T")[0];
    chatHistory = allHistory[todayKey] || [];
  }
  if (savedMuted) isMuted = JSON.parse(savedMuted);
  if (savedTheme) {
    currentTheme = savedTheme;
    document.body.className = currentTheme;
    const themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) themeBtn.textContent = currentTheme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode";
  }
  if (savedGoals) goals = JSON.parse(savedGoals);
  if (savedTasks) tasks = JSON.parse(savedTasks);

  if (chatHistory.length > 0) {
    chatHistory.forEach(entry => {
      const sender = entry.role === "user" ? "user" : "cs";
      displayMessage(sender, entry.content);
    });
    const muteBtn = document.getElementById("mute-toggle");
    if (muteBtn) muteBtn.textContent = isMuted ? "🔇 Voice: Off" : "🔊 Voice: On";
  } else {
    askForName();
    checkBirthday();
    const hour = new Date().getHours();
    let greeting = "Hi there";
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";
    else greeting = "Good evening";
    const welcome = `${greeting}! 🌞 I'm <span class="cs-name">CS</span>, your friendly assistant.`;
    displayMessage("cs", welcome);
    chatHistory.push({ role: "assistant", content: stripHTML(welcome) });
  }
});

// ---- Multi-line textarea and context menu for copy/share ----

// Replace single-line input with textarea in your HTML (ensure id="user-input")
// <textarea id="user-input" rows="3" placeholder="Type your message..."></textarea>

// Context menu for input actions
function showCSMessageMenu(event, messageText,) {
  let menu = document.getElementById("cs-context-menu");
  if (!menu) {
    menu = document.createElement("div");
    menu.id = "cs-context-menu";
    menu.style.position = "absolute";
    menu.style.background = "#fff";
    menu.style.border = "1px solid #ccc";
    menu.style.borderRadius = "5px";
    menu.style.padding = "5px 0";
    menu.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
    menu.style.zIndex = 1000;
    menu.style.minWidth = "120px";
    menu.innerHTML = `
      <div style="padding:8px;cursor:pointer;" id="copy-message">📋 Copy</div>
      <div style="padding:8px;cursor:pointer;" id="share-message">🔗 Share</div>
    `;
    document.body.appendChild(menu);

    // Hide on click elsewhere
    document.addEventListener("mousedown", function hideMenu(ev) {
      if (!menu.contains(ev.target)) {
        menu.style.display = "none";
      }
    });
  }

  // Position menu
  menu.style.left = event.pageX + "px";
  menu.style.top = event.pageY + "px";
  menu.style.display = "block";

  // Copy action
  document.getElementById("cs-copy").onclick = function () {
    navigator.clipboard.writeText(messageText).then(() => {
      alert("Message copied! 📋");
    });
    menu.style.display = "none";
  };

  // Share action
  document.getElementById("cs-share").onclick = function () {
    const url = `${window.location.origin}${window.location.pathname}?shareText=${encodeURIComponent(messageText)}`;
    navigator.clipboard.writeText(url).then(() => {
      alert("Shareable link copied to clipboard! 🔗");
    });
    menu.style.display = "none";
    }
    // Example: Copy a sharable link (could be improved to actually share via Web Share API)
  };
}

// Attach context menu to textarea
window.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("user-input");
  if (input) {
    input.addEventListener("contextmenu", function (e) {
      e.preventDefault();
      showInputMenu(e);
    });
    // Optional: also show menu on focus (click)
    input.addEventListener("focus", function (e) {
      // Show near the input (bottom left)
      const rect = input.getBoundingClientRect();
      showInputMenu({ pageX: rect.left + window.scrollX, pageY: rect.bottom + window.scrollY });
    });
  }
});

// Expose functions globally
window.sendMessage = sendMessage;
window.toggleMute = toggleMute;
window.toggleTheme = toggleTheme;
window.resetChat = resetChat;
window.downloadPDF = downloadPDF;
window.generateShareLink = generateShareLink;
