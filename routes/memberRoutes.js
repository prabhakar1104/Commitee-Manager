const express = require("express");
const router = express.Router();
const CommitteeMember = require("../model/user_record");
const CommitteeHistory = require("../model/CommitteeHistory");
const jwt = require('jsonwebtoken');

// Show all members of a committee
router.get("/committee/:id/members", async (req, res) => {
    try {
        const committeeId = req.params.id;
        const members = await CommitteeMember.find({ committeeId });
        res.render("AdminPage", { 
            members, 
            committeeId,
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
});

// Add a member
router.post("/committee/:id/members/add", async (req, res) => {
    try {
        // console.log("Hi babayy");
        const { name, amount, paidAmount, paymentDate } = req.body;
        const committeeId = req.params.id;

        const newMember = await CommitteeMember.create({
            name,
            amount: parseFloat(amount),
            paidAmount: parseFloat(paidAmount) || 0,
            paymentDate: paidAmount > 0 ? (paymentDate || new Date()) : null,
            committeeId
        });
        newMember.save();

        res.redirect(`/api/admin/committee/${committeeId}/admin`);
    } catch (error) {
        console.error("Error adding member:", error);
        res.status(500).send("Error adding committee member");
    }
});

// Delete a member
router.post("/members/:memberId/delete", async (req, res) => {
    try {
        const member = await CommitteeMember.findById(req.params.memberId);
        if (!member) {
            return res.status(404).send("Member not found");
        }

        const committeeId = member.committeeId;
        await CommitteeMember.findByIdAndDelete(req.params.memberId);
        res.redirect(`/api/admin/committee/${committeeId}/admin`);
    } catch (error) {
        console.error("Error deleting member:", error);
        res.status(500).send("Error deleting committee member");
    }
});

// Edit a member (render edit form)
router.get("/members/:memberId/edit", async (req, res) => {
    try {
        const member = await CommitteeMember.findById(req.params.memberId);
        if (!member) {
            return res.status(404).send("Member not found");
        }

        res.render("EditMember", { 
            member,
            formattedPaymentDate: member.paymentDate ? 
                new Date(member.paymentDate).toISOString().split('T')[0] : 
                ''
        });
    } catch (error) {
        console.error("Error fetching member for edit:", error);
        res.status(500).send("Error loading edit form");
    }
});

// Update member (submit edit form)
router.post("/members/:memberId/update", async (req, res) => {
    try {
        const { name, amount, paidAmount, paymentDate } = req.body;
        const memberId = req.params.memberId;

        const updatedMember = await CommitteeMember.findByIdAndUpdate(
            memberId,
            {
                name,
                amount: parseFloat(amount),
                paidAmount: parseFloat(paidAmount) || 0,
                paymentDate: paidAmount > 0 ? (paymentDate || new Date()) : null
            },
            { new: true }
        );

        if (!updatedMember) {
            return res.status(404).send("Member not found");
        }

        res.redirect(`/api/admin/committee/${updatedMember.committeeId}/admin`);
    } catch (error) {
        console.error("Error updating member:", error);
        res.status(500).send("Error updating committee member");
    }
});



// Set common amount for all members
router.post("/committee/:id/set-common-amount", async (req, res) => {
    try {
        const committeeId = req.params.id;
        const { commonAmount } = req.body;

        // Get token and decode admin info
        const token = req.cookies.token;
        const adminInfo = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        // Get current members state before update
        const currentMembers = await CommitteeMember.find({ committeeId });
        
        // Create history record
        const historyRecord = new CommitteeHistory({
            committeeId,
            date: new Date(),
            changeType: 'common_amount',
            changedBy: adminInfo.id,
            members: currentMembers.map(member => ({
                memberId: member._id,
                name: member.name,
                previousAmount: member.amount,
                newAmount: parseFloat(commonAmount),
                previousPaidAmount: member.paidAmount,
                newPaidAmount: 0,
                previousStatus: member.status,
                newStatus: 'pending'
            }))
        });

        // Save history first
        await historyRecord.save();
        console.log('Created history record:', historyRecord._id);

        // Then update all members
        await CommitteeMember.updateMany(
            { committeeId },
                        { 
                $set: {
                    amount: commonAmount,
                    paidAmount: 0,
                    status: 'pending'
                }
            }
        );

        res.redirect(`/api/admin/committee/${committeeId}/admin`);
    } catch (error) {
        console.error("Error setting common amount:", error);
        res.status(500).send("Error updating member amounts");
    }
});

module.exports = router;