const express = require("express");
const router = express.Router();
const {
  signup,
  signin,
  googleSignin,
} = require("../controllers/authController");

// Sign-up route
router.post("/signup", signup);

// Sign-in route
router.post("/signin", signin);

//google sign-in
router.post("/google/signin", googleSignin);

module.exports = router;
