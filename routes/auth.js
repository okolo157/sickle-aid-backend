const express = require("express");
const router = express.Router();
const { signup, signin } = require("../controllers/authController");
const { emailcheck, updatePassword } = require("../controllers/forgotPwd");
const { updatedUser } = require("../controllers/userInfoController");
const {
  addHospital,
  updateHospital,
  getHospital,
  sendSOSAlert,
} = require("../controllers/hospitalInfoController");

// Sign-up route
router.post("/signup", signup);

// Sign-in route
router.post("/signin", signin);

//google sign-in
// router.post("/google/signin", googleSignin);

//email-check
router.post("/emailcheck", emailcheck);

//update-pwd
router.post("/update-password", updatePassword);

//additional-info
router.put("/users/:userId/profile", updatedUser);

//hospital info
router.post("/save-hospital", addHospital);
router.put("/update-hospital", updateHospital);
router.get("/get-hospital/:userId", getHospital);
router.post("/send-sos-alert/:userId", sendSOSAlert);

module.exports = router;
