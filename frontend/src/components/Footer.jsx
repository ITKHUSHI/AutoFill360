export default function Footer() {
  return (
    <footer className=" bg-white  text-gray-900 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-10">

        <div>
          <h3 className="text-lg font-semibold text-white mb-3">DocGen</h3>
          <p className="text-sm">
            Smart document processing and automated PDF generation. 
            Built for speed and built for accuracy.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-gray-700">Home</a></li>
            {/* <li><a href="/upload" className="hover:text-gray-700">Upload Documents</a></li>
            <li><a href="/about" className="hover:text-gray-700">About</a></li>
            <li><a href="/contact" className="hover:text-gray-700">Contact</a></li> */}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
          <p className="text-sm">khushee0225@gmail.com</p>
          <p className="text-sm"></p>
        </div>

      </div>

      <div className="border-t border-gray-700 text-center py-4 text-sm">
        © {new Date().getFullYear()} DocGen. All rights reserved.
      </div>
    </footer>
  );
}
