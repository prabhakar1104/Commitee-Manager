const mongoose = require("mongoose");

const committeeSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  amountPerMember: {
    type: Number,
    // required: true,
  },
  totalMembers: {
    type: Number,
    // required: true,
  },
  startDate: {
    type: Date,
    required: true,
    default:Date.now()
  },
}, { timestamps: true });

module.exports = mongoose.model('Committee', committeeSchema);
