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
  body("gender")
    .optional()
    .isIn(["male", "female", "other"]) // You can adjust gender validation here
    .withMessage("Invalid gender"),

  async (req, res) => {
    try {
      // Extract userId from request (assuming it's sent as a parameter)
      const userId = req.params.userId; // If you're using route params to pass userId
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // Find the user by ID
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Extract data from request body
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

      // Update the user's profile
      user.username = username || user.username;
      user.profileImage = profileImage || user.profileImage;
      user.gender = gender || user.gender;
      user.phoneNumber = phoneNumber || user.phoneNumber;
      user.dateOfBirth = dateOfBirth || user.dateOfBirth;
      user.bloodGroup = bloodGroup || user.bloodGroup;
      user.allergies = allergies || user.allergies;
      user.medication = medication || user.medication;
      user.HMO = HMO || user.HMO;
      user.emergencyContact = emergencyContact || user.emergencyContact;
      user.relation = relation || user.relation;

      // Mark the profile as complete if all fields are filled
      user.isProfileComplete = !!(
        username &&
        profileImage &&
        gender &&
        phoneNumber &&
        dateOfBirth &&
        bloodGroup &&
        allergies &&
        medication &&
        HMO &&
        emergencyContact
      );

      // Save the updated user
      await user.save();

      res.status(200).json({
        message: "Profile updated successfully",
        profile: user,
        username: user.username,
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({
        message: "An error occurred while updating the profile",
      });
    }
  },
];
