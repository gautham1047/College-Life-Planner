const mongoose = require("mongoose");

const recurringEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  color: String,
  rruleStart: { type: mongoose.Schema.Types.Mixed, required: true },
  rruleEnd: { type: mongoose.Schema.Types.Mixed, required: true },
});

recurringEventSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => { delete ret._id; },
});

module.exports = mongoose.model("RecurringEvent", recurringEventSchema);