const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Event = require("./models/Event");
const Group = require("./models/Group");

const app = express();
app.use(express.json());
app.use(cors());

async function seedGroups() {
  try {
    const count = await Group.countDocuments();
    if (count === 0) {
      console.log("No groups found, seeding initial groups...");
      const initialGroups = [
        { name: "Personal", color: "bg-blue-500" },
        { name: "Work", color: "bg-red-500" },
        { name: "Study", color: "bg-green-500" },
      ];
      await Group.insertMany(initialGroups);
      console.log("Groups seeded successfully.");
    }
  } catch (error) {
    console.error("Error seeding groups:", error);
  }
}

// connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => { console.log("Connected to MongoDB"); seedGroups(); })
  .catch(err => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Events backend running!");
});

// Create an event
app.post("/events", async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all events
app.get("/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all groups
app.get("/groups", async (req, res) => {
  try {
    const groups = await Group.find();
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete an event
app.delete("/events/:id", async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }
        res.json({ message: "Event deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
