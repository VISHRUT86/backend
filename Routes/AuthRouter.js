const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const ensureAuthenticated = require("../Middlewares/Auth");

const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();

// ✅ Forgot Password Route
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ message: "User not found" });

  // ❌ Old Token Delete First (Avoid Duplicate Tokens)
  await PasswordResetToken.deleteOne({ email });

  // ✅ Generate Secure Token & Expiry
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

  await new PasswordResetToken({ email, token, expiresAt }).save();

  const resetLink = `http://localhost:5000/reset-password/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: "Password Reset",
    text: `Click here to reset your password: ${resetLink}`,
  });

  res.json({ message: "Password reset link sent to your email" });
});

// ✅ Reset Password Route
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  const resetToken = await PasswordResetToken.findOne({ token });
  if (!resetToken) return res.status(400).json({ message: "Invalid token" });

  // ❌ Expired Token Check
  if (resetToken.expiresAt < new Date()) {
    await PasswordResetToken.deleteOne({ token });
    return res.status(400).json({ message: "Token expired" });
  }

  const user = await User.findOne({ email: resetToken.email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  // ✅ Delete Token After Use
  await PasswordResetToken.deleteOne({ token });

  res.json({ message: "Password reset successful" });
});

// ✅ Signup Route (Fixed)
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });

    await newUser.save();

    // ✅ Generate Token After Signup
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({ message: "User registered successfully", token, user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registering user" });
  }
});


// ✅ Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid Email or Password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Email or Password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Get Logged-in User Info
router.get("/me", ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user details" });
  }
});

module.exports = router;
