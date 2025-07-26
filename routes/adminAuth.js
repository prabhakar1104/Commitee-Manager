const express = require("express");
const mongoose = require("mongoose");
const Committee = require("../model/comettii");
const { isAdminLoggedIn } = require("../middleware/auth");
const{getPublicCommittee} = require("../controller/comeetyOp");
const router = express.Router();
const { 
    adminSignup, 
    adminLogin, 
    verifyEmail, 
    forgotPassword, 
    resetPassword 
} = require("../controller/AAuth");
const {
    createCommittee,
    adminPage,
    adminCommittee
} = require("../controller/admin");
const { ConnectionStates } = require("mongoose");

// Auth routes
router.post("/signup", adminSignup);
router.get("/signup", (req, res) => {
    res.render("Signup", { error: null, success: null });
});

router.get("/login", (req, res) => {
    res.render("Login", { error: null, success: null });
});
router.post("/login", adminLogin);

// Add this to your existing routes
router.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/api/admin/login");
});

// Email verification and password reset routes
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.get("/reset-password/:token", (req, res) => {
    res.render("ResetPassword", { token: req.params.token, error: null, success: null });
});
router.post("/reset-password/:token", resetPassword);

// Committee management routes
router.get("/adminPage/createComety",isAdminLoggedIn, (req, res) => {
    const { id } = req.query;
    res.render("CreateComety", { adminId: id });
});
router.post("/adminPage/createComety",isAdminLoggedIn, createCommittee);
router.get("/adminPage/:id",isAdminLoggedIn, adminPage);
router.get("/committee/:id/admin",isAdminLoggedIn, adminCommittee);

//forgot password rout
router.get("/forgot-password", (req, res) => {
    res.render("ForgotPassword", { error: null, success: null });
});


// Public route to view all committees
router.get("/public/committees", async (req, res) => {
    try {
        const committees = await Committee.find()
            .populate('adminId', 'name') // Only populate admin name
            .select('-adminId._id -adminId.email -adminId.password'); // Exclude sensitive info

        res.render("PublicView", {
            committees: committees
        });
    } catch (error) {
        console.error("Error fetching public committees:", error);
        res.status(500).render("PublicView", {
            committees: [],
            error: "Unable to fetch committees"
        });
    }
});

// ...existing imports...

// Update the adminPage route to handle POST request
router.post("/adminPage", isAdminLoggedIn, async (req, res) => {
    try {
        const adminId = req.body.adminId;
        
        if (!mongoose.Types.ObjectId.isValid(adminId)) {
            return res.status(400).render("AdminDashboard", {
                committees: [],
                adminId: null,
                error: "Invalid admin ID"
            });
        }

        const data = await Committee.find({ adminId }).populate('adminId');

        res.render("AdminDashboard", {
            committees: data,
            adminId: adminId
        });

    } catch (err) {
        console.error("Error fetching adminPage", err);
        res.status(500).render("AdminDashboard", {
            committees: [],
            adminId: null,
            error: "Server error"
        });
    }
});

// Public committee view route
router.get("/public/committee/:id", getPublicCommittee);

module.exports = router;