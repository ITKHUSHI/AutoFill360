import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
import Tesseract from "tesseract.js";
import toast from "react-hot-toast";

// PDF worker
GlobalWorkerOptions.workerSrc = new URL( "pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url ).toString();
// Clean text helper
const cleanTextPreserveLines = (text = "") =>
  text
    .replace(/[^\x00-\x7F\n\r]/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\r\n?/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();

// Parse Aadhaar text into fields
const parseAadharText = (raw = "") => {
  const text = cleanTextPreserveLines(raw);
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const findLine = (rx) => {
    const idx = lines.findIndex((l) => rx.test(l));
    return idx >= 0 ? { idx, line: lines[idx] } : null;
  };

  // Aadhaar number
  let aadhaar = "";
  for (const l of lines) {
    const digits = l.replace(/\D/g, "");
    if (digits.length === 12 && !/VID/i.test(l)) {
      const match = l.match(/(\d{4})\s?(\d{4})\s?(\d{4})/);
      aadhaar = match ? `${match[1]} ${match[2]} ${match[3]}` : digits;
      break;
    }
  }
  const aadhaarLast4 = aadhaar.replace(/\s/g, "").slice(-4);

  // DOB
  const dobMatch = text.match(/\b(\d{2}\/\d{2}\/\d{4})\b/);
  const dob = dobMatch ? dobMatch[1] : "";

  // Mobile
  const mobileMatch = text.match(/\b([6-9]\d{9})\b/);
  const mobile = mobileMatch ? mobileMatch[1] : "";

  // Owner Name
  const soObj = findLine(/\b(S\/O|D\/O)\b/i);
  let ownerName = "";
  if (soObj && soObj.idx > 0) {
    const candidate = lines[soObj.idx - 1].replace(/[^A-Za-z\s]/g, "").trim();
    if (candidate.length > 1) ownerName = candidate;
  }
  if (!ownerName) {
    const nameLine = lines.find((l) => /^[A-Z][a-zA-Z]+\s+[A-Z][a-zA-Z]+/.test(l));
    if (nameLine) ownerName = nameLine;
  }
  if (!ownerName) {
    const skipRx = /\b(Government|Unique|Aadhaar|UIDAI|Enrolment|DOB|Date|Mobile|Authentication|Download|mAadhaar)\b/i;
    ownerName = lines.find((l) => !skipRx.test(l) && /[A-Za-z]/.test(l)) || "";
  }
  let firstName = "", lastName = "";
  if (ownerName) {
    const parts = ownerName.split(/\s+/).filter(Boolean);
    firstName = parts[0];
    lastName = parts.length > 1 ? parts[parts.length - 1] : "";
  }

  // Pincode
  const pincodeMatch = text.match(/\b(\d{6})\b/);
  const pincode = pincodeMatch ? pincodeMatch[1] : "";

  // State
  let state = "";
  const stateObj = findLine(/\bState\b[:\-]?/i);
  if (stateObj) state = stateObj.line.replace(/\bState\b[:\-]?\s*/i, "").trim();
  else if (pincode) {
    const lineWithPin = lines.find((l) => l.includes(pincode));
    if (lineWithPin) {
      const tokens = lineWithPin.replace(pincode, "").trim().split(/[,\s]+/).filter(Boolean);
      if (tokens.length > 0) state = tokens[tokens.length - 1];
    }
  }

  // District
  let district = "";
  const distObj = findLine(/\b(Dist|District|Distt)\b[:\-]?/i);
  if (distObj) district = distObj.line.replace(/\b(Dist|District|Distt)\b[:\-]?\s*/i, "").trim();

  // City
  let city = "";
  const cityObj = findLine(/\b(VTC|Village|Town|City|Sub-district|Sub District)\b[:\-]?/i);
  if (cityObj) city = cityObj.line.replace(/\b(VTC|Village|Town|City|Sub-district|Sub District)\b[:\-]?\s*/i, "").trim();

  // Address
  let startIdx = soObj ? soObj.idx + 1 : 0;
  const addressBuffers = [];
  const stopRx = /\b(DOB|Date|Mobile|Enrolment|Download|UIDAI|Aadhaar|Government|Authentication|Email)\b/i;
  for (let i = startIdx; i < lines.length; i++) {
    const l = lines[i];
    if (!l) continue;
    if (stopRx.test(l)) break;
    if (/^\d{1,4}$/.test(l)) continue;
    if (/[A-Za-z]/.test(l)) {
      addressBuffers.push(l.replace(/\b(VTC|Village|PO|Post Office|Dist|District|State|PIN Code|PIN)\b[:\-]?\s*/gi, "").trim());
    }
  }
  let address = Array.from(new Set(addressBuffers)).join(", ");
  if (pincode && !address.includes(pincode)) address = address ? `${address}, ${pincode}` : pincode;

  // Gender
  const genderMatch = text.match(/(MALE|FEMALE|पुरुष|महिला)/i);
  let gender = "";
  if (genderMatch) {
    const g = genderMatch[0].toUpperCase();
    if (g.includes("MALE") || g.includes("पुरुष")) gender = "MALE";
    else if (g.includes("FEMALE") || g.includes("महिला")) gender = "FEMALE";
  }

  return {
    firstName,
    lastName,
    aadhaarLast4,
    dob,
    mobile,
    city,
    district,
    state,
    pincode,
    address,
    gender,
    nominee: "",
    relationWithnominee: "",
  };
};

// Component
const AadharUpload = ({ onDataExtracted }) => {
  const [parsedData, setParsedData] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rawText, setRawText] = useState("");

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setParsedData(null);
    setError("");
    setRawText("");
    setLoading(true);

    try {
      const text = await extractText(file);
      setRawText(text);
      const data = parseAadharText(text);
      setParsedData(data);
      onDataExtracted && onDataExtracted(data);
    } catch (err) {
      toast.error("Extraction error: " + (err.message || err));
      setError("Failed to extract text");
    } finally {
      setLoading(false);
    }
  };

  const extractText = async (file) => {
    if (file.type === "application/pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = "";

      // Attempt text extraction for all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((it) => it.str).join(" ");
        text += pageText + "\n";
      }

      if (text.replace(/\s/g, "").length > 20) return text;

      // Fallback OCR for all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext("2d");
        await page.render({ canvasContext: context, viewport }).promise;
        const imageData = canvas.toDataURL("image/png");
        const result = await Tesseract.recognize(imageData, "eng+hin");
        text += result.data.text + "\n";
      }
      return text;
    }

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const result = await Tesseract.recognize(reader.result, "eng+hin");
            resolve(result.data.text || "");
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    throw new Error("Unsupported file type");
  };

  const handleEditChange = (key, value) => {
    setParsedData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    toast.success("Data updated successfully!");
    onDataExtracted && onDataExtracted(parsedData);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      <h3 className="text-xl font-semibold mb-3">Aadhar Upload (PDF/JPG)</h3>

      <input
        type="file"
        accept="application/pdf,image/jpeg,image/jpg"
        onChange={handleFileUpload}
        className="mb-3 block text-sm text-gray-500 border-2 rounded-2xl
          file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
          file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />

      {fileName && <p className="text-sm text-gray-700 mb-2">📄 {fileName}</p>}
      {loading && <p className="text-gray-600 italic">Extracting data...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {parsedData && (
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full border text-sm text-gray-800 bg-gray-50 rounded-lg">
            <tbody>
              {[
                "firstName","lastName","aadhaarLast4","dob","mobile",
                "city","district","state","pincode","address","gender","nominee","relationWithnominee"
              ].map((key) => (
                <tr key={key} className="border-b last:border-none">
                  <td className="px-3 py-2 font-semibold capitalize w-1/3">{key}</td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={parsedData[key] || ""}
                      onChange={(e) => handleEditChange(key, e.target.value)}
                      className="border rounded-md px-2 py-1 w-full text-gray-700 focus:outline-none focus:ring focus:ring-blue-300"
                    />
                  </td>
                </tr>
              ))}
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

      {rawText && (
        <details className="mt-4 text-xs text-gray-500">
          <summary className="cursor-pointer">Show raw extracted text</summary>
          <div className="mt-2 whitespace-pre-wrap max-h-64 overflow-y-auto">{rawText || "(empty)"}</div>
        </details>
      )}
    </div>
  );
};

export default AadharUpload;
