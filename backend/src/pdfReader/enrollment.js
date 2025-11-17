import fs from "fs";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { drawWrappedEAddress } from "../utils/textwrapper.js";

const planType = (am) => {
  const planMap = {
    "674": "A",
    "968": "A",
    "1233": "A",
    "1470": "A",

    "963": "B",
    "1383": "B",
    "1762": "B",
    "2100": "B",

    "1204": "C",
    "2074": "C", // Note: "2074" also appears in D
    "2202": "C",
    "2625": "C",

    "1444": "D",
    "2643": "D",
    "3150": "D",

    "1926": "E",
    "2766": "E",
    "3524": "E",
      "4200": "E",
  };

  return planMap[am] || null; // returns null if not found
};

const enrollmentForm = async (data) => {

  const templatePdfPath = "./src/templates/enrollment.pdf"; // <== PDF template now
  const fontPath = "./src/fonts/NotoSans_ExtraCondensed-Regular.ttf";

  // Load template and font
  const existingPdfBytes = fs.readFileSync(templatePdfPath);
  const fontBytes = fs.readFileSync(fontPath);

  // Load the existing PDF template
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  pdfDoc.registerFontkit(fontkit);

  const font = await pdfDoc.embedFont(fontBytes);
  const textColor = rgb(0, 0, 0);
  const fontSize = 14;

  // Access pages
  const pages = pdfDoc.getPages();
  const page1 = pages[0]; // You can access more pages: pages[1], pages[2], etc.
  const page2=pages[1];
  // -----------------------------
  // PAGE 1 — Fill applicant details
  // -----------------------------
  page1.drawText(data.city || "Indore", { x: 230, y: 462, size: fontSize, font, color: textColor });
  page1.drawText(data.State || "Madhya Pradesh", { x: 328, y: 462, size: fontSize, font, color: textColor });
  page1.drawText(data.District || "Dhar", { x: 150, y: 462, size: fontSize, font, color: textColor });
  page1.drawText(data.pincode || "", { x: 456, y: 462, size: fontSize, font, color: textColor });
  page1.drawText(data.appId || "", { x: 210, y: 725, size: fontSize, font, color: textColor });

  page1.drawText(`${data.firstName || ""}`, { x: 150, y: 564, size: fontSize, font, color: textColor });
  page1.drawText(`${data.lastName || ""}`, { x: 450, y: 564, size: fontSize, font, color: textColor });
  page1.drawText(data.Mobile || "", { x: 340, y: 445, size: fontSize, font, color: textColor });
  page1.drawText(data.EmailId || "", { x: 132, y: 429, size: fontSize, font, color: textColor });
  page1.drawText(data.gender || "", { x: 350, y: 536, size: fontSize, font, color: textColor });
  page1.drawText(data.DOBDate || "", { x: 150, y: 536, size: fontSize, font, color: textColor });
  page1.drawText((data.UniqueId || ""), { x: 459, y: 427, size: fontSize+2, font, color: textColor });
  drawWrappedEAddress(
      page1,
      data.adress, 
       154,
       498,
       399,
       font, 
      fontSize, 
      fontSize,  
       textColor ,

  )
  page1.drawText(data.typeOfLoan || "", { x: 60, y: 373, size: fontSize, font, color: textColor });
  page1.drawText(data.LoanTenure || "", { x: 150, y: 373, size: fontSize, font, color: textColor });
  page1.drawText(data.loanAmount || "", { x: 225, y: 373, size: fontSize, font, color: textColor });
  page1.drawText(data.DateOfSanction || "", { x: 303, y: 373, size: fontSize, font, color: textColor });
  page1.drawText(data.disbursementAmount || "", { x: 500, y: 373, size: fontSize, font, color: textColor });

  page1.drawText(data.NameOfInsuredPerson || "", { x: 80, y: 276, size: fontSize, font, color: textColor });
  page1.drawText(data.RelationshipWithApplicant || "", { x: 227, y: 276, size: fontSize, font, color: textColor });
  // occupation self little hack
  page1.drawText(data.RelationshipWithApplicant || "", { x: 400, y: 276, size: fontSize, font, color: textColor });
  page1.drawText(data.DOBDate || "", { x: 322, y: 276, size: fontSize, font, color: textColor });
  page1.drawText(data.gender || "", { x: 455, y: 276, size: fontSize, font, color: textColor });
  page1.drawText(data.UniqueId || "", { x: 503, y: 276, size: fontSize, font, color: textColor });

 if(page2){
    page2.drawText(data.DateOfSanction || "", { x: 100, y: 103, size: fontSize, font, color: textColor });
    page2.drawText("Dhar", { x: 365, y: 103, size: fontSize, font, color: textColor });
    page2.drawText(planType(data.insurance) || "A", { x: 100, y:720 , size: fontSize, font, color: textColor });
    page2.drawText(data.LoanTenure || "", { x: 300, y: 720, size: fontSize, font, color: textColor });
    page2.drawText(data.insurance, { x: 500, y: 720, size: fontSize, font, color: textColor });
    page2.drawText(data.nominee, { x: 160, y: 460, size: fontSize, font, color: textColor });
    page2.drawText(data.relationWithnominee, { x: 470, y: 460, size: fontSize, font, color: textColor });

 }
  const pdfBytes = await pdfDoc.save();
  const outputPath = "./src/output/filled_enrollment.pdf";
    fs.writeFileSync(outputPath, pdfBytes);
      // console.log("✅ Enrollment form filled successfully!");

    return outputPath;
} 



// -----------------------------
// 🧪 Sample Data
// -----------------------------
const EData = {
  adress: "Gram Bamhori Mafi  Sesai Saji, Banda Belai, Banda Sagar, Madhya Pradesh, J BUR, 470335, ",
  DOBDate: "08-11-2025",
  appId: "ALA000002197117",
  loanAmount: "223766",
  disbursementAmount: "215420",
  firstName: "Abhishek",
  lastName: "Rathore",
  gender: "Male",
  Mobile: "937786476",
  District: "Dhar",
  State: "Madhya Pradesh",
  city: "Dhar",
  pincode: "454001",
  typeOfLoan: "T.W.",
  EmailId: "kkk@gmail.com",
  UniqueId: "3749",
  DateOfSanction: "10-11-2025",
  NameOfInsuredPerson: "Abhishek Rathore",
  RelationshipWithApplicant: "Self",
  LoanTenure:"14",
  insurance:"963",
  nominee:"sjke",
  relationWithnominee:"father"
 
};
enrollmentForm(EData)

// Run test

export { enrollmentForm };
