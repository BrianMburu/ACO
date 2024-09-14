import { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/sidebar/Sidebar";
import Navbar from "./components/navbar/Navbar";
import LandingPage from "./components/pages/LandingPage/LandingPage";
import AppsPage from "./components/pages/appsShow/apps";
import TradingPage from "./components/pages/tradingData/tradingData";
import WalletPage from "./components/pages/wallet/wallet";
import AoWeatherAgent from "./components/pages/dapps/aow/aow";
import AoClimaOptions from "./components/pages/dapps/aoc/aoc";

const App: React.FC = () => {
  const [theme, setTheme] = useState("");
  const [activeIndex, setActiveIndex] = useState(0); //sidebar's active index

  // Load the Default theme into the local Storage
  useEffect(() => {
    // save the active index to local storage
    const savedIndex = localStorage.getItem("activeIndex");
    if (savedIndex) {
      setActiveIndex(Number(savedIndex));
    }

    // Add delay transition to root to match sidebar and navbar
    const root = document.getElementById("root");
    root?.classList.add("transition-all");
    root?.classList.add("duration-300");

    // Check for saved user preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.add(savedTheme);
    } else {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <Router>
      <div className="flex h-screen">
        <Sidebar
          theme={theme}
          updateTheme={setTheme}
          activeIndex={activeIndex}
          updateActiveIndex={setActiveIndex}
        />
        <div className="flex-grow">
          <Navbar theme={theme} />
          {/* Pages Content go here */}
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="apps" element={<AppsPage />} />
            <Route path="analysis" element={<TradingPage />} />
            <Route path="wallet" element={<WalletPage />} />
            <Route path="aoWeatherAgent" element={<AoWeatherAgent />} />
            <Route path="aoClimaOptions" element={<AoClimaOptions />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
