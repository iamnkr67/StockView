import React, { useState, useEffect, useRef } from "react";
import { IoMdMenu, IoMdClose, IoMdLogOut, IoMdSettings } from "react-icons/io";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LNavbar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [profileImage, setProfileImage] = useState(
    localStorage.getItem("profileImage") || null,
  );

  const menuRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("profileImage");
    toast.success("Logged out successfully! 🚪");
    window.dispatchEvent(new Event("storage"));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        localStorage.setItem("profileImage", reader.result);
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const userName = user?.name || "User";
  const profileInitial = userName.charAt(0).toUpperCase();

  return (
    <>
      <nav className="sticky top-0 z-50 shadow-sm w-full bg-white backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="container py-4 px-5 flex justify-between items-center"
        >
          {/* Logo */}
          <a href="/">
            <h1 className="font-bold text-2xl">
              Stock<span className="text-secondary font-extrabold">View</span>
            </h1>
          </a>

          {/* Search Box - Hidden on Mobile */}
          <form onSubmit={handleSearch} className="hidden lg:flex w-1/3">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </form>

          {/* Profile & Menu */}
          <div className="flex items-center gap-4">
            {/* Profile Dropdown */}
            <div className="relative">
              <button onClick={() => setShowDropdown(!showDropdown)}>
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold text-white">
                    {profileInitial}
                  </div>
                )}
              </button>

              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  ref={dropdownRef}
                  className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg"
                >
                  <label
                    htmlFor="file-upload"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <IoMdSettings />
                    Edit Profile
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 w-full text-red-600 hover:bg-gray-100"
                  >
                    <IoMdLogOut />
                    Logout
                  </button>
                </motion.div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? (
                  <IoMdClose className="text-4xl" />
                ) : (
                  <IoMdMenu className="text-4xl" />
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3 }}
            ref={menuRef}
            className="fixed top-0 right-0 w-64 h-full bg-white shadow-lg p-6 flex flex-col z-50"
          >
            <form onSubmit={handleSearch} className="mb-4">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </form>
            <button onClick={handleSignOut} className="primary-btn mt-4 w-full">
              Sign Out
            </button>
          </motion.div>
        )}
      </nav>

      <ToastContainer />
    </>
  );
};

export default LNavbar;
