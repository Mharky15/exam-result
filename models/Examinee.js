// models/Examinee.js
const mongoose = require("mongoose");

const ExamineeSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  suffix: { type: String },
  barangay: { type: String, required: true },
  school: { type: String, required: true },
  scores: { type: String },
  stats: { type: String },
});

module.exports = mongoose.model("Examinee", ExamineeSchema);
