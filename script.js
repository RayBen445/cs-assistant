let chatHistory = [];
let userName = null;
let isMuted = false;
let selectedVoice = null;

function speak(text) {
  if (isMuted || !selectedVoice) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = selectedVoice;
  utterance.lang = "en-US";
  utterance.rate = 1;
  speechSynthesis.speak(utterance);
}

function displayMessage(sender, text) {
  const chatBox = document.getElementById("chat-box");
  const message = document.createElement("div");
  message.className = sender === "user" ? "user-message" : "cs-message";
  message.innerHTML = `<p>${text}</p>`;
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (sender === "cs") {
    speak(stripHTML(text));
  }
}

function stripHTML(html) {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || "";
}

function askForName() {
  const question = "Before we begin, may I know your name? 😊";
  displayMessage("cs", question);
  chatHistory.push({ role: "assistant", content: question });
}

function followUpPrompt() {
  const prompts = [
    "Would you like to know more?",
    "Should I explain that further?",
    "Want to dive deeper into that?",
    "Is there anything else you're curious about?"
  ];
  return prompts[Math.floor(Math.random() * prompts.length)];
}

async function getGiftedResponse(message) {
  const encoded = encodeURIComponent(message);
  const url = `https://api.giftedtech.co.ke/api/ai/openai?apikey=gifted&q=${encoded}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.result || "Sorry, I couldn't understand that.";
  } catch (error) {
    console.error("API error:", error);
    return "Oops! Something went wrong while contacting the AI.";
  }
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
    const reply = `Nice to meet you, ${userName}! 😊 What would you like to talk about today?`;
    displayMessage("cs", reply);
    chatHistory.push({ role: "assistant", content: reply });
    return;
  }

  if (/who.*(made|built|developed).*you/i.test(text)) {
    const reply = "I was built by Cool Shot Systems, led by Heritage Oladoye—a student of Ladoke Akintola University of Technology. 🎓💡";
    displayMessage("cs", reply);
    chatHistory.push({ role: "assistant", content: reply });

    const followUp = followUpPrompt();
    displayMessage("cs", followUp);
    chatHistory.push({ role: "assistant", content: followUp });
    return;
  }

  const reply = await getGiftedResponse(text);
  displayMessage("cs", reply);
  chatHistory.push({ role: "assistant", content: reply });

  const followUp = followUpPrompt();
  displayMessage("cs", followUp);
  chatHistory.push({ role: "assistant", content: followUp });
}

function downloadChat() {
  let content = "CS Assistant Chat History\n\n";
  chatHistory.forEach(entry => {
    const role = entry.role === "user" ? userName || "User" : "CS";
    content += `${role}: ${entry.content}\n`;
  });

  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "cs_chat_history.txt";
  link.click();
}

function downloadPDF() {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert("PDF library not loaded. Please check your internet connection.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10;

  doc.setFont("helvetica");
  doc.setFontSize(12);
  doc.text("CS Assistant Chat History", 10, y);
  y += 10;

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

  doc.save("cs_chat_history.pdf");
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

  // Default to female if available
  selectedVoice = femaleVoice || maleVoice || null;
}

window.addEventListener("load", () => {
  speechSynthesis.onvoiceschanged = populateVoiceOptions;

  const params = new URLSearchParams(window.location.search);
  const encodedChat = params.get("chat");

  if (encodedChat) {
    try {
      const decoded = decodeURIComponent(escape(atob(encodedChat)));
      const data = JSON.parse(decoded);
      userName = data.userName;
      chatHistory = data.chatHistory;

      chatHistory.forEach(entry => {
        const sender = entry.role === "user" ? "user" : "cs";
        displayMessage(sender, entry.content);
      });
    } catch (e) {
      console.error("Invalid chat data");
    }
    return;
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

// ✅ Expose functions to global scope
window.sendMessage = sendMessage;
window.downloadChat = downloadChat;
window.downloadPDF = downloadPDF;
window.generateShareLink = generateShareLink;
window.toggleMute = toggleMute;
