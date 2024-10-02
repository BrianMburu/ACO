import React from "react";
import { FaWallet, FaCopy } from "react-icons/fa"; // Import copy icon

interface OverviewProps {
  aocBalance: number;
  usdaBalance: number;
}

const OverviewSection: React.FC<OverviewProps> = ({
  aocBalance,
  usdaBalance,
}) => {
  const walletAddress = localStorage.getItem("walletAddress");

  // Copy wallet address to clipboard
  const copyToClipboard = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      alert("Wallet address copied to clipboard!");
    }
  };

  return (
    <div className="w-full text-white p-6 mb-8 flex flex-wrap justify-between items-center shadow-lg border-b border-b-neutral-700 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg">
      {/* Left Section - Wallet Info */}
      <div className="flex items-start space-x-4">
        <div className="p-2 bg-neutral-700 rounded-full">
          <FaWallet size="15" />
        </div>
        <div className="items-start">
          <p className="text-gray-400 text-sm">Your Wallet / Balances</p>
          <div className="flex flex-col">
            <div className="flex items-baseline space-x-2">
              <h2 className="text-2xl font-semibold">
                {walletAddress
                  ? `${walletAddress.substring(
                      0,
                      5
                    )}...${walletAddress.substring(walletAddress.length - 5)}`
                  : ""}
              </h2>
              {walletAddress && (
                <FaCopy
                  className="cursor-pointer text-gray-400 hover:text-white"
                  onClick={copyToClipboard}
                  title="Copy wallet address"
                />
              )}
            </div>
            <div className="flex space-x-6 mt-2">
              <span className="text-green-400 text-xl font-bold">
                AOC: {aocBalance.toFixed(4)}
              </span>
              <span className="text-blue-400 text-xl font-bold">
                USDA: {usdaBalance.toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center Section - Market or Weather Info */}
      <div className="flex flex-col space-y-3 items-start">
        <div className="flex space-x-4">
          <div className="text-start text-sm">
            <p className="text-gray-400">Market Cap</p>
            <h3 className="text-xs font-semibold">$843,333,177,777</h3>
          </div>
          <div className="text-start text-sm">
            <p className="text-gray-400">Volume (24h)</p>
            <h3 className="text-xs font-semibold">$29,940,488,608</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewSection;
