const mongoose = require("mongoose");
const CommitteeMember = require("../model/user_record");
const Committee = require("../model/comettii");
// const comettii = require("../model/comettii");
const jwt = require('jsonwebtoken');
const Admin = require("../model/Admin");
const generateShareableLink = (committeeId) => {
    return `${process.env.BASE_URL}/api/admin/public/committee/${committeeId}`;
};

exports.home = async (req, res) => {
    try {
        // Fetch all committees and populate admin info
        const committees = await Committee.find().populate({
            path: 'adminId',
            select: 'name email'
        });

        let admin = null;

        // If admin is logged in, decode token and fetch admin info
        if (req.cookies && req.cookies.token) {
            try {
                const token = req.cookies.token;
                const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
                admin = await Admin.findById(decoded.id);
            } catch (err) {
                console.error("Token error:", err.message);
                res.clearCookie("token");
            }
        }

        res.render("Home", {
            Admin: admin,
            committees: committees
        });

    } catch (error) {
        console.error("Error rendering home:", error.message);
        res.render("Home", {
            Admin: null,
            committees: []
        });
    }
};




exports.add = async (req, res) => {
    try {
        const { name, amount, paid, due, committeeId } = req.body;

        if (!committeeId) {
            return res.status(400).json({ message: "Committee ID is required." });
        }

        const member = new CommitteeMember({
            name,
            amount,
            paid,
            due,
            committeeId
        });

        await member.save();

        res.status(201).json({
            message: "Member added successfully to committee.",
            member
        });

    } catch (error) {
        console.error("Error adding member:", error);
        res.status(500).json({ message: "Server error" });
    }
};



exports.show = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Committee ID is required." });
        }

        const members = await CommitteeMember.find({committeeId: id});

        res.status(200).json({
            message: `Members of committee ${id}`,
            data:members
        });
    } catch (error) {
        console.error("Error fetching members:", error);
        res.status(500).json({ message: "Server error" });
    }
};


exports.dashBoard = async(req,res)=>{
    try {
        const adminId = req.body.adminId;  // Changed from {id} to adminId

        if (!mongoose.Types.ObjectId.isValid(adminId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid admin ID format"
            });
        }

        const committees = await Committee.find({adminId}).populate('adminId');
        
        if (!committees || committees.length === 0) {
            return res.render("Dashboard", { 
                committees: [],
                adminId: adminId
            });
        }

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
}



exports.getPublicCommittee = async (req, res) => {
    try {
        const { id } = req.params;
        const committee = await Committee.findById(id)
            .populate('adminId', 'name')
            .select('-adminId.email -adminId.password');

        const members = await CommitteeMember.find({ committeeId: id })
            .select('name amount paidAmount paymentDate status');

        if (!committee) {
            return res.render("PublicView", {
                error: "Committee not found",
                committees: []
            });
        }

        res.render("PublicCommitteeView", {
            committee,
            members,
            shareableLink: generateShareableLink(id)
        });
    } catch (error) {
        console.error("Error fetching public committee:", error);
        res.status(500).render("PublicView", {
            error: "Unable to fetch committee details",
            committees: []
        });
    }
};