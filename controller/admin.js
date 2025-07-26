const Committee = require("../model/comettii");
const mongoose = require("mongoose");
const CommitteeMember = require("../model/user_record");


exports.createCommittee = async (req, res) => {
  try {
    const { title, amountPerMember, totalMembers } = req.body;
    const adminId = req.query.id;            
    const newCommittee = new Committee({
      adminId,
      title,
      amountPerMember,
      totalMembers,
    });
    // console.log(title);

    await newCommittee.save();
    res.redirect(`/api/admin/adminPage/${adminId}`);
  } catch (error) {
    console.error("Error creating committee:", error);
    res.status(500).send("Internal Server Error");
  }
};



exports.adminPage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).render("AdminDashboard", {
        committees: [],
        adminId: null,
        error: "Invalid admin ID"
      });
    }

    const data = await Committee.find({ adminId: id }).populate('adminId');

    res.render("AdminDashboard", {
      committees: data,
      adminId: id
    });

  } catch (err) {
    console.error("Error fetching adminPage", err);
    res.status(500).render("AdminDashboard", {
      committees: [],
      adminId: null,
      error: "Server error"
    });
  }
};


exports.adminCommittee = async(req,res)=>{
      try {
              const {id} = req.params;
             const committee = await Committee.findById(id).populate('adminId');
          const committeeId = req.params.id;
          const members = await CommitteeMember.find({ committeeId });
          res.render("AdminMain", { 
              members, 
              committeeId,
              committee,
              helpers: {
                  formatDate: function(date) {
                      return date ? new Date(date).toLocaleDateString() : 'Not paid';
                  }
              }
          });
      } catch (error) {
          console.error("Error fetching members:", error);
          res.status(500).send("Error loading committee members");
      }
}
