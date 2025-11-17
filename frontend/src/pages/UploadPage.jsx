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
  const [pdfUrl, setPdfUrl] = useState(null); // we’ll store the blob URL here
  console.log("🟥 APIURL REFREn:", import.meta.env.VITE_BACKEND_URL);
console.log("🟥 Full import.meta.env:", import.meta.env);
console.log("🟥 Full APIURL:", APIURL);

  const handleSubmit = async () => {
    if (!sanctionData || !aadharData || !bankData) {
      toast.error("Please upload all three documents before generating PDF.");
      return;
    }

    try {
      setLoading(true);
      const allData = { sanction: sanctionData, aadhar: aadharData, bank: bankData };

      // Backend must return PDF as binary (arraybuffer)
      const res = await axios.post(`${APIURL}/api/files/generate-pdf`, allData, {
        responseType: "arraybuffer",
      });

      // Convert ArrayBuffer to a Blob URL
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      toast.success("successfully generate pdf")
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Failed to generate PDF.");
    } finally {
      setLoading(false);
    }
  };
   console.log(pdfUrl)
  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = "combined.pdf";
    link.click();
  };

const handlePrint = async () => {
  if (!pdfUrl) return;

  const blob = await fetch(pdfUrl).then(r => r.blob());
  const url = URL.createObjectURL(blob);

  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = url; // assign src FIRST

  iframe.onload = () => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  };

  document.body.appendChild(iframe);
};




  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-6">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Document Upload & PDF Generator
        </h1>


        <div className="grid grid-cols-1 gap-8">
          <SanctionUpload onDataExtracted={setSanctionData} />
          <AadharUpload onDataExtracted={setAadharData} />
          <BankUpload onDataExtracted={setBankData} />
        </div>
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-8 py-3 rounded-lg font-semibold shadow-md transition-all ${
              loading
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
            }`}
          >
            {loading ? "Generating PDF..." : "Generate PDF"}
          </button>

          {pdfUrl && (
            <>
              <button
                onClick={handleDownload}
                className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                Download PDF
              </button>
              <button
                onClick={handlePrint}
                className="px-6 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600"
              >
                Print PDF
              </button>
            </>
          )}
        </div>

        {pdfUrl && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              📄 Preview Generated PDF
            </h2>

            <PdfPreviewer pdfUrl={pdfUrl} />
            
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
