import mongoose from "mongoose";

const bankSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    beneficiaryName: {
      type: String,
      required: true,
      trim: true,
    },

    bankName: {
      type: String,
      required: true,
      trim: true,
    },

    ifscCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      match: /^[A-Z]{4}0[A-Z0-9]{6}$/ // basic IFSC validation
    },

    accountNumber: {
      type: String,
      required: true,
      trim: true,
    }
  },
  { timestamps: true }
);

export const Bank= mongoose.model("BankDetails", bankSchema);
