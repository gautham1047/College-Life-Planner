const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Event = require("./models/Event");
const Group = require("./models/Group");
const RecurringEvent = require("./models/RecurringEvent");

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

// Create a group
app.post("/groups", async (req, res) => {
  try {
    const group = new Group(req.body);
    await group.save();
    res.status(201).json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a group
app.delete("/groups/:id", async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    res.json({ message: "Group deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a group
app.put("/groups/:id", async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    res.json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
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

// Create a recurring event
app.post("/recurring-events", async (req, res) => {
  try {
    const recurringEvent = new RecurringEvent(req.body);
    await recurringEvent.save();
    res.status(201).json(recurringEvent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all recurring events
app.get("/recurring-events", async (req, res) => {
  try {
    const recurringEvents = await RecurringEvent.find();
    res.json(recurringEvents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a recurring event
app.delete("/recurring-events/:id", async (req, res) => {
  try {
    const recurringEvent = await RecurringEvent.findByIdAndDelete(req.params.id);
    if (!recurringEvent) {
      return res.status(404).json({ error: "Recurring event not found" });
    }
    res.json({ message: "Recurring event deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add an exclusion date to a recurring event
app.patch("/recurring-events/:id/exclude", async (req, res) => {
  try {
    const recurringEvent = await RecurringEvent.findById(req.params.id);
    if (!recurringEvent) {
      return res.status(404).json({ error: "Recurring event not found" });
    }

    const { date } = req.body;
    if (!date) {
      return res.status(400).json({ error: "Date to exclude is required" });
    }

    const excludeDateStart = new Date(date);

    // Calculate the duration of the event to find the corresponding end date to exclude
    const dtStart = new Date(recurringEvent.rruleStart.dtstart);
    const dtEnd = new Date(recurringEvent.rruleEnd.dtstart);
    const duration = dtEnd.getTime() - dtStart.getTime();
    const excludeDateEnd = new Date(excludeDateStart.getTime() + duration);

    // Initialize exdate arrays if they don't exist
    recurringEvent.rruleStart.exdate = recurringEvent.rruleStart.exdate || [];
    recurringEvent.rruleEnd.exdate = recurringEvent.rruleEnd.exdate || [];

    // Add the new exclusion dates
    recurringEvent.rruleStart.exdate.push(excludeDateStart);
    recurringEvent.rruleEnd.exdate.push(excludeDateEnd);

    // Mark the mixed type fields as modified so Mongoose saves the changes
    recurringEvent.markModified('rruleStart');
    recurringEvent.markModified('rruleEnd');

    await recurringEvent.save();
    res.json(recurringEvent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
