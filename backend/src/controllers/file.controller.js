import { enrollmentForm } from "../pdfReader/enrollment.js";
import { drfForm } from "../pdfReader/drf.js";
import { applicationForm } from "../pdfReader/app.js";
import {User} from "../model/user.model.js"



const generatePdf = async (req, res) => {
  try {
    const { sanction, aadhar, bank } = req.body;

    if (!sanction || !aadhar || !bank) {
      return res.status(400).json({ error: "Missing sanction, aadhar, or bank data" });
    }

    // ---------------------------------------------
    // Prepare DRF Form Data
    // ---------------------------------------------
    const drfData = {
      place: "Indore",
      date: sanction.date || "",
      appId: sanction.referenceNo || "",
      loanAmount: sanction.loanAmount || "",
      loanAmountWords: sanction.loanAmount,
      beneficiaryName: bank.beneficiaryName,
      bankName: bank.bankName || "",
      accountNo: bank.accountNumber || "",
      ifscCode: bank.ifscCode || "",
      disbursementAmount: sanction.disbursement || "",
      insurance : sanction.insurance || "",
    };

    // ---------------------------------------------
    // Enrollment Form Data
    // ---------------------------------------------
    const enrollmentData = {
      adress: aadhar.address || "",
      DOBDate: aadhar.dob || "",
      appId: sanction.referenceNo || "",
      loanAmount: sanction.loanAmount || "",
      disbursementAmount: sanction.disbursement || "",
      firstName: aadhar.firstName || "",
      lastName: aadhar.lastName || "",
      gender: aadhar.gender || "Male",
      Mobile: aadhar.mobile || "",
      District: aadhar.district || "",
      State: aadhar.state || "",
      city: aadhar.city || "",
      pincode: aadhar.pincode || "",
      typeOfLoan: "T.W.",
      EmailId: sanction.email || "",
      UniqueId: aadhar.aadhaarLast4 || "",
      DateOfSanction: sanction.date || "",
      NameOfInsuredPerson: `${aadhar.firstName} ${aadhar.lastName}`,
      RelationshipWithApplicant: "Self",
      LoanTenure: sanction.tenure || "",
      insurance : sanction.insurance || "",
      nominee:aadhar.nominee || "sjke",
      relationWithnominee: aadhar.relationWithnominee ||"father"

    };

    // ---------------------------------------------
    const appData = {
      firstName: aadhar.firstName || "",
      lastName: aadhar.lastName || "",
      adress: aadhar.address || "",
      appId: sanction.referenceNo || "",
      loanAmount: sanction.loanAmount || "",
      insurance:sanction.insurance || ""
    };

   

    // ---------------------------------------------
    // Generate all filled PDFs
    // ---------------------------------------------
    await Promise.all([
      applicationForm(appData),
      drfForm(drfData),
      enrollmentForm(enrollmentData),
    ]);


     // -----------------------------
    // Build File URLs
    // -----------------------------
    const baseUrl = `${req.protocol}://${req.get("host")}/output`;

    const pdfUrls = {
      drfPdf: `${baseUrl}/filled_drf.pdf`,
      enrollmentPdf: `${baseUrl}/filled_enrollment.pdf`,
      applicationPdf: `${baseUrl}/filled_application.pdf`
    };

      await User.findByIdAndUpdate(req.user._id, {
      $inc: { generatePdfCount: 1 }
    });

    return res.status(200).json({
      message: "PDFs generated successfully",
      files:pdfUrls
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};


export { generatePdf };
