export default function Footer() {
  return (
    <footer className="bg-gray-50 text-gray-900 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10">

        {/* Brand / About */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">AutoFill360</h3>
          <p className="text-sm text-gray-700">
            Smart document processing and automated PDF generation.  
            Built for speed and accuracy.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              <a href="/" className="hover:text-indigo-600 transition">Home</a>
            </li>
            <li>
              <a href="/upload-doc" className="hover:text-indigo-600 transition">Upload Documents</a>
            </li>
            {/* <li>
              <a href="/billing" className="hover:text-indigo-600 transition">Pricing & Plans</a>
            </li> */}
          </ul>
        </div>

        {/* Contact & Legal */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Contact & Legal</h4>
          <p className="text-sm text-gray-700">Email: khushee0225@gmail.com</p>
          <p className="text-sm text-gray-700 mt-2">
            <a href="/terms" className="hover:text-indigo-600 transition">Terms & Conditions</a>
          </p>
          <p className="text-sm text-gray-700 mt-1">
            All rights reserved © {new Date().getFullYear()} AutoFill360.
          </p>
        </div>

      </div>
    </footer>
  );
}
