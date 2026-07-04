const express = require("express");

const router = express.Router();

const { registerUser,loginUser,googleAuth} = require("../controllers/authController");

router.post("/signup", registerUser);
router.post("/login",loginUser);
router.post("/google",googleAuth);

module.exports = router;
