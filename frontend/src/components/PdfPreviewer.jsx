import React, { useState, useMemo, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PdfPreviewer = ({ pdfUrl }) => {
  const [numPages, setNumPages] = useState(null);
  const [width, setWidth] = useState(320);
  const [scale, setScale] = useState(1); // 🔥 allows zoom on mobile
  const containerRef = useRef(null);

  const file = useMemo(() => {
    if (pdfUrl instanceof Uint8Array) return { data: pdfUrl };
    if (typeof pdfUrl === "string") return { url: pdfUrl };
    return null;
  }, [pdfUrl]);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        setWidth(w);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  if (!file)
    return <p className="text-center text-gray-500">No PDF available.</p>;

  return (
    <div className="relative">
      {/* 🔥 Mobile zoom controls */}
      <div className="flex items-center justify-center gap-3 mb-2 sticky top-0 bg-white py-2 z-50 shadow">
        <button
          className="px-3 py-1 bg-gray-200 rounded"
          onClick={() => setScale(prev => Math.max(prev - 0.2, 0.6))}
        >
          -
        </button>
        <span className="text-sm font-medium">Zoom: {(scale * 100).toFixed(0)}%</span>
        <button
          className="px-3 py-1 bg-gray-200 rounded"
          onClick={() => setScale(prev => Math.min(prev + 0.2, 3))}
        >
          +
        </button>
      </div>

      <div
        ref={containerRef}
        className="w-full h-[85vh] overflow-y-auto bg-gray-100 rounded-lg p-2"
        style={{ touchAction: "pan-y pinch-zoom" }} // 🔥 enables pinch zoom on mobile
      >
        <Document
          file={file}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={<p className="text-center text-gray-500">Loading PDF...</p>}
          error={<p className="text-center text-red-500">Failed to load PDF.</p>}
        >
          {Array.from({ length: numPages }, (_, i) => (
            <div key={i} className="flex justify-center mb-4">
              <Page
                pageNumber={i + 1}
                width={width * scale}  // 🔥 Real mobile scaling
                renderAnnotationLayer={false}
                renderTextLayer={true}
              />
            </div>
          ))}
        </Document>
      </div>
    </div>
  );
};

export default PdfPreviewer;
