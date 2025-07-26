const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.isAdminLoggedIn = (req, res, next) => {
    try {
        // Get token from cookies
        const token = req.cookies.token;

        // If no token, redirect to login
        if (!token) {
            return res.redirect("/api/admin/login");
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // Check if user is admin
        if (decoded.role !== "admin") {
            return res.status(403).render("Login", {
                error: "Access denied. Admin only.",
                success: null
            });
        }

        // Add admin info to request
        req.admin = decoded;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.clearCookie("token");
        return res.redirect("/api/admin/login");
    }
};