import fs from "fs";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { drawWrappedAddress } from "../utils/textwrapper.js";

const applicationForm = async (data) => {
    if(!data){
      return res.status(404).json({message:"application form data not found please send vailid data"})
    }
  const templatePdfPath = "./src/templates/application.pdf"; // multi-page template
  const fontPath = "./src/fonts/NotoSans_ExtraCondensed-Regular.ttf";
  //  use this font for tick
const fontBytes1 = fs.readFileSync(
  "./node_modules/dejavu-fonts-ttf/ttf/DejaVuSans.ttf");  
  // Load template + font
  const existingPdfBytes = fs.readFileSync(templatePdfPath);
  const fontBytes = fs.readFileSync(fontPath);

  // Load existing PDF
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  pdfDoc.registerFontkit(fontkit);
  const font = await pdfDoc.embedFont(fontBytes);
  const tickFont = await pdfDoc.embedFont(fontBytes1);

  const textColor = rgb(0, 0, 0);

  // Get all pages
  const pages = pdfDoc.getPages();
  const page1 = pages[0]; // front side
  const page2 = pages[1]; // back side (if exists)
  const page3 = pages[2]
  const page4=  pages[3]

  // -----------------------------
  // PAGE 1 (Front Page)
  // -----------------------------
  const fontSize = 14;
  page1.drawText(`${data.firstName || ""} ${data.middleName || ""} ${data.lastName || ""}`, {
    x: 170,
    y: 620,
    size: fontSize ,
    font,
    color: textColor,
  });
  drawWrappedAddress(
  page1,
  data.adress +" "+ data.pincode  || "",
  223,                   // X
  599,                   // Y
  225,                   // max width before wrapping
  font,
  fontSize,
  fontSize ,     // line height (~ font size + few px)
  textColor
);

  page1.drawText(data.loanAmount || "", {
    x: 238,
    y: 321,
    size: fontSize ,
    font,
    color: textColor,
  });
  page1.drawText(data.appId || "", {
    x: 238,
    y: 366,
    size: fontSize ,
    font,
    color: textColor,
  });

  // -----------------------------
  // PAGE 2 (Back Page)
  // -----------------------------
  if (page2) {
    page2.drawText(`${data.firstName || ""} ${data.middleName || " "} ${data.lastName || ""}`, {
      x: 305,
      y: 641,
      size: fontSize,
      font,
      color: textColor,
    });
    page2.drawText(data.appId || "", {
      x: 310,
      y: 616,
      size: fontSize,
      font,
      color: textColor,
    });
  }

  // -----------------------------
  // PAGE 3 (Back Page)
  // -----------------------------
  if (page3) {
    page3.drawText(`${data.firstName || ""} ${data.middleName || ""} ${data.lastName || ""}`, {
      x: 200,
      y: 655,
      size: fontSize,
      font,
      color: textColor,
    });
    page3.drawText(data.appId || "", {
      x: 260,
      y: 621,
      size: fontSize,
      font,
      color: textColor,
    });
    page3.drawText( data.insurance?"✔":"",{x:70,y:550,size:fontSize,font:tickFont,color:textColor});

  }
  if (page4) {
	page4.drawText(`${data.firstName || ""} ${data.middleName || ""} ${data.lastName || ""}`, {
	  x: 280,
	  y: 671,
	  size: fontSize,
	  font,
	  color: textColor,
	});
	page4.drawText(data.appId || "", {
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
  const outputPath = "./src/output/filled_application.pdf";
  fs.writeFileSync(outputPath, pdfBytes);

  // console.log("✅ Application form (front + back) filled successfully!");
  return outputPath;
  
};

//  const sampleData={
//     firstName: "Abhishek",
//     middleName:"khsh",
//     lastName: "Rathore",
//     appId: "ALA000002197117",
//     loanAmount: "223766",
//     adress: "we Hy 75 pg... emt rm me, (2 a, SolanVa $8 Tower 452001 Gi 5% 7A, /008:1995 257 Lr, PUMALL 11 cio inan ,ar, 00 i 5 it,97786 ALA000001928765",
//     insurance:"80"
// }
// applicationForm(sampleData)
export { applicationForm };
