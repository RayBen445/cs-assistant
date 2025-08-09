function sendMessage() {
  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (!text) return;

  const messages = document.getElementById("messages");

  const userMsg = document.createElement("div");
  userMsg.className = "message user";
  userMsg.textContent = text;
  messages.appendChild(userMsg);

  const csMsg = document.createElement("div");
  csMsg.className = "message cs";
  csMsg.textContent = getCSResponse(text);
  messages.appendChild(csMsg);

  input.value = "";
  messages.scrollTop = messages.scrollHeight;
}

function getCSResponse(input) {
  return "Hey there! I'm CS 😊 Let's talk.";
}
