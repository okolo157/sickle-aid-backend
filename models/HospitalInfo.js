const mongoose = require("mongoose");

const hospitalInfoSchema = new mongoose.Schema({
  hospitalName: {
    type: String,
    required: true,
  },
  hospitalAddress: {
    type: String,
    required: true,
  },
  patientId: {
    type: String,
    required: false, // Optional field
  },
  hospitalNumber: {
    type: String,
    required: false, // Optional field
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true, // Each hospital info is tied to a specific user
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const HospitalInfo = mongoose.model("HospitalInfo", hospitalInfoSchema);

module.exports = HospitalInfo;
