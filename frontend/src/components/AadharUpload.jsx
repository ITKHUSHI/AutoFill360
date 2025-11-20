import React, { useCallback, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
import Tesseract from "tesseract.js";
import toast from "react-hot-toast";

// PDF worker
GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const cleanText = (t = "") =>
  t
    .replace(/[^\x00-\x7F\n\r]/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\r\n?/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();

const extract = (text, regex) => {
  const m = text.match(regex);
  return m ? m[1].trim() : "";
};

const parseAadharText = (raw = "") => {
  const text = cleanText(raw);

  // -------------------------
  // BASIC FIELDS
  // -------------------------
  const dob = extract(text, /DOB\s*[:\-]?\s*(\d{2}\/\d{2}\/\d{4})/i);

  const genderRaw = extract(text, /(MALE|FEMALE|पुरुष|महिला)/i).toUpperCase();
  let gender = "";
  if (genderRaw.includes("MALE") || genderRaw.includes("पुरुष")) gender = "MALE";
  else if (genderRaw.includes("FEMALE") || genderRaw.includes("महिला")) gender = "FEMALE";

  const pincode =
    extract(text, /PIN\s*Code\s*[:\-]?\s*(\d{6})/i) ||
    extract(text, /\b(\d{6})\b/);

  const state = extract(text, /State\s*[:\-]?\s*([A-Za-z ]+)/i);
  const district =
    extract(text, /District\s*[:\-]?\s*([A-Za-z ]+)/i) ||
    extract(text, /Dist\s*[:\-]?\s*([A-Za-z ]+)/i);

  const city = extract(text, /VTC\s*[:\-]?\s*([A-Za-z ]+)/i);

  // Aadhaar 12-digit
      const aadhaarLast4 = extract(text,/Mobile\s*:\s*[6-9]\d{9}\s+(\d{4}\s\d{4}\s\d{4})/i).slice(-4);


  const mobile = extract(text, /\b([6-9]\d{9})\b/);

  // -------------------------
  // OWNER NAME (fallback)
  // -------------------------
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  let ownerName = "";
  for (const l of lines) {
    if (/S\/O|D\/O/i.test(l)) {
      const idx = lines.indexOf(l);
      if (idx > 0) ownerName = lines[idx - 1];
    }
  }
  if (!ownerName) {
    let guess = lines.find((l) => /^[A-Za-z]+\s+[A-Za-z]+/.test(l));
    ownerName = guess || "";
  }

  const parts = ownerName.split(/\s+/);
  const firstName = parts[0] || "";
  const lastName = parts.length > 1 ? parts[parts.length - 1] : "";

  // -------------------------
  // NOMINEE EXTRACTION
  // -------------------------
 const extractNominee = (raw) => {
  const match = raw.match(/(?:S\s*\/\s*O|W\s*\/\s*O|C\s*\/\s*O)\s*[:\-]?\s*([A-Za-z ]+)/i);
  return match ? match[1].trim() : "";
};


  const nominee = extractNominee(text);

  // -------------------------
  // ADDRESS CLEANING
  // -------------------------
  let addressRaw =
    extract(text, /Address\s*[:\-]?\s*(.+?)(?=\d{6}|$)/is) || "";

  // Remove S/O W/O C/O chunk entirely
addressRaw = addressRaw.replace(
  /(S\s*\/\s*O|W\s*\/\s*O|C\s*\/\s*O)\s*[:\-]?\s*[A-Za-z ]+,?/gi,
  ""
);
  // Remove PO:, DIST:
  addressRaw = addressRaw.replace(/PO\s*[:\-]?/gi, "");
  addressRaw = addressRaw.replace(/DIST\s*[:\-]?/gi, "");
  addressRaw = addressRaw.replace(/DISTR?ICT?\s*[:\-]?/gi, "");

  // Clean punctuation
  let address = addressRaw
    .replace(/,+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

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
    nominee,
    relationWithnominee: "",
  };
};

const extractTextFromPDF = async (file) => {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let extracted = "";

  // Try text extraction
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const cont = await page.getTextContent();
    extracted += cont.items.map((it) => it.str).join(" ") + "\n";
  }

  if (extracted.replace(/\s/g, "").length > 20) return extracted;

  // OCR fallback
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;

    const img = canvas.toDataURL("image/png");
    const res = await Tesseract.recognize(img, "eng+hin");
    extracted += res.data.text + "\n";
  }

  return extracted;
};

const extractTextFromImage = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = async () => {
      try {
        const res = await Tesseract.recognize(r.result, "eng+hin");
        resolve(res.data.text);
      } catch (e) {
        reject(e);
      }
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });

const AadharUpload = ({ onDataExtracted }) => {
  const [parsed, setParsed] = useState(null);
  const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFiles = useCallback(async (file) => {
    setLoading(true);
    setParsed(null);
    setRaw("");

    try {
      let text = "";
      if (file.type === "application/pdf") text = await extractTextFromPDF(file);
      else text = await extractTextFromImage(file);

      setRaw(text);
      const data = parseAadharText(text);
      setParsed(data);
      onDataExtracted && onDataExtracted(data);
    } catch (err) {
      toast.error("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFiles(file);
  };

  return (
    <div className="bg-white shadow p-5 rounded-xl">
      <h2 className="text-lg font-semibold mb-3">Aadhaar Upload</h2>

      {/* ---------------- DROP ZONE ---------------- */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="border-2 border-dashed border-gray-400 bg-gray-50 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-100"
        onClick={() => document.getElementById("filePick").click()}
      >
        <p className="text-gray-600">Drag & Drop PDF / Image here</p>
        <p className="text-sm text-gray-400 mt-1">or click to browse</p>
      </div>

      <input
        id="filePick"
        type="file"
        accept="application/pdf,image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files[0])}
      />

      {loading && <p className="mt-3 text-gray-500 italic">Extracting...</p>}

      {/* ---------------- TABLE ---------------- */}
      {parsed && (
        <div className="mt-5">
          <table className="w-full border text-sm rounded-lg bg-gray-50">
            <tbody>
              {Object.keys(parsed).map((key) => (
                <tr key={key} className="border-b">
                  <td className="p-2 font-semibold w-1/3 capitalize">{key}</td>
                  <td className="p-2">
                    <input
                      className="w-full border px-2 py-1 rounded-md"
                      value={parsed[key] || ""}
                      onChange={(e) =>
                        setParsed((p) => ({ ...p, [key]: e.target.value }))
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
            onClick={() => {
              toast.success("Updated!");
              onDataExtracted && onDataExtracted(parsed);
            }}
          >
            Save Updated
          </button>
        </div>
      )}

      {/* ---------------- RAW TEXT ---------------- */}
      {raw && (
        <details className="mt-4 text-xs text-gray-500">
          <summary>Raw Extracted Text</summary>
          <div className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap">
            {raw}
          </div>
        </details>
      )}
    </div>
  );
};

export default AadharUpload;
