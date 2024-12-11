const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true },
    profileImage: { type: String },
    gender: { type: String },
    phoneNumber: { type: String },
    dateOfBirth: { type: Date },
    bloodGroup: { type: String },
    allergies: { type: String },
    medication: { type: String },
    HMO: { type: String },
    emergencyContact: { type: String },
    relation: { type: String },
    isProfileComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
