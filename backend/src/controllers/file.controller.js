import { enrollmentForm } from "../pdfReader/enrollment.js";
import { drfForm } from "../pdfReader/drf.js";
import { applicationForm } from "../pdfReader/app.js";
import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { addendumForm } from "../pdfReader/addendum.js";

// ✅ Compute __dirname safely in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function mergePdfs(pdfFiles, outputDir = "./src/output") {
  if (!Array.isArray(pdfFiles) || pdfFiles.length === 0) {
    return res.status(404).json({message:"No PDF files provided for merging."});
  }

  const mergedPdf = await PDFDocument.create();

  for (const filePath of pdfFiles) {
    try {
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({message:`⚠️ Skipping missing file: ${filePath}`});
       
      }

      const bytes = fs.readFileSync(filePath);
      const pdf = await PDFDocument.load(bytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));

    } catch (err) {
      return res.status(500).json({message:"❌ Error merging ${filePath}:" ,err:err.message});
    }
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const combinedBytes = await mergedPdf.save();
  const combinedPath = path.join(outputDir, "combined.pdf");

  fs.writeFileSync(combinedPath, combinedBytes);

  // console.log("✅ Merged PDF created:", combinedPath);

  return combinedPath;
}
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
    };

   

    // ---------------------------------------------
    // Generate all filled PDFs
    // ---------------------------------------------
    await Promise.all([
      applicationForm(appData),
      drfForm(drfData),
      enrollmentForm(enrollmentData),
    ]);


    // ---------------------------------------------
    // Merge them
    // ---------------------------------------------
    const outputDir = path.join(__dirname, "../output");

    const pdfFiles = [
      path.join(outputDir, "filled_drf.pdf"),
      path.join(outputDir, "filled_enrollment.pdf"),
      path.join(outputDir, "filled_application.pdf"),
    ];

    const mergedPath = await mergePdfs(pdfFiles, outputDir);

    // ---------------------------------------------
    // Send merged PDF to client
    // ---------------------------------------------
    const fileBytes = fs.readFileSync(mergedPath);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="combined.pdf"',
    });

    res.send(fileBytes);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};


export { generatePdf };
