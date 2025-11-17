import fs from "fs";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

const addendumForm = async (data) => {
 
  const templatePdfPath = "./src/templates/addendum.pdf"; // multi-page template
  const fontPath = "./src/fonts/NotoSans_ExtraCondensed-Regular.ttf";

  // Load template + font
  const existingPdfBytes = fs.readFileSync(templatePdfPath);
  const fontBytes = fs.readFileSync(fontPath);

  // Load existing PDF
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  pdfDoc.registerFontkit(fontkit);
  const font = await pdfDoc.embedFont(fontBytes);

  const textColor = rgb(0, 0, 0);

  // Get all pages
  const pages = pdfDoc.getPages();
  const page1 = pages[0]; // front side
  const fontSize = 14;
  
  if (page1) {
	page1.drawText(`${data.firstName || ""} ${data.lastName || ""}`, {
	  x: 280,
	  y: 671,
	  size: fontSize,
	  font,
	  color: textColor,
	});
	page1.drawText(data.appId || "", {
	  x: 260,
	  y: 652,
	  size: fontSize,
	  font,
	  color: textColor,
	});
  }

  // -----------------------------
  // Save final filled PDF
  // -----------------------------
  const pdfBytes = await pdfDoc.save();
  const outputPath = "./src/output/filled_addendum.pdf";
  fs.writeFileSync(outputPath, pdfBytes);

  // console.log("✅ Addenum form  filled successfully!");
  return outputPath;

 
};

//  const sampleData={
// 	firstName: "Abhishek",
// 	lastName: "Rathore",
// 	appId: "ALA000002197117",
// 	loanAmount: "223766",
// 	adress: "Indore",
// }
// addendumForm(sampleData)
export { addendumForm };
