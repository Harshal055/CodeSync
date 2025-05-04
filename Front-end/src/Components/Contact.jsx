import React from 'react';
; // Correct path to Footer
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';
import Navbar from '../Pages/Navbar';
import Footer from './Footer';

const Contact = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-12 md:py-20">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800 dark:text-white mb-12">
          Get In Touch
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-6">Send Us a Message</h2>
            <form>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-600 dark:text-gray-400 mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your Name"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-600 dark:text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="subject" className="block text-gray-600 dark:text-gray-400 mb-2">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Subject of your message"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="message" className="block text-gray-600 dark:text-gray-400 mb-2">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Write your message here..."
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white p-8 rounded-lg shadow-lg flex flex-col justify-center">
            <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
            <p className="text-gray-300 mb-6">Feel free to reach out to us through any of the following methods:</p>
            <div className="space-y-4">
              <div className="flex items-center">
                <FaEnvelope className="text-xl text-blue-400 mr-3" />
                <a href="mailto:support@codesync.com" className="text-gray-200 hover:text-blue-300 transition-colors">support@codesync.com</a>
              </div>
              <div className="flex items-center">
                <FaPhoneAlt className="text-xl text-blue-400 mr-3" />
                <span className="text-gray-200">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <FaMapMarkerAlt className="text-xl text-blue-400 mr-3" />
                <span className="text-gray-200">123 CodeSync Ave, Dev City, DC 54321</span>
              </div>
            </div>
            <p className="text-gray-400 mt-8">We typically respond within 24 business hours.</p>
          </div>
        </div>
      </main>   
    </div>
  );
};

export default Contact;