const express = require("express");
const router = express.Router();
const { generateResponse } = require("../chat.js");

// Placeholder for AI chat functionality
router.post("/chat", async (req, res) => {
  try {
    const { message, history, mode } = req.body;

    // Basic validation
    if (!message || !history) {
      return res.status(400).json({ error: "Message and history are required." });
    }

    const response = await generateResponse(message, history, mode);
    res.json(response);
  } catch (error) {
    console.error("Error in chat API:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;