const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const Group = require("./models/Group");

const eventRoutes = require("./routes/events");
const groupRoutes = require("./routes/groups");
const recurringEventRoutes = require("./routes/recurringEvents");
const aiRoutes = require("./routes/ai");

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

// Use routes
app.use("/events", eventRoutes);
app.use("/groups", groupRoutes);
app.use("/recurring-events", recurringEventRoutes);
app.use("/ai", aiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
