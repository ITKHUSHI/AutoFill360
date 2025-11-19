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

    try {
      setLoading(true);

      const payload = { sanction: sanctionData, aadhar: aadharData, bank: bankData };

      const res = await axios.post(`${APIURL}/api/files/generate-pdf`, payload);

      const { files } = res.data;

      const pdfArray = [
        { name: "DRF Form", url: files.drfPdf },
        { name: "Enrollment Form", url: files.enrollmentPdf },
        { name: "Application Form", url: files.applicationPdf },
      ];

      setPdfList(pdfArray);
      toast.success("PDFs generated successfully!");

    } catch (err) {
      toast.error("Failed to generate PDFs.",err);
    } finally {
      setLoading(false);
    }
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

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-8 py-3 rounded-lg font-semibold shadow ${
              loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
            }`}
          >
            {loading ? "Generating PDFs..." : "Generate PDFs"}
          </button>
        </div>

        {pdfList.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">
              Generated PDFs
            </h2>

            <div className="space-y-8">
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

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = pdf.url;
    link.target="_blank"
    link.download = `${pdf.name}.pdf`;
    link.click();
  };

 


  return (
    <div className="border p-4 rounded-lg shadow-sm bg-gray-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-gray-800">{pdf.name}</h3>

        <div className="flex gap-3">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? "Hide Preview" : "Preview"}
          </button>

          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            onClick={handleDownload}
            
          >
            Download
          </button>

      
        </div>
      </div>

      {showPreview && (
        <div className="mt-4">
          <PdfPreviewer pdfUrl={pdf.url} />
        </div>
      )}
    </div>
  );
};
