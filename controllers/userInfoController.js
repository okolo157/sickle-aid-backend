const User = require("../models/User");
const { body, validationResult } = require("express-validator");

exports.updatedUser = [
  // Validate the input fields
  body("username").notEmpty().withMessage("Username is required"),
  body("profileImage")
    .optional()
    .isURL()
    .withMessage("Invalid profile image URL"),
  body("phoneNumber")
    .optional()
    .isMobilePhone()
    .withMessage("Invalid phone number"),
  body("dateOfBirth").optional().isDate().withMessage("Invalid date of birth"),
  body("bloodGroup").optional().isString().withMessage("Invalid blood group"),
  body("allergies")
    .optional()
    .isString()
    .withMessage("Invalid allergies information"),
  body("medication")
    .optional()
    .isString()
    .withMessage("Invalid medication information"),
  body("HMO").optional().isString().withMessage("Invalid HMO information"),
  body("emergencyContact")
    .optional()
    .isMobilePhone()
    .withMessage("Invalid emergency contact"),
  body("relation")
    .optional()
    .isString()
    .withMessage("Invalid relation information"),

  async (req, res) => {
    try {
      // Validate request input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId } = req.params; // Get userId from the URL parameters
      const {
        username,
        profileImage,
        gender,
        phoneNumber,
        dateOfBirth,
        bloodGroup,
        allergies,
        medication,
        HMO,
        emergencyContact,
        relation,
      } = req.body;

      // Find the user by their MongoDB _id (userId in this case)
      const updatedUser = await User.findByIdAndUpdate(
        userId, // Use MongoDB-generated _id from URL
        {
          username,
          profileImage,
          gender,
          phoneNumber,
          dateOfBirth,
          bloodGroup,
          allergies,
          medication,
          HMO,
          emergencyContact,
          relation,
          isProfileComplete: true, // Mark the profile as complete
        },
        { new: true } // Return the updated document
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({
        message: "Profile updated successfully",
        profile: updatedUser, // Return the updated user profile
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  },
];
  