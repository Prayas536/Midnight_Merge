const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true, sparse: true },
    passwordHash: { type: String, required: true, select: false },
    userType: { type: String, enum: ["doctor", "patient"], required: true, index: true },
    linkedPatientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", default: null },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { email: { $type: "string" } } });

module.exports = mongoose.model("User", UserSchema);
