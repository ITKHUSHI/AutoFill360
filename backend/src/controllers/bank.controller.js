import { Bank } from "../model/bank.model.js";

const addBankDetails = async (req, res) => {
  try {
    const { beneficiaryName, bankName, ifscCode, accountNumber } = req.body;
    const userId = req?.user?._id;

    if (!userId || !beneficiaryName || !bankName || !ifscCode || !accountNumber) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if this user already added this exact account number
    const existing = await Bank.findOne({ userId, accountNumber });

    if (existing) {
      return res.status(409).json({
        message: "This account number is already saved for this user.",
      });
    }

    const bank = await Bank.create({
      userId,
      beneficiaryName,
      bankName,
      ifscCode,
      accountNumber,
    });

    return res.status(201).json({
      message: "Bank details created successfully.",
      data: bank,
    });

  } catch (err) {
    console.error("Error creating bank details:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};


export {
	addBankDetails
}