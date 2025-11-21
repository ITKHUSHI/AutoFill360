import React from "react";
import Billing from "../components/Billing";

export default function Home() {

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-900">
      {/* HERO */}
      <section className="w-full px-6 md:px-14 lg:px-24 py-14 flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Automate Your PDF Filling With <span className="text-blue-600">AutoFill360</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-xl">
             Upload your documents and instantly generate filled PDFs, saving hours of manual work          </p>
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg rounded-xl shadow-md">
            Get Started
          </button>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-md shadow-xl rounded-2xl overflow-hidden border bg-white">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsfPDzYPZVsBRYR4FrPn4WOAk1Kg39fM9MtQ&s" className="w-full h-auto" />
          </div>
        </div>
      </section>

      {/* HOW IT Works */}
      <section className="w-full px-6 md:px-14 lg:px-24 py-16 bg-white">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">How It Works</h2>
        <div className="grid md:grid-cols-2 gap-10">
          <div className="p-6 rounded-2xl shadow bg-gray-50 border">
            <h3 className="text-xl font-semibold mb-3">1. Upload Documents</h3>
            <p className="text-gray-600">Upload any JPG/PDF. Our tool converts it into a mappable canvas instantly.</p>
          </div>
          <div className="p-6 rounded-2xl shadow bg-gray-50 border">
            <h3 className="text-xl font-semibold mb-3">2. Auto-Fill PDFs</h3>
            <p className="text-gray-600">Pre Defined templates to fill PDFs automatically with dynamic data.</p>
          </div>
        </div>
      </section>
      <section className="w-full px-6 md:px-14 lg:px-24 py-16 bg-white">
          {/* <Billing/> */}
      </section>


    </div>
  );
}
