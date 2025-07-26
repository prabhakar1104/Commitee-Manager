const mongoose = require("mongoose");

const committeeMemberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 1
    },
    paidAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    paymentDate: {
        type: Date,
        default: null
    },
    committeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Committee",
        required: true
    },
    // These can be virtuals or calculated on save
    status: {
        type: String,
        enum: ['pending', 'partial', 'paid'],
        default: 'pending'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for due amount
committeeMemberSchema.virtual('due').get(function() {
    return this.amount - this.paidAmount;
});

// Update status before saving
committeeMemberSchema.pre('save', function(next) {
    if (this.paidAmount >= this.amount) {
        this.status = 'paid';
    } else if (this.paidAmount > 0) {
        this.status = 'partial';
    } else {
        this.status = 'pending';
    }
    next();
});

module.exports = mongoose.model("CommitteeMember", committeeMemberSchema);