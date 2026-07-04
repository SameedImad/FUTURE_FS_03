const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin@123";

const createToken = (id, role) =>
  jwt.sign(
    {
      id,
      role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

const buildAuthResponse = (res, user, message = "Success") => {
  const token = createToken(user._id, user.role);

  return res.status(200).json({
    success: true,
    message,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      provider: user.provider,
    },
  });
};

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      provider: "local",
    });

    const token = createToken(newUser._id, newUser.role);

    return res.status(201).json({
      success: true,
      message: "Account Created Successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        provider: newUser.provider,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    if (normalizedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = createToken("admin", "admin");

      return res.status(200).json({
        success: true,
        message: "Login Successful",
        token,
        user: {
          id: "admin",
          name: "Admin",
          email: ADMIN_EMAIL,
          role: "admin",
          provider: "local",
        },
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid Password",
      });
    }

    const token = createToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        provider: user.provider,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { name, email, mode } = req.body || {};
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (mode === "login") {
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found kindly sign up",
        });
      }

      return buildAuthResponse(res, user, "Google Login Successful");
    }

    if (!user) {
      const hashedPassword = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);

      const newUser = await User.create({
        name: name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        password: hashedPassword,
        provider: "google",
      });

      return buildAuthResponse(res, newUser, "Google Signup Successful");
    }

    if (user.provider !== "google") {
      return res.status(400).json({
        success: false,
        message: "This email is already registered with a password. Please log in with email and password.",
      });
    }

    return buildAuthResponse(res, user, "Google Login Successful");
  } catch (error) {
    console.log("Google Auth Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleAuth
};
