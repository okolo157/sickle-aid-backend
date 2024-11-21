const express = require("express");
const router = express.Router();
const { signup, signin } = require("../controllers/authController");

const { emailcheck, updatePassword } = require("../controllers/forgotPwd");

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

module.exports = router;
