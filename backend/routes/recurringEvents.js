const express = require("express");
const router = express.Router();
const RecurringEvent = require("../models/RecurringEvent");

// Create a recurring event
router.post("/", async (req, res) => {
  try {
    const recurringEvent = new RecurringEvent(req.body);
    await recurringEvent.save();
    res.status(201).json(recurringEvent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all recurring events
router.get("/", async (req, res) => {
  try {
    const recurringEvents = await RecurringEvent.find();
    res.json(recurringEvents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a recurring event
router.delete("/:id", async (req, res) => {
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
router.patch("/:id/exclude", async (req, res) => {
  try {
    const recurringEvent = await RecurringEvent.findById(req.params.id);
    if (!recurringEvent) {
      return res.status(404).json({ error: "Recurring event not found" });
    }

    const { date } = req.body;
    if (!date) {
      return res.status(400).json({ error: "Date to exclude is required" });
    }

    // The start date of the specific instance to exclude
    const excludeDateStart = new Date(date);

    // Calculate the duration of the event to find the corresponding end date to exclude.
    const dtStart = new Date(recurringEvent.rruleStart.dtstart);
    const dtEnd = new Date(recurringEvent.rruleEnd.dtstart);
    const duration = dtEnd.getTime() - dtStart.getTime();
    const excludeDateEnd = new Date(excludeDateStart.getTime() + duration);

    // Ensure the exdate arrays exist before pushing to them.
    if (!recurringEvent.rruleStart.exdate) {
      recurringEvent.rruleStart.exdate = [];
    }
    if (!recurringEvent.rruleEnd.exdate) {
      recurringEvent.rruleEnd.exdate = [];
    }

    // Add the new exclusion dates
    recurringEvent.rruleStart.exdate.push(excludeDateStart);
    recurringEvent.rruleEnd.exdate.push(excludeDateEnd);

    // Mark the mixed type fields as modified so Mongoose saves the changes.
    recurringEvent.markModified("rruleStart");
    recurringEvent.markModified("rruleEnd");

    await recurringEvent.save();
    res.json(recurringEvent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;