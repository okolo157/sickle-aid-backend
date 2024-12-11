const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Email must be unique
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: false, // This can be added during the profile update
  },
  phoneNumber: {
    type: String,
    required: false,
  },
  dateOfBirth: {
    type: Date,
    required: false,
  },
  bloodGroup: {
    type: String,
    required: false,
  },
  allergies: {
    type: String,
    required: false,
  },
  medication: {
    type: String,
    required: false,
  },
  HMO: {
    type: String,
    required: false,
  },
  emergencyContact: {
    type: String,
    required: false,
  },
  profileImage: {
    type: String,
    required: false,
  },
  gender: {
    type: String,
    // enum: ["male", "female", "other"], // For gender
    required: false,
  },
  isProfileComplete: {
    type: Boolean,
    default: false,
  },
  relation: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
