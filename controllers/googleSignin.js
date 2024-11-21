const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

const User = require("../models/User");

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
