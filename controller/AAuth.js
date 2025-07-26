const Admin = require("../model/Admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');
require("dotenv").config();

exports.adminSignup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phone } = req.body;

    // Validate password match
    if (password !== confirmPassword) {
      return res.render("Signup", {
        error: "Passwords do not match",
        success: null
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.render("Signup", {
        error: "Password must be at least 6 characters long",
        success: null
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.render("Signup", {
        error: "Email already registered",
        success: null
      });
    }

    // Create hashed password and verification token
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create new admin
    const admin = new Admin({
      name,
      email,
      phone,
      password: hashedPassword,
      verificationToken,
      isVerified: false
    });

    await admin.save();

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Delete the created admin if email fails
      await Admin.findByIdAndDelete(admin._id);
      return res.render("Signup", {
        error: "Error sending verification email. Please try again.",
        success: null
      });
    }

    res.render("Login", {
      success: "Registration successful! Please check your email to verify your account.",
      error: null
    });
  } catch (err) {
    console.error("Admin signup error:", err);
    res.render("Signup", {
      error: err.message || "Error registering admin. Please try again.",
      success: null
    });
  }
};


exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const admin = await Admin.findOne({ verificationToken: token });

    if (!admin) {
      return res.render("Login", {
        error: "Invalid verification token",
        success: null
      });
    }

    admin.isVerified = true;
    admin.verificationToken = undefined;
    await admin.save();

    res.render("Login", {
      success: "Email verified successfully. Please login.",
      error: null
    });
  } catch (err) {
    console.error("Email verification error:", err);
    res.render("Login", {
      error: "Email verification failed",
      success: null
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.render("ForgotPassword", {
        error: "No account found with this email",
        success: null
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    admin.resetPasswordToken = resetToken;
    admin.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await admin.save();

    await sendPasswordResetEmail(email, resetToken);

    res.render("ForgotPassword", {
      success: "Password reset link sent to your email",
      error: null
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.render("ForgotPassword", {
      error: "Error sending password reset email",
      success: null
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const admin = await Admin.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!admin) {
      return res.render("ResetPassword", {
        error: "Password reset token is invalid or expired",
        success: null
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    admin.password = hashedPassword;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    res.render("Login", {
      success: "Password reset successful. Please login with your new password.",
      error: null
    });
  } catch (err) {
    console.error("Reset password error:", err);
    res.render("ResetPassword", {
      error: "Error resetting password",
      success: null
    });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render("Login", {
        error: "Email and password are required",
        success: null
      });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.render("Login", {
        error: "Admin not found. Please sign up first.",
        success: null
      });
    }

    if (!admin.isVerified) {
      return res.render("Login", {
        error: "Please verify your email first",
        success: null
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.render("Login", {
        error: "Incorrect password",
        success: null
      });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: "admin" },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
    });

    res.redirect("/api/admin");
  } catch (err) {
    console.error("Admin login error:", err);
    res.render("Login", {
      error: "Login failed due to server error",
      success: null
    });
  }
};