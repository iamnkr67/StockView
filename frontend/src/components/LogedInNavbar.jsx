import React, { useState, useEffect, useRef } from "react";
import { IoMdMenu, IoMdClose, IoMdLogOut, IoMdList } from "react-icons/io";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useStock } from "../context/StockContext";

const LNavbar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [stock, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [wishlistModalOpen, setWishlistModalOpen] = useState(false);
  const [wishlist, setWishlist] = useState([]);

  const profileImage = null;
  const navigate = useNavigate();
  const { setSelectedStock } = useStock();
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
        setFilteredStocks([]);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    fetch("/stock.json")
      .then((res) => res.json())
      .then((data) => setStocks(data))
      .catch((err) => console.error("Failed to fetch stocks: ", err));
  }, []);

  useEffect(() => {
    const searchStock = setTimeout(() => {
      if (searchQuery.trim() === "") {
        setFilteredStocks([]);
        return;
      }

      const filtered = stock.filter(
        (stock) =>
          stock["Issuer Name"]
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          stock["Security Id"]
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          stock["Sector Name"]
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );

      setFilteredStocks(filtered.slice(0, 11));
    }, 300);
    return () => clearTimeout(searchStock);
  }, [searchQuery, stock]);

  const fetchWishlist = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser?.email) return;

    try {
      const res = await fetch(
        `https://stockviewback.onrender.com/stock/wishlist/${storedUser.email}`,
      );
      const data = await res.json();
      setWishlist(data);
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    }
  };

  const handleStockClick = (stock) => {
    setSearchQuery("");
    setFilteredStocks([]);
    setSelectedStock(stock);
    navigate(`/stock/${encodeURIComponent(stock["Security Id"])}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully! 🚪");
    window.dispatchEvent(new Event("storage"));
    navigate("/");
  };

  const handleEnterKey = (e) => {
    if (e.key === "Enter" && filteredStocks.length > 0) {
      e.preventDefault();
      handleStockClick(filteredStocks[0]);
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
          <a href="/">
            <h1 className="font-bold text-2xl">
              Stock<span className="text-secondary font-extrabold">View</span>
            </h1>
          </a>

          <div
            className="relative w-full flex flex-col items-center"
            ref={menuRef}
          >
            <form className="hidden lg:flex w-1/3">
              <input
                ref={searchRef}
                type="text"
                placeholder="Search Your Favourite Stocks/MF/ETFs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleEnterKey}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </form>

            {filteredStocks.length > 0 && (
              <div
                className="absolute mt-11 w-1/3 max-h-72 overflow-y-hidden bg-white bg-opacity-90 backdrop-blur-md shadow-lg rounded-lg z-50"
                style={{ border: "1px solid #ddd", overflowX: "hidden" }}
                ref={dropdownRef}
              >
                {filteredStocks.map((stock, index) => (
                  <div
                    key={index}
                    className="stock-item p-2 border-b border-secondary last:border-b-0 hover:bg-secondary hover:text-dark cursor-pointer"
                    onClick={() => handleStockClick(stock)}
                  >
                    <h3>
                      {stock["Issuer Name"]}{" "}
                      <span className="text-secondary hover:text-white">
                        ({stock["Security Id"]}){" "}
                      </span>
                    </h3>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
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
                  className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50"
                >
                  {/* Wishlist Button */}
                  <button
                    onClick={() => {
                      setWishlistModalOpen(true);
                      fetchWishlist();
                      setShowDropdown(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100"
                  >
                    <IoMdList />
                    Wishlist
                  </button>

                  {/* Logout Button */}
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
                onKeyDown={handleEnterKey}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </form>
            <button onClick={handleSignOut} className="primary-btn mt-4 w-full">
              Sign Out
            </button>
          </motion.div>
        )}
      </nav>

      {/* Wishlist Modal */}
      {wishlistModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-11/12 max-w-sm relative">
            <button
              onClick={() => setWishlistModalOpen(false)}
              className="absolute top-2 right-4 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold text-secondary mb-4">
              Your Wishlist
            </h2>
            {wishlist.length === 0 ? (
              <p className="text-sm text-gray-500 text-center">
                No items in wishlist.
              </p>
            ) : (
              <ul className="space-y-2">
                {wishlist.map((item) => (
                  <li
                    key={item.stockId}
                    className="hover:bg-gray-100 p-2 rounded-md cursor-pointer transition"
                    onClick={() => {
                      setWishlistModalOpen(false);
                      navigate(`/stock/${item.stockId}`);
                    }}
                  >
                    {item.stockName}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <ToastContainer />
    </>
  );
};

export default LNavbar;
