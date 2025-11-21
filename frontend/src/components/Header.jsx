import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const isLoggedIn= true //||localStorage.getItem("isLoggedIn")
  const navLinks = isLoggedIn
  ? [
      { label: "Home", href: "/" },
      { label: "Upload & Generate PDF", href: "/upload-doc" },
      // { label: "Profile", href: "/profile" },
    ]
  : [
      { label: "Home", href: "/" },
      // { label: "Login", href: "/login" },
      // { label: "Signup", href: "/signup" },
    ];


  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between py-4 px-4">
        
        {/* Logo */}
        <div className="text-2xl font-bold text-indigo-700">AutoFill360</div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 text-gray-700 font-medium">
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hover:text-indigo-600 transition"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden bg-white border-t shadow-inner">
          <nav className="flex flex-col py-3 px-4 gap-3 text-gray-700 font-medium">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-2 hover:text-indigo-600 transition"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
