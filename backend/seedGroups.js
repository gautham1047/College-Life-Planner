// This script is for resetting the 'groups' collection in your database.
// It will delete all existing groups and then add the default ones.
const mongoose = require("mongoose");
const Group = require("./models/Group");
require("dotenv").config();

const seedDatabase = async () => {
  try {
    // 1. Connect to the database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB to seed groups.");

    // 2. Clear all existing groups to prevent duplicates
    await Group.deleteMany({});
    console.log("Removed existing groups.");

    // 3. Insert the default groups
    const initialGroups = [
      { name: "Personal", color: "bg-blue-500" },
      { name: "Work", color: "bg-red-500" },
      { name: "Study", color: "bg-green-500" },
    ];
    await Group.insertMany(initialGroups);
    console.log("Default groups have been seeded.");

  } catch (error) {
    console.error("Error seeding the database:", error);
  } finally {
    // 4. Disconnect from the database
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
};

// Run the seeding function
seedDatabase();