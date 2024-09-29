const chatbot = document.getElementById("chatbot");
const input = document.getElementById("input");
let conversationHistory = [
  {
    role: "system",
    content:
      "You are a knowledgeable and friendly AI assistant. Provide clear and concise answers to user queries.",
  },
];

// Function to send a message
async function sendMessage() {
  const message = input.value.trim();
  if (message === "") return;

  // Display user message
  displayMessage("You: " + message, "user-message");

  conversationHistory.push({
    role: "user",
    content: message,
  });

  // Clear input
  input.value = "";

  // Display loading message
  const loadingMessage = displayMessage(
    "AiChatbot is typing...",
    "bot-message"
  );
  loadingMessage.id = "loading";

  try {
    // Send the message to the backend API
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, conversation: conversationHistory }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    // Remove loading message
    const loadingElem = document.getElementById("loading");
    if (loadingElem) {
      chatbot.removeChild(loadingElem);
    }

    // Display bot response
    displayMessage("AiChatbot: " + data.response, "bot-message");

    conversationHistory.push({
      role: "assistant",
      content: data.response,
    });
  } catch (error) {
    console.error("Error:", error);
    // Remove loading message
    const loadingElem = document.getElementById("loading");
    if (loadingElem) {
      chatbot.removeChild(loadingElem);
    }

    displayMessage(
      "AiChatbot: Sorry, something went wrong. Please try again later.",
      "bot-message"
    );
  }
}

function displayMessage(text, className) {
  const messageElem = document.createElement("p");
  messageElem.className = className;
  messageElem.textContent = text;
  chatbot.appendChild(messageElem);
  chatbot.scrollTop = chatbot.scrollHeight;
  return messageElem;
}

input.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    sendMessage();
  }
});
