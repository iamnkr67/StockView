import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";
import LNavbar from "./components/LogedInNavbar.jsx";
import Footer from "./components/Footer";
import Hero from "./components/Hero/Hero.jsx";
import Services from "./components/sections/Services.jsx";
import Hero1 from "./components/Hero/Hero1.jsx";
import About from "./components/sections/AboutUs.jsx";
import Dashboard from "./pages/Dashboard.jsx";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token"), // Initial check
  );
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      setIsAuthenticated(!!localStorage.getItem("token"));
      setUser(storedUser);
      console.log("Auth status : ", user);
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  return (
    <Router>
      {isAuthenticated ? <LNavbar user={user} /> : <Navbar />}

      <main className="overflow-x-hidden bg-white text-dark">
        <Routes>
          {isAuthenticated ? (
            <Route path="/dashboard" element={<Services />} />
          ) : (
            <Route
              path="/"
              element={
                <>
                  <Hero />
                  <Services />
                  <Hero1 />
                  <About />
                </>
              }
            />
          )}
        </Routes>
      </main>

      <Footer />
    </Router>
  );
}

export default App;
