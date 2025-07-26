const express = require("express");
const route = express.Router();
const Admin = require("../model/Admin");
const Committee = require("../model/comettii");
const CommitteeHistory = require("../model/CommitteeHistory");
const { isAdminLoggedIn } = require("../middleware/auth"); 
const CommitteeMember = require("../model/user_record"); 
const {add,show,dashBoard,home} = require("../controller/comeetyOp");
const {userPage} = require("../controller/UserMain");
const mongoose = require("mongoose");

route.get("/",home);


route.post("/dashboard", async(req,res)=>{ // Remove isAdminLoggedIn middleware
    try {
        const adminId = req.body.adminId;

        if (!mongoose.Types.ObjectId.isValid(adminId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid admin ID format"
            });
        }

        const committees = await Committee.find({adminId})
            .populate('adminId', 'name') // Only populate necessary fields
            .select('-adminId.email -adminId.password'); // Exclude sensitive info
        
        res.render("Dashboard", { 
            committees: committees,
            adminId: adminId
        });
    } catch(err) {
        console.error("Error fetching dashboard:", err);
        res.status(500).render("Dashboard", { 
            committees: [],
            adminId: null,
            error: "Server error" 
        });
    }
});

// Add a GET route for direct link access
route.get("/dashboard/:adminId", async(req,res)=>{
    try {
        const adminId = req.params.adminId;

        if (!mongoose.Types.ObjectId.isValid(adminId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid admin ID format"
            });
        }

        const committees = await Committee.find({adminId})
            .populate('adminId', 'name')
            .select('-adminId.email -adminId.password');
        
        res.render("Dashboard", { 
            committees: committees,
            adminId: adminId
        });
    } catch(err) {
        console.error("Error fetching dashboard:", err);
        res.status(500).render("Dashboard", { 
            committees: [],
            adminId: null,
            error: "Server error" 
        });
    }
});

route.post("/add",add);

route.get("/show/:id",show);


// Change GET to POST
route.post("/committee", userPage);


// View committee history
// Update the history route
route.get("/committees/:id/history", async (req, res) => {
    try {
        const committeeId = req.params.id;
        
        if (!committeeId) {
            return res.status(400).render("CommitteeHistory", {
                committee: null,
                history: [],
                error: "Invalid committee ID"
            });
        }

        const committee = await Committee.findById(committeeId)
            .populate('adminId', 'name');
            
        if (!committee) {
            return res.status(404).render("CommitteeHistory", {
                committee: null,
                history: [],
                error: "Committee not found"
            });
        }

        const history = await CommitteeHistory.find({ committeeId })
            .populate('changedBy', 'name')
            .sort('-date');

        // console.log('Found history records:', history.length);

        res.render("CommitteeHistory", {
            committee,
            history,
            error: null
        });
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).render("CommitteeHistory", {
            committee: null,
            history: [],
            error: "Error loading history"
        });
    }
});



// Add committee deletion route
route.post("/committee/:id/delete", isAdminLoggedIn, async (req, res) => {
    try {
        const committeeId = req.params.id;
        
        // Delete all members of the committee first
        await CommitteeMember.deleteMany({ committeeId });
        
        // Delete the committee history
        await CommitteeHistory.deleteMany({ committeeId });

        // Delete the committee itself
        const committee = await Committee.findByIdAndDelete(committeeId);
        
        if (!committee) {
            return res.status(404).send("Committee not found");
        }

        // Redirect back to admin dashboard
        res.redirect(`/api/admin/adminPage/${committee.adminId}`);
    } catch (error) {
        console.error("Error deleting committee:", error);
        res.status(500).send("Error deleting committee");
    }
});

module.exports = route;