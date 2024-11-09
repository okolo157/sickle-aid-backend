const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/auth");

// A simple test route to check if the middleware is working
router.get("/test", authenticate, (req, res) => {
  // If the user is authenticated, this response will be sent
  res.json({ message: "You are authenticated!", user: req.user });
});

module.exports = router;
