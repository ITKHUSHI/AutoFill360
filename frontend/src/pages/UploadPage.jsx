 import React, { useState } from "react";
import axios from "axios";
import SanctionUpload from "../components/SanctionUpload";
import AadharUpload from "../components/AadharUpload";
import BankUpload from "../components/BankUpload";
import { APIURL } from "../utills/utill";
import PdfPreviewer from "../components/PdfPreviewer";
import toast from "react-hot-toast";

const UploadPage = () => {
  const [sanctionData, setSanctionData] = useState(null);
  const [aadharData, setAadharData] = useState(null);
  const [bankData, setBankData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfList, setPdfList] = useState([]);


  const handleSubmit = async () => {
  if (!sanctionData || !aadharData || !bankData) {
    toast.error("Upload all 3 documents first.");
    return;
  }

  setLoading(true);

  try {
    const payload = { sanction: sanctionData, aadhar: aadharData, bank: bankData };

    // Fire request without blocking React UI
    const res = await axios.post(`${APIURL}/api/files/generate-pdf`, payload, {
      timeout: 60000,  // handle slow backend
    });

    if (!res.data?.files) throw new Error("No PDF returned");

    setPdfList([
      { name: "DRF Form", url: res.data.files.drfPdf },
      { name: "Tata AIG Form", url: res.data.files.TataAIGPdf },
      { name: "Application Form", url: res.data.files.applicationPdf },
    ]);

    toast.success("PDFs generated successfully!");

  } catch (err) {
    toast.error("PDF generation failed. Try again.");
  }

  setLoading(false);
};


  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 md:py-10 md:px-6">
      <div className=" mx-auto bg-white shadow-lg rounded-2xl p-4 md:p-8 ">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Document Upload & PDF Generator
        </h1>

        <div className="grid grid-cols-1 gap-8">
          <SanctionUpload onDataExtracted={setSanctionData} />
          <AadharUpload onDataExtracted={setAadharData} />
          <BankUpload onDataExtracted={setBankData} />
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-8 py-3 my-2 rounded-lg font-semibold shadow ${
              loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
            }`}
          >
            {loading ? "Generating PDFs..." : "Generate PDFs"}
          </button>
        </div>

        {pdfList.length > 0 && (
          <div className="mt-12 py-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">
              Generated PDFs
            </h2>
       <div className="space-y-6 md:space-y-8">
      {pdfList.map((pdf, i) => (
        <PdfItem key={i} pdf={pdf} />
      ))}
    </div>
            
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;



// ------------------------------
// PDF Item Component
// ------------------------------
const PdfItem = ({ pdf }) => {
  const [showPreview, setShowPreview] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(pdf.url, { method: "GET" });
      if (!response.ok) throw new Error("Failed to fetch PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${pdf.name}.pdf`;
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

 const handlePrint = async () => {
  const response = await fetch(pdf.url);
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);

  const printWindow = window.open(blobUrl);
  printWindow.onload = () => printWindow.print();
};


  return (
    <div className="border p-4 rounded-lg shadow-sm bg-gray-50">

      {/* -------- TOP SECTION -------- */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-800">{pdf.name}</h3>

        {/* Buttons */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">

          <button
            className="flex-1 md:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? "Hide Preview" : "Preview"}
          </button>

          <button
            className="flex-1 md:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            onClick={handleDownload}
          >
            Download
          </button>

          <button
            className="flex-1 md:flex-none px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-700 text-sm"
            onClick={handlePrint}
          >
            Print
          </button>

        </div>

      </div>

      {/* -------- PREVIEW -------- */}
      {showPreview && (
        <div className="mt-4">
          <PdfPreviewer pdfUrl={pdf.url} />
        </div>
      )}

    </div>
  );
};

