// server.js
const express = require("express");
const axios = require("axios");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const { body, validationResult } = require("express-validator");

dotenv.config();

// Define your system prompt
const SYSTEM_PROMPT =
  "You are a knowledgeable and friendly AI assistant. Provide clear and concise answers to user queries.";

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Chat Completion Endpoint
app.post(
  "/api/chat",
  [
    body("message")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Message must be a non-empty string."),
    body("conversation").optional().isArray(),
  ],
  async (req, res) => {
    // Validate inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userMessage = req.body.message;
    const conversation = req.body.conversation || [];

    try {
      const payload = {
        model: "mixtral-8x7b-32768",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          // Spread the existing conversation history
          ...conversation,
          {
            role: "user",
            content: userMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      };

      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          },
        }
      );

      const botResponse =
        response.data.choices[0]?.message?.content ||
        "I'm sorry, I couldn't process that.";

      res.status(200).json({ response: botResponse });
    } catch (error) {
      console.error(
        "Error communicating with Groq API:",
        error.response ? error.response.data : error.message
      );
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Fallback Route to Serve `index.html` for Any Unmatched Routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
