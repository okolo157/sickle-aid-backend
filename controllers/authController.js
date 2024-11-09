const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

// Sign-up Controller with input validation
exports.signup = [
  // Validate input data
  body("email").isEmail().withMessage("Enter a valid email address"),
  body("username")
    .not()
    .isEmpty()
    .withMessage("Username is required")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter"),

  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password } = req.body;

      // Check if email already exists
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({
          message: "This email is already registered",
        });
      }

      // Check if username already exists
      const usernameExists = await User.findOne({
        username: { $regex: new RegExp(`^${username}$`, "i") },
      });
      if (usernameExists) {
        return res.status(400).json({
          message: "This username is already taken",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12); // Using 12 rounds for better security

      // Create new user
      const newUser = new User({
        username,
        email: email.toLowerCase(), // Store email in lowercase
        password: hashedPassword,
        createdAt: new Date(),
      });

      await newUser.save();

      res.status(201).json({
        message: "Account created successfully! You can now sign in.",
        userId: newUser._id,
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({
        message: "An error occurred during registration. Please try again.",
      });
    }
  },
];


// Sign-in Controller with input validation
exports.signin = [
  // Validate input data
  body("email").isEmail().withMessage("Enter a valid email address"),
  body("password").not().isEmpty().withMessage("Password is required"),

  async (req, res) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          message: "No account found with this email",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          message: "Incorrect password",
        });
      }

      // Add user info to the response (optional)
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.json({
        message: "Sign-in successful",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({
        message: "An error occurred during sign in",
      });
    }
  },
];