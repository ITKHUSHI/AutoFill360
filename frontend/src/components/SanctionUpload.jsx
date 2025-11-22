import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
import Tesseract from "tesseract.js";
import toast from "react-hot-toast";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

/* ------------------  HELPERS ------------------ */

const normalizeDate = (dateStr = "") => {
  if (!dateStr) return "";

  const months = {
    january: "01", february: "02", march: "03", april: "04",
    may: "05", june: "06", july: "07", august: "08",
    september: "09", october: "10", november: "11", december: "12",
    jan: "01", feb: "02", mar: "03", apr: "04",
    jun: "06", jul: "07", aug: "08", sep: "09",
    oct: "10", nov: "11", dec: "12",
  };

  const match = dateStr.match(/([A-Za-z]+)\s+(\d{1,2}),?\s*(\d{4})/);
  if (!match) return dateStr;

  const [, monthName, day, year] = match;
  const month = months[monthName.toLowerCase()] || "00";
  return `${day.padStart(2, "0")}/${month}/${year}`;
};

const normalizeText = (text = "") =>
  text.replace(/\s+/g, " ").replace(/[:]/g, "").trim();
const parseSanctionText = (raw = "") => {
  const text = normalizeText(raw);
  const find = (regex) => text.match(regex)?.[1]?.trim() || "";

  const rawName = find(/Dear\s+([A-Za-z\s]+),/i);

  let firstName = "";
  let middleName = "";
  let lastName = "";

  if (rawName) {
    const parts = rawName.split(/\s+/).filter(Boolean);

    if (parts.length === 1) {
      firstName = parts[0].toUpperCase();
    } 
    else if (parts.length === 2) {
      firstName = parts[0].toUpperCase();
      lastName = parts[1].toUpperCase();
    } 
    else if (parts.length >= 3) {
      firstName = parts[0].toUpperCase();
      lastName = parts[parts.length - 1].toUpperCase();
      middleName = parts.slice(1, -1).join(" ").toUpperCase();
    }
  }
  return {
    firstName,
    middleName,
    lastName,
    date: normalizeDate(find(/Date\s+([A-Za-z]+\s\d{1,2},?\s?\d{4})/i)),
    referenceNo: find(/Reference\s*No\.?\s*([A-Z0-9]+)/i),
    loanAmount: find(/Loan\s*Amount\s*(?:INR|Rs\.?)?\s*([\d,]+)/i),
    disbursement: find(/Disbursement\s*(?:INR|Rs\.?)?\s*([\d,]+)/i),
    tenure: find(/Tenure\s*([\d]+)/i),
    insurance: find(/TATA\s*AIG\s*(?:INR|Rs\.?)?\s*([\d,]+)/i),
    mobile: find(/\b(\d{10})\b/),
    email: find(/([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,})/i),
    
  };
};

/* ------------------  COMPONENT ------------------ */

const SanctionUpload = ({ onDataExtracted }) => {
  const [parsedData, setParsedData] = useState(null);
  const [editableData, setEditableData] = useState({});
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ------------- MAIN FILE HANDLER ------------- */

  const handleFileUpload = async (file) => {
    if (!file) return;

    setFileName(file.name);
    setParsedData(null);
    setEditableData({});
    setError("");
    setLoading(true);

    try {
      if (file.type === "application/pdf") {
        const reader = new FileReader();
        reader.onload = async () => {
          const typedarray = new Uint8Array(reader.result);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;

          let fullText = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            fullText += content.items.map((i) => i.str).join(" ") + " ";
          }

          processExtract(fullText);
        };
        reader.readAsArrayBuffer(file);
      }

      else if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = async () => {
          const result = await Tesseract.recognize(reader.result, "eng");
          processExtract(result.data.text);
        };
        reader.readAsDataURL(file);
      }

      else {
        setError("Only PDF or JPG supported.");
        setLoading(false);
      }

    } catch (err) {
      setError("Error while extracting text.");
      setLoading(false);
    }
  };

  /* Ensure input element triggers properly */
  const handleInputChange = (e) => {
    handleFileUpload(e.target.files[0]);
  };

  /* ------------- PROCESS TEXT ------------- */

  const processExtract = (rawText) => {
    const extracted = parseSanctionText(rawText);
    setParsedData(extracted);
    setEditableData(extracted);
    onDataExtracted && onDataExtracted(extracted);
    setLoading(false);
  };

  /* ------------- DRAG & DROP ------------- */

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  /* ------------- SAVE EDITS ------------- */

  const handleUpdate = () => {
    if (!Object.keys(editableData).length) return;
    onDataExtracted(editableData);
    toast.success("Data updated successfully!");
  };

  /* ------------------ JSX ------------------ */

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">

  {/* Title */}
  <h3 className="text-lg md:text-xl font-semibold mb-4">
    Sanction Upload (PDF/JPG)
  </h3>

  {/* Upload Box */}
  <div
    onDragOver={(e) => e.preventDefault()}
    onDrop={onDrop}
    onClick={() => document.getElementById("sanctionInput").click()}
    className="border-2 border-dashed border-gray-400 bg-gray-50 rounded-xl p-5 md:p-6 
               text-center cursor-pointer hover:bg-gray-100 transition"
  >
    <p className="text-gray-600 text-sm md:text-base">
      Drag & Drop PDF / Image here
    </p>
    <p className="text-xs text-gray-400 mt-1">or click to browse</p>
  </div>

  <input
    id="sanctionInput"
    type="file"
    accept="application/pdf,image/jpeg,image/jpg"
    onChange={handleInputChange}
    className="hidden"
  />

  {fileName && <p className="text-sm text-gray-700 mt-2">📄 {fileName}</p>}
  {loading && <p className="text-gray-600 italic mt-2">Extracting data...</p>}
  {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

  {/* Editable Table / Cards */}
  {parsedData && (
    <div className="mt-5">

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border text-sm bg-gray-50 rounded-lg">
          <tbody>
            {Object.entries(editableData).map(([key, val]) => (
              <tr key={key} className="border-b last:border-none">
                <td className="px-3 py-2 font-semibold capitalize w-48">
                  {key.replace(/([A-Z])/g, " $1")}
                </td>
                <td className="px-3 py-2">
                  <input
                    value={val || ""}
                    onChange={(e) =>
                      setEditableData({ ...editableData, [key]: e.target.value })
                    }
                    className="w-full px-2 py-1 border rounded-md 
                               focus:outline-none focus:ring focus:ring-blue-300"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {Object.entries(editableData).map(([key, val]) => (
          <div
            key={key}
            className="border rounded-lg p-3 bg-gray-50"
          >
            <p className="text-xs text-gray-500 mb-1 capitalize">
              {key.replace(/([A-Z])/g, " $1")}
            </p>

            <input
              value={val || ""}
              onChange={(e) =>
                setEditableData({ ...editableData, [key]: e.target.value })
              }
              className="w-full px-2 py-1 border rounded-md 
                         text-sm focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-end mt-4">
        <button
          onClick={handleUpdate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg 
                     font-semibold hover:bg-blue-700"
        >
          Save Updated Data
        </button>
      </div>
    </div>
  )}

  {/* Empty State */}
  {!parsedData && !loading && !error && (
    <div className="h-28 flex items-center justify-center text-gray-400 text-sm">
      Upload a sanction letter to extract details
    </div>
  )}
</div>

  );
};

export default SanctionUpload;


