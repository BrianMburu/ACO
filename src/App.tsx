import { useState, useEffect } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Sidebar from './components/sidebar/Sidebar';
import Navbar from './components/navbar/Navbar';
import Home from './pages/home/Home';
import AppsPage from './pages/apps/AppsPage';
import AoClimaOptions from './pages/climaOptions/AoClimaOptions';
import AoWeatherAgent from './pages/weatherAgent/AoWeatherAgent';
import WalletPage from './pages/wallet/WalletPage';
import TradesAnalysisPage from './pages/trades/TradesAnalysisPage';
import WalletConnectError from './components/alerts/WalletConnectError';

const App: React.FC = () => {
  const [theme, setTheme] = useState("");
  const [activeIndex, setActiveIndex] = useState(0); //sidebar's active index
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Load the Default theme into the local Storage
  useEffect(() => {
    // save the active index to local storage
    const savedIndex = localStorage.getItem("activeIndex");
    if (savedIndex) {
      setActiveIndex(Number(savedIndex));
    }

    // Add delay transition to root to match sidebar and navbar
    const root = document.getElementById("root");
    root?.classList.add("transition-colors");
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

  // Check if user has connected to Arweave Wallet
  const walletAddress = localStorage.getItem('walletAddress');

  return (
    <Router>
      <div className="flex h-screen w-screen">
        <Sidebar theme={theme} updateTheme={setTheme} activeIndex={activeIndex} updateActiveIndex={setActiveIndex}
          isCollapsed={isCollapsed} />
        <div className="nav-content flex-grow">
          <Navbar theme={theme} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
          {/* Pages Content go here */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="apps" element={<AppsPage />} />
            <Route path="analysis" element={walletAddress ? <TradesAnalysisPage /> : <WalletConnectError />} />
            <Route path="wallet" element={walletAddress ? <WalletPage /> : <WalletConnectError />} />
            <Route path="aoclimaoptions" element={walletAddress ? <AoClimaOptions /> : <WalletConnectError />} />
            <Route path="aoweatheragent" element={walletAddress ? <AoWeatherAgent /> : <WalletConnectError />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
