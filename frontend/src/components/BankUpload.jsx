import React, { useState } from "react";
import Tesseract from "tesseract.js";
import { BANK_HOLDERS } from "../utills/bankdetails";
import toast from "react-hot-toast";
// 🔹 Extract data from OCR text (same as before)
const parseBankDetails = (rawText = "") => {
  const text = rawText.replace(/[^\x00-\x7F]/g, " ").replace(/\s+/g, " ").trim();

  const ifscMatch = text.match(/\b([A-Z]{4}0[A-Z0-9]{6})\b/i);
  const ifscCode = ifscMatch ? ifscMatch[1].toUpperCase() : "";

  const accountMatches = text.match(/\b\d{9,18}\b/g) || [];
  let accountNumber = "";
  for (const num of accountMatches) {
    if (!ifscCode || !ifscCode.includes(num)) {
      accountNumber = num;
      break;
    }
  }

  const bankMatch = text.match(
    /\b([A-Z][A-Za-z\s]+?(?:Bank|BANK|Ltd|LIMITED|Co\-op|CO\-OPERATIVE|Nagarik|Gramin|Grameen|Vikas))\b/i
  );
  const bankName = bankMatch ? bankMatch[1].trim() : "";

  let beneficiaryName = "";
  const nameMatch = text.match(
    /\b(?:Name|Account\s*Holder|A\/C\s*Name)[:\-]?\s*([A-Za-z\s\.]+)/i
  );
  if (nameMatch) {
    beneficiaryName = nameMatch[1].replace(/[^A-Za-z\s\.]/g, "").trim();
  } else {
    const beforeBank = bankName ? text.split(bankName)[0] : text;
    const nameCandidate = beforeBank.match(/\b([A-Z][A-Za-z]+\s+[A-Z][A-Za-z]+)/);
    if (nameCandidate) beneficiaryName = nameCandidate[1].trim();
  }

  return { beneficiaryName, bankName, ifscCode, accountNumber };
};

// 🔹 Predefined bank holders list


const BankUpload = ({ onDataExtracted }) => {
  const [parsedData, setParsedData] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [rawText, setRawText] = useState("");
  const [error, setError] = useState("");
  const [selectedHolder, setSelectedHolder] = useState("");

  // OCR Extraction (Image/PDF)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setParsedData(null);
    setLoading(true);
    setError("");

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const result = await Tesseract.recognize(reader.result, "eng");
          const text = result.data.text;
          setRawText(text);
          const data = parseBankDetails(text);
          setParsedData(data);
          onDataExtracted && onDataExtracted(data);
        } catch (err) {
          console.error("OCR error:", err);
          setError("Failed to extract text");
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
      setLoading(false);
    }
  };

  // Holder selection from predefined list
  const handleHolderSelect = (holderId) => {
    setSelectedHolder(holderId);
    const holder = BANK_HOLDERS.find((h) => h.id === parseInt(holderId));
    if (holder) {
      setParsedData(holder);
      onDataExtracted && onDataExtracted(holder);
    }
  };

  const handleEditChange = (key, value) => {
    setParsedData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    toast.success("Data saved successfully!");
    onDataExtracted && onDataExtracted(parsedData);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      <h3 className="text-xl font-semibold mb-3">Bank Details</h3>

      {/* Dropdown for selecting predefined bank holder */}
      <div className="mb-4">
        <label className="block font-semibold mb-1 text-gray-700">
          Select Beneficiary
        </label>
        <select
          value={selectedHolder}
          onChange={(e) => handleHolderSelect(e.target.value)}
          className="border rounded-lg w-full px-3 py-2 text-gray-700 focus:outline-none focus:ring focus:ring-blue-300"
        >
          <option value="">-- Choose Existing Holder --</option>
          {BANK_HOLDERS.map((holder) => (
            <option key={holder.id} value={holder.id}>
              {holder.beneficiaryName}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex-1">
          <label className="block font-semibold mb-1 text-gray-700">
            Upload Bank Document (PDF/JPG)
          </label>
          <input
            type="file"
            accept="application/pdf,image/jpeg,image/jpg"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>
      </div>

      {fileName && <p className="text-sm text-gray-700 mb-2">📄 {fileName}</p>}
      {loading && <p className="text-gray-600 italic">Extracting data...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Editable Table */}
      {parsedData && (
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full border text-sm text-gray-800 bg-gray-50 rounded-lg">
            <tbody>
              {["beneficiaryName", "bankName", "ifscCode", "accountNumber"].map(
                (key) => (
                  <tr key={key} className="border-b last:border-none">
                    <td className="px-3 py-2 font-semibold capitalize w-1/3">
                      {key.replace(/([A-Z])/g, " $1")}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={parsedData[key] || ""}
                        onChange={(e) =>
                          handleEditChange(key, e.target.value)
                        }
                        className="border rounded-md px-2 py-1 w-full text-gray-700 focus:outline-none focus:ring focus:ring-blue-300"
                      />
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          <div className="flex justify-end mt-4">
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
            >
              Save Updated Data
            </button>
          </div>
        </div>
      )}

      {/* Raw OCR Text (debug) */}
      {rawText && (
        <details className="mt-4 text-xs text-gray-500">
          <summary className="cursor-pointer">Show raw extracted text</summary>
          <div className="mt-2 whitespace-pre-wrap max-h-64 overflow-y-auto">
            {rawText || "(empty)"}
          </div>
        </details>
      )}
    </div>
  );
};

export default BankUpload;
