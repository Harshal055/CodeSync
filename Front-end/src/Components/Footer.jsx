import React from 'react';
import { FaFacebookF, FaLinkedinIn, FaDiscord, FaYoutube, FaInstagram, FaHeadset } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";

const Footer = () => (
  <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white py-12">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Company Info */}
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold mb-4">Code Sync</h2>
          <p className="text-gray-300 mb-4">
            Empowering developers to collaborate and create amazing projects together.
          </p>
          <p className="text-gray-400">&copy; 2025 Code Sync. All rights reserved.</p>
        </div>

        {/* Customer Support */}
        <div className="text-center">
          <div className="flex items-center justify-center md:justify-start mb-4">
            <FaHeadset className="text-3xl text-blue-400 mr-2" />
            <h3 className="text-xl font-semibold">Customer Support</h3>
          </div>
          <p className="text-gray-300 mb-2">24/7 Live Support</p>
          <a href="mailto:support@codesync.com" 
             className="text-blue-400 hover:text-blue-300 transition-colors duration-300">
            support@codesync.com
          </a>
          <p className="text-gray-300 mt-2">
            Phone: +1 (555) 123-4567
          </p>
        </div>

        {/* Social Links */}
        <div className="text-center md:text-right">
          <h3 className="text-xl font-semibold mb-4">Connect With Us</h3>
          <div className="flex justify-center md:justify-end space-x-6">
            <a 
              href="#" 
              className="hover:text-blue-400 text-2xl transition-all duration-300 transform hover:scale-110"
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>
            <a 
              href="#" 
              className="hover:text-gray-400 text-2xl transition-all duration-300 transform hover:scale-110"
              aria-label="Twitter"
            >
              <FaXTwitter />
            </a>
            <a 
              href="#" 
              className="hover:text-blue-600 text-2xl transition-all duration-300 transform hover:scale-110"
              aria-label="LinkedIn"
            >
              <FaLinkedinIn />
            </a>
            <a 
              href="#" 
              className="hover:text-pink-500 text-2xl transition-all duration-300 transform hover:scale-110"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a 
              href="#" 
              className="hover:text-indigo-500 text-2xl transition-all duration-300 transform hover:scale-110"
              aria-label="Discord"
            >
              <FaDiscord />
            </a>
            <a 
              href="#" 
              className="hover:text-red-500 text-2xl transition-all duration-300 transform hover:scale-110"
              aria-label="YouTube"
            >
              <FaYoutube />
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;