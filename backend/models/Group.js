const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, required: true },
});

// Use a transform to remove the underscore from the id property
groupSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;