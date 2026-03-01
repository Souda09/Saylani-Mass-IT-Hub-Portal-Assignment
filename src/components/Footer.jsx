import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    //  Background white/light gray kiya aur text dark
    <footer className="bg-white border-t border-gray-100 mt-16 rounded-t-[3rem] shadow-inner">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        
        {/* --- Column 1: Logo & Tagline --- */}
        <div className="space-y-4">
          <h2 className="text-3xl font-black text-[#0057a8]">
            Saylani <span className="text-[#66b032]">Portal</span>
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Empowering students through technology and education. Connecting hearts, building futures.
          </p>
          <div className="flex gap-4 pt-4 text-gray-400">
            {/* 👈 Icons ke colors theme ke mutabiq */}
            <FaFacebook className="hover:text-[#0057a8] cursor-pointer text-2xl transition-colors" />
            <FaInstagram className="hover:text-[#66b032] cursor-pointer text-2xl transition-colors" />
            <FaLinkedin className="hover:text-blue-600 cursor-pointer text-2xl transition-colors" />
            <FaYoutube className="hover:text-red-600 cursor-pointer text-2xl transition-colors" />
          </div>
        </div>

        {/* --- Column 2: Quick Links --- */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Links</h3>
          <ul className="space-y-3 text-sm">
            {['Home', 'Dashboard', 'Lost & Found', 'Complaints', 'About Us'].map(link => (
              <li key={link}>
                <a href="#" className="text-gray-600 hover:text-[#0057a8] flex items-center gap-2 transition-all hover:translate-x-2">
                  <span className="text-[#66b032]">→</span> {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* --- Column 3: Support --- */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Support</h3>
          <ul className="space-y-3 text-sm">
            {['FAQ', 'Contact Support', 'Privacy Policy', 'Terms of Service', 'Campus Map'].map(link => (
              <li key={link}>
                <a href="#" className="text-gray-600 hover:text-[#0057a8] flex items-center gap-2 transition-all hover:translate-x-2">
                  <span className="text-[#66b032]">→</span> {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* --- Column 4: Contact Info --- */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Contact</h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li>📍 Bahadurabad, Karachi</li>
            <li>📞 +92 21 111 729 526</li>
            <li>📧 info@saylani.com</li>
          </ul>
        </div>
      </div>

      {/* --- Bottom Bar --- */}
      <div className="border-t border-gray-100 text-center py-8 px-6 bg-gray-50/50 rounded-b-[3rem]">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Saylani Mass IT Training. All rights reserved.
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Designed with ❤️ for Saylani Students.
        </p>
      </div>
    </footer>
  );
};

export default Footer;