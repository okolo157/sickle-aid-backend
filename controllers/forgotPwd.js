const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { OAuth2Client } = require("google-auth-library");

exports.emailcheck = [
  body("email").isEmail().withMessage("Enter a valid email address"),

  async (req, res) => {
    try {
      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined in environment variables");
        return res.status(500).json({ message: "Server configuration error" });
      }

      // Validate request input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;

      // Normalize email to lowercase for consistent comparison
      const normalizedEmail = email.toLowerCase();

      // Check if email already exists in the database
      const emailExists = await User.findOne({ email: normalizedEmail });
      if (emailExists) {
        return res.status(200).json({
          message: "The email exists",
          email: normalizedEmail,
        });
      }
      return res.status(404).json({
        message: "No account found with this email address",
        email: normalizedEmail,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "An unexpected error occurred" });
    }
  },
];

exports.updatePassword = [
  body("email").isEmail().withMessage("Enter a valid email address"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  async (req, res) => {
    try {
      // Validate request input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, newPassword } = req.body;
      const normalizedEmail = email.toLowerCase();

      // Check if email exists in the database
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return res
          .status(404)
          .json({ message: "No account found with this email address" });
      }

      // Update the password
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "An unexpected error occurred" });
    }
  },
];
