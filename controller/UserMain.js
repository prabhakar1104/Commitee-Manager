const Committee = require("../model/comettii");
const CommitteeMember = require("../model/user_record");


exports.userPage = async(req,res)=>{
    try {
        const committeeId = req.body.committeeId;
        
        if(!committeeId){
            return res.status(401).json({
                success: false,
                message: "Committee ID missing",
            });
        }

        // Fetch committee details with admin info
        const committee = await Committee.findById(committeeId).populate('adminId');
        
        // Fetch committee members
        const members = await CommitteeMember.find({ committeeId });

        if(!committee) {
            return res.status(404).json({
                success: false,
                message: "Committee not found",
            });
        }

        res.render("UserMain", {
            committee,
            members
        });
        
    } catch(err) {
        console.error("Error fetching committee details:", err);
        res.status(500).render("UserMain", {
            committee: null,
            members: [],
            error: "Error fetching committee details"
        });
    }
}