const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the User model
  username: { type: String, required: true },
  profileImage: { type: String },
  gender: { type: String, enum: ["male", "female", "other"] },
  phoneNumber: { type: String },
  dateOfBirth: { type: Date },
  bloodGroup: { type: String },
  allergies: { type: String },
  medication: { type: String },
  HMO: { type: String },
  emergencyContact: { type: String },
  relation: { type: String },
  isProfileComplete: { type: Boolean, default: false },
});

module.exports = mongoose.model("UserProfile", userProfileSchema);
