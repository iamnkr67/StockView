import React from "react";
import { FaInstagram, FaWhatsapp, FaYoutube } from "react-icons/fa";
import { TbWorldWww } from "react-icons/tb";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="py-28 bg-[#f7f7f7]">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="container"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-14 md:gap-4">
          {/* first section */}
          <div className="space-y-4 max-w-[300px]">
            <h1 className="text-2xl font-bold">StockView</h1>
            <p className="text-dark2">StockView is stock website.......</p>
          </div>
          {/* second section */}
          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">Products</h1>
              <div className="text-dark2">
                <ul className="space-y-2 text-lg">
                  <li className="cursor-pointer hover:text-secondary duration-200">
                    Stocks
                  </li>
                  <li className="cursor-pointer hover:text-secondary duration-200">
                    Futures & Options
                  </li>
                  <li className="cursor-pointer hover:text-secondary duration-200">
                    MTF
                  </li>
                  <li className="cursor-pointer hover:text-secondary duration-200">
                    IPO
                  </li>
                  <li className="cursor-pointer hover:text-secondary duration-200">
                    Mutual Funds
                  </li>
                  <li className="cursor-pointer hover:text-secondary duration-200">
                    NFO
                  </li>
                  <li className="cursor-pointer hover:text-secondary duration-200">
                    ETF
                  </li>
                </ul>
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">Quick Links</h1>
              <div className="text-dark2">
                <ul className="space-y-2 text-lg">
                  <li className="cursor-pointer hover:text-secondary duration-200">
                    Calculators
                  </li>
                  <li className="cursor-pointer hover:text-secondary duration-200">
                    Glossary
                  </li>
                  <li className="cursor-pointer hover:text-secondary duration-200">
                    Web Stories
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {/* third section */}
          <div className="space-y-4 max-w-[300px]">
            <h1 className="text-2xl font-bold">Get In Touch</h1>
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Enter your email"
                className="p-3 rounded-s-xl bg-white w-full py-4 focus:ring-0 focus:outline-none placeholder:text-dark2"
              />
              <button className="bg-secondary text-white font-semibold py-4 px-6 rounded-e-xl">
                Go
              </button>
            </div>
            {/* social icons */}
            <div className="flex space-x-6 py-3">
              <a href="https://chat.whatsapp.com/randommmm">
                <FaWhatsapp className="cursor-pointer hover:text-primary hover:scale-105 duration-200" />
              </a>
              <a href="https://www.instagram.com/nitesh_shah67/">
                <FaInstagram className="cursor-pointer hover:text-primary hover:scale-105 duration-200" />
              </a>
              <a href="https://www.youtube.com/@StockView">
                <FaYoutube className="cursor-pointer hover:text-primary hover:scale-105 duration-200" />
              </a>
            </div>
            <div>
              <p className="text-sm text-black">All Rights Reserved © 2025</p>
              <p className="text-sm text-black mt-2">
                Made with <span className="text-red-500">❤</span> by{" "}
                <a
                  className="text-blue-400"
                  href="https://instagram.com/sri__1448"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ViNee Tech
                </a>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
