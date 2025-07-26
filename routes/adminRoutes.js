const express = require("express");
const route = express.Router();
const Admin = require("../model/Admin");
const Committee = require("../model/comettii");
const CommitteeHistory = require("../model/CommitteeHistory");
const { isAdminLoggedIn } = require("../middleware/auth"); 
const CommitteeMember = require("../model/user_record"); 
const {add,show,dashBoard,home} = require("../controller/comeetyOp");
const {userPage} = require("../controller/UserMain");

route.get("/",home);

route.post("/dashBoard",dashBoard);

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