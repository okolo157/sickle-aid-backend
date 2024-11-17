const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { OAuth2Client } = require("google-auth-library");

// Sign-up Controller with input validation
exports.signup = [
  // Validate input data
  body("email").isEmail().withMessage("Enter a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter"),
  body("confirmPassword")
    .not()
    .isEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Check if email already exists
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({
          message: "This email is already registered",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12); // Using 12 rounds for better security

      // Create new user
      const newUser = new User({
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
  body("email").isEmail().withMessage("Enter a valid email address"),
  body("password").not().isEmpty().withMessage("Password is required"),

  async (req, res) => {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user)
        return res.status(400).json({ message: "Invalid email or password" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ message: "Invalid email or password" });

      //verify JWT_SECRET exists
      console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.json({
        message: "Sign-in successful",
        token,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
        },
      });
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({ error: error.message });
    }
  },
];


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // Your Google OAuth Client ID


exports.googleSignin = [
  // Step 1: Validate tokenId from the client
  body("tokenId").not().isEmpty().withMessage("Google token is required"),

  async (req, res) => {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tokenId } = req.body; // The token sent from the client

    try {
      // Step 2: Verify the Google token with Google's OAuth2 Client
      const ticket = await client.verifyIdToken({
        idToken: tokenId,
        audience: process.env.GOOGLE_CLIENT_ID, // Ensure the audience matches your client ID
      });

      // Step 3: Get the user's profile information from the token
      const { email, name, picture } = ticket.getPayload();

      // Step 4: Check if the user already exists in the database
      let user = await User.findOne({ email });

      if (!user) {
        // Step 5: If the user doesn't exist, create a new user in the database
        user = new User({
          email,
          name,
          picture,
          createdAt: new Date(),
        });

        await user.save();
      }

      // Step 6: Create a JWT token for the user session
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      // Step 7: Send the response back to the client with the token
      res.json({
        message: "User authenticated successfully",
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          picture: user.picture, // Include picture in the response (optional)
        },
      });
    } catch (error) {
      console.error("Error handling Google sign-in:", error);
      res
        .status(500)
        .json({ message: "Server error. Please try again later." });
    }
  },
];
