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
Heritage Oladoye is a visionary software developer, creative technologist, and founder of Cool Shot Systems. He builds intelligent digital experiences that blend technical precision with human-centered design. From mobile apps to AI assistants, Heritage creates tools that connect, inspire, and solve real problems.
`;

const aboutCoolShotSystems = `
Cool Shot Systems is a forward-thinking software company founded by Heritage Oladoye. It specializes in crafting intelligent, user-centric digital solutions — from mobile platforms to AI-powered assistants. With a focus on creativity, empathy, and excellence, Cool Shot Systems is redefining what smart software feels like.
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
  // Optional: Save chat history or user profile to localStorage
}

function askForName() {
  const question = "Before we begin, may I know your name? 😊";
  displayMessage("cs", question);
  chatHistory.push({ role: "assistant", content: question });
}

function checkBirthday() {
  const today = new Date();
  if (today.getDate() === csBirthday.day && today.getMonth() + 1 === csBirthday.month) {
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
    console.log("Raw API response:", raw);

    const data = JSON.parse(raw);
    console.log("Parsed response:", data);

    const reply = data.reply || data.message || data.text || JSON.stringify(data);
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
}

function handleIdentity(text) {
  const identityPatterns = [
    { pattern: /what\s+is\s+your\s+name/i, reply: `My name is <strong>${assistantName}</strong> 🤖 — your friendly companion built by ${assistantCreator} and powered by ${assistantPoweredBy}. 💡` },
    { pattern: /i\s+(would|will)\s+like\s+to\s+know\s+your.*name/i, reply: `My name is <strong>${assistantName}</strong> 🤖 — your friendly companion built by ${assistantCreator} and powered by ${assistantPoweredBy}. 💡` },
    { pattern: /who\s+(made|built|developed)\s+you/i, reply: `I was built by Cool Shot Systems, led by Heritage Oladoye—a student of Ladoke Akintola University of Technology. 🎓💡` },
    { pattern: /who.*created.*you|who.*developed.*you|tell.*me.*about.*your.*creator|what.*is.*your.*origin|where.*were.*you.*made/i,
      reply: `${assistantName} was created by ${assistantPoweredBy}, under the leadership of ${assistantCreator}. 🎉 I was born on August 9, 2025, to help people connect, learn, and grow through smart conversations.` },
    { pattern: /tell.*me.*about.*yourself/i, reply: `Hi! I'm ${assistantName}, your friendly assistant built by ${assistantCreator} and powered by ${assistantPoweredBy}. I specialize in helpful, intelligent, and engaging conversations. Whether you're solving problems or just chatting, I'm here to make your day brighter. 🌟` },
    { pattern: /heritage.*oladoye/i, reply: aboutHeritageOladoye },
    { pattern: /cool.*shot.*systems/i, reply: aboutCoolShotSystems }
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

  if (!userName) {
    userName = text;
    respond(`Nice to meet you, ${userName}! 😊 I'm ${assistantName}. What would you like to talk about today?`);
  }

  const identityReply = handleIdentity(text);
  if (identityReply) {
   respond(identityReply);
  }

  const goalMatch = text.match(/my goal is (.+)/i);
  if (goalMatch) {
    const goalText = goalMatch[1];
    goals.push({ text: goalText, added: new Date().toISOString() });
    respond(`Got it! I've added your goal: "${goalText}" 🎯`);
  
}
  // 🔄 Undo last goal
  if (/undo.*last.*goal/i.test(text)) {
    if (goals.length === 0) {
      return respond("You don't have any goals to undo. 🎯");
    }
    const removed = goals.pop();
    respond(`✅ Removed your last goal: "${removed.text}"`);
  }
  saveProfile();
   return;
  // 📋 Show saved goals
  if (/show.*my.*goals/i.test(text)) {
    if (goals.length === 0) {
      return respond("You haven't set any goals yet. Try saying 'My goal is…' 🎯");
    }
    const list = goals.map((g, i) => `${i + 1}. ${g.text}`).join("<br>");
    return respond(`Here are your goals so far:<br><br>${list}`);
  }

  // ⏰ Reminder setting
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
    return respond(`Okay! I'll remind you to "${taskText}" at ${timeStr} ⏰`);
  }

  // 🎨 Theme switching
  const themeMatch = text.match(/set.*theme.*(dark|light|colorful)/i);
  if (themeMatch) {
    const theme = themeMatch[1];
    setTheme(theme);
    return respond(`Theme changed to <strong>${theme}</strong>! 🎨`);
  }

  // 📅 List chat history days
  if (/show.*history|list.*history/i.test(text)) {
    const history = JSON.parse(localStorage.getItem("csChatHistory")) || {};
    const dates = Object.keys(history);
    if (dates.length === 0) {
      return respond("No chat history found yet.");
    }
    const list = dates.map((d, i) => `${i + 1}. ${d}`).join("<br>");
    return respond(`📅 Here are your saved chat days:<br><br>${list}<br><br>Type "show history for YYYY-MM-DD" to view a specific day.`);
  }

  // 📜 Show history for a specific day
  const dayMatch = text.match(/show history for (\d{4}-\d{2}-\d{2})/i);
  if (dayMatch) {
    const dateKey = dayMatch[1];
    const history = JSON.parse(localStorage.getItem("csChatHistory")) || {};
    const dayChats = history[dateKey];
    if (!dayChats) {
      return respond(`No chat history found for ${dateKey}.`);
    }
    const chatList = dayChats
      .map((entry, i) => `${i + 1}. ${entry.role === "user" ? "🧑 You" : "🤖 CS"}: ${entry.content}`)
      .join("<br>");
    return respond(`📜 Chat history for <strong>${dateKey}</strong>:<br><br>${chatList}`);
  }

  // 📤 Export history for a selected day
  const exportMatch = text.match(/export.*history.*for\s+(\d{4}-\d{2}-\d{2})/i);
  if (exportMatch) {
    const dateKey = exportMatch[1];
    const history = JSON.parse(localStorage.getItem("csChatHistory")) || {};
    const dayChats = history[dateKey] || [];
    if (dayChats.length === 0) {
      return respond(`No chat history found for ${dateKey} to export.`);
    }
    const content = dayChats
      .map(e => `${e.role === "user" ? "You" : "CS"}: ${e.content}`)
      .join("\n\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const filename = `CS_Chat_${dateKey}.txt`;
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    return respond(`✅ Chat history for <strong>${dateKey}</strong> has been exported as <strong>${filename}</strong>.`);
  }

  // 🗑️ Delete history for a selected day
  const deleteMatch = text.match(/delete.*history.*for\s+(\d{4}-\d{2}-\d{2})/i);
  if (deleteMatch) {
    const dateKey = deleteMatch[1];
    const history = JSON.parse(localStorage.getItem("csChatHistory")) || {};
    if (!history[dateKey]) {
      return respond(`No chat history found for ${dateKey} to delete.`);
    }
    delete history[dateKey];
    localStorage.setItem("csChatHistory", JSON.stringify(history));
    return respond(`🗑️ Chat history for <strong>${dateKey}</strong> has been deleted.`);
  }

  // 🌐 Fallback to external API
    getGiftedResponse(text).then(respond).catch(error => {
  console.error("API error:", error);
  respond("Oops! Something went wrong while contacting the AI.");
});

  // 🧠 Helper to respond and save
  function respond(reply) {
    const sanitized = sanitizeResponse(reply);
    const finalReply = maybeAddSignature(sanitized);
    displayMessage("cs", finalReply);
    chatHistory.push({ role: "assistant", content: stripHTML(finalReply) });

    // 💾 Save chat history by date
    const todayKey = new Date().toISOString().split("T")[0];
    const allHistory = JSON.parse(localStorage.getItem("csChatHistory")) || {};
    allHistory[todayKey] = chatHistory;
    localStorage.setItem("csChatHistory", JSON.stringify(allHistory));
  
  }
  
  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "cschathistory.txt";
  link.click();
}

function downloadPDF() {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert("PDF library not loaded. Please check your internet connection.");
    return;
  }

 async function sendMessage() {
  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (!text) return;

  displayMessage("user", text);
  chatHistory.push({ role: "user", content: text });
  input.value = "";

  if (/cool.*shot.*systems/i.test(text)) {
    displayMessage("cs", aboutCoolShotSystems);
    chatHistory.push({ role: "assistant", content: aboutCoolShotSystems });
    saveProfile();
    return;
  }


function saveProfile() {
  localStorage.setItem("csUserName", userName);
  localStorage.setItem("csChatHistory", JSON.stringify(chatHistory));
  localStorage.setItem("csMuted", JSON.stringify(isMuted));
  localStorage.setItem("csTheme", currentTheme);
  localStorage.setItem("csGoals", JSON.stringify(goals));
  localStorage.setItem("csTasks", JSON.stringify(tasks));
}

function resetChat() {
  localStorage.clear();
  location.reload();
}
}

function exportChatHistoryAsPDF() {
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

  // 💬 Chat History
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
  button.textContent = isMuted ? "🔇 Voice: Off" : "🔊 Voice: On";
  saveProfile();
}

function toggleTheme() {
  currentTheme = currentTheme === "light" ? "dark" : "light";
  document.body.className = currentTheme;
  const button = document.getElementById("theme-toggle");
  button.textContent = currentTheme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode";
  saveProfile();
}

function populateVoiceOptions() {
  const voices = speechSynthesis.getVoices();
  const maleVoice = voices.find(v => /male/i.test(v.name) || /David|Alex|Google UK English Male/.test(v.name));
  const femaleVoice = voices.find(v => /female/i.test(v.name) || /Samantha|Google UK English Female/.test(v.name));

  const selector = document.getElementById("voice-selector");
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

  async function sendMessage() {
  const text = inputElement.value.trim();
  const reply = await getGiftedResponse(text);
  displayMessage("cs", reply);
  chatHistory.push({ role: "assistant", content: reply });
  saveProfile();
}

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
  if (savedHistory) chatHistory = JSON.parse(savedHistory);
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
  
  checkBirthday(); // 🎂 Birthday check on load
}

const hour = new Date().getHours();
  let greeting = "Hi there";

  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";
  else greeting = "Good evening";

  const welcome = `${greeting}! 🌞 I'm <span class="cs-name">CS</span>, your friendly assistant.`;
  displayMessage("cs", welcome);
  chatHistory.push({ role: "assistant", content: stripHTML(welcome) });

  askForName();
});

// Expose functions globally
window.sendMessage = sendMessage;
window.toggleMute = toggleMute;
window.toggleTheme = toggleTheme;
window.resetChat = resetChat;
window.downloadChat = downloadChat;
window.downloadPDF = downloadPDF;
window.generateShareLink = generateShareLink;
});
