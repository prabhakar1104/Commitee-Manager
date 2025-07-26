const mongoose = require('mongoose');

const committeeHistorySchema = new mongoose.Schema({
    committeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Committee',
        required: true,
        index: true
    },
    date: {
        type: Date,
        default: Date.now,
        index: true
    },
    members: [{
        memberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CommitteeMember'
        },
        name: String,
        previousAmount: Number,
        newAmount: Number,
        previousPaidAmount: Number,
        newPaidAmount: Number,
        previousStatus: String,
        newStatus: String
    }],
    changeType: {
        type: String,
        enum: ['common_amount', 'individual_update', 'member_added', 'member_removed'],
        required: true
    },
    changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    }
}, { timestamps: true });

// Add compound index for faster queries
committeeHistorySchema.index({ committeeId: 1, date: -1 });

// Export the model properly
const CommitteeHistory = mongoose.model('CommitteeHistory', committeeHistorySchema);
module.exports = CommitteeHistory;