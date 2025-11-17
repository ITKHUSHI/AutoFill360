import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

// ✅ Use matching pdfjs-dist worker from CDN (future-proof)
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PdfPreviewer = ({ pdfUrl, scale = 1.2 }) => {
  const [numPages, setNumPages] = useState(null);

  const onLoadSuccess = ({ numPages }) => setNumPages(numPages);

  // ✅ Support both URL and Uint8Array-based PDF data
  const file =
    pdfUrl instanceof Uint8Array
      ? { data: pdfUrl }
      : typeof pdfUrl === "string"
      ? { url: pdfUrl }
      : null;

  if (!file) {
    return <p className="text-gray-500 text-center">No PDF available.</p>;
  }

  return (
    <div
      style={{
        width: "100%",
        height: "90vh",
        overflowY: "auto",
        background: "#f9fafb",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "8px",
      }}
    >
      <Document
        file={file}
        onLoadSuccess={onLoadSuccess}
        loading={<p className="text-center text-gray-500">Loading PDF...</p>}
        error={<p className="text-center text-red-500">Failed to load PDF.</p>}
      >
        {Array.from(new Array(numPages), (el, index) => (
          <div key={`page_${index + 1}`} style={{ marginBottom: "1rem" }}>
            <Page
              pageNumber={index + 1}
              scale={scale}
              renderAnnotationLayer
              renderTextLayer
            />
          </div>
        ))}
      </Document>
    </div>
  );
};

export default PdfPreviewer;
