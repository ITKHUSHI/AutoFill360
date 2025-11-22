import fs from "fs";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { drawWrappedAmount } from "../utils/textwrapper.js";
// -----------------------------
// Convert number to words (Indian format)
// -----------------------------
function numberToINRWords(num) {
  if (typeof num !== "number") num = parseInt(num, 10);
  if (isNaN(num)) return "";

  const ones = [
    "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
    "seventeen", "eighteen", "nineteen"
  ];
  const tens = [
    "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"
  ];

  const numToWords = (n) => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000)
      return ones[Math.floor(n / 100)] + " hundred" + (n % 100 ? " " + numToWords(n % 100) : "");
    return "";
  };

  if (num === 0) return "zero";

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num / 100000) % 100);
  const thousand = Math.floor((num / 1000) % 100);
  const hundred = Math.floor((num / 100) % 10);
  const remainder = num % 100;

  let words = "";
  if (crore) words += numToWords(crore) + " crore ";
  if (lakh) words += numToWords(lakh) + " lakh ";
  if (thousand) words += numToWords(thousand) + " thousand ";
  if (hundred) words += ones[hundred] + " hundred ";
  if (remainder) words += numToWords(remainder) + " ";

  return words.trim();
}

// -----------------------------
// Main PDF Fill Function
// -----------------------------
const drfForm = async (data) => {
  const templatePdfPath = "./src/templates/drf.pdf";
  const fontPath = "./src/fonts/NotoSans_ExtraCondensed-Regular.ttf";

  // Load PDF and font
  const existingPdfBytes = fs.readFileSync(templatePdfPath);
  const fontBytes = fs.readFileSync(fontPath);

  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  pdfDoc.registerFontkit(fontkit);
  const font = await pdfDoc.embedFont(fontBytes);

  const pages = pdfDoc.getPages();
  const page = pages[0]; // first page only, add more if template has more pages

  const textColor = rgb(0, 0, 0);
  const fontSize = 14;
  // -----------------------------
  // Header section
  // -----------------------------
  page.drawText("Indore", { x: 450, y: 741, size: fontSize, font, color: textColor });
  page.drawText(data.date || "", { x: 450, y: 765, size: fontSize, font, color: textColor });
  page.drawText(data.appId || "", { x: 400, y: 711, size: fontSize, font, color: textColor });
  page.drawText(data.insurance || "", { x: 465, y:283, size: fontSize, font, color: textColor });
  page.drawText(String(data.loanAmount || ""), { x: 215, y: 688, size: fontSize, font, color: textColor });
drawWrappedAmount(
  page,
  numberToINRWords(data.loanAmount) || "",
  332,          // starting X
  688,          // starting Y
  190,          // max width before breaking line (adjust as needed)
  font,
  fontSize,
  fontSize , // line height
  textColor
);

  // -----------------------------
  // Bank Table Logic
  // -----------------------------
  const xColumn = data.bankName?.replace(/\s+/g, "").toLowerCase() === "axisbankltd"
? 180 : 320;
  let y = 570;
  const gap = 28;

  const drawField = (value, options = {}) => {
    if (!value) return;
    const { xOffset = 0, yOverride = null } = options;
    const drawY = yOverride ?? y;

    page.drawText(String(value).toUpperCase(), {
      x: xColumn + xOffset,
      y: drawY,
      size: fontSize,
      font,
      color: textColor,
    });

    if (!yOverride) y -= gap;
  };

  drawField(data.beneficiaryName);
  drawField(data.bankName);
  drawField(data.accountNo, { yOverride: 513 });
  drawField(data.ifscCode, { yOverride: 497 });
  drawField(data.disbursementAmount, { yOverride: 481 });



  // -----------------------------
  // Save Filled PDF
  // -----------------------------
  const pdfBytes = await pdfDoc.save();
  const outputPath = "./src/output/filled_drf.pdf";
  fs.writeFileSync(outputPath, pdfBytes);
    // console.log("✅ DRF form filled successfully!");

    return outputPath;
  

  
};

// -----------------------------
// Sample Run
// -----------------------------
// const sampleDrf = {
//   appId: "ALA000002197117",
//   loanAmount: 223767,
//   disbursementAmount: "215420",
//   place: "Indore",
//   date: "11-23-2025",
//   beneficiaryName: "Khushi Rathore",
//   bankName: "Axis bank ltd",
//   accountNo: "9834784687483",
//   ifscCode: "SBIN409038778",
//   insurance:"9632"
// };

// drfForm(sampleDrf);

export { drfForm };
