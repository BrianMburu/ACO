import React, { useState, useEffect } from "react";
import { FaBell, FaAngleDoubleRight, FaCopy, FaGoogle } from "react-icons/fa";
import { SparklesIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import { useLocation } from "react-router-dom";
import { connect, disconnect } from "@othent/kms";

const Navbar: React.FC<{ theme: string }> = ({ theme }) => {
  const locationURL = useLocation();
  const { pathname } = locationURL;
  const [address, setAddress] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Retrieve address and profilePic from localStorage when component mounts
    const storedAddress = localStorage.getItem("walletAddress");
    const storedProfilePic = localStorage.getItem("profilePic");

    if (storedAddress) {
      setAddress(storedAddress);
      setIsConnected(true); // User is connected if address exists
    }

    if (storedProfilePic) {
      setProfilePic(storedProfilePic);
    }
  }, []);

  const handleConnect = async () => {
    try {
      const res = await connect();
      setAddress(res.walletAddress);
      setProfilePic(res.picture);
      localStorage.setItem("walletAddress", res.walletAddress);
      localStorage.setItem("profilePic", res.picture);
      setIsConnected(true);
    } catch (error) {
      console.error("Connection failed", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setAddress("");
      setProfilePic("");
      localStorage.removeItem("walletAddress");
      localStorage.removeItem("profilePic");
      setIsConnected(false);
    } catch (error) {
      console.error("Disconnection failed", error);
    }
  };

  const capitalizeFirstLetter = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1);

  const cleanPathname = pathname.startsWith("/") ? pathname.slice(1) : pathname;

  // Copy address to clipboard function
  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      alert("Address copied to clipboard!");
    }
  };

  return (
    <nav
      className={classNames(
        "flex items-center justify-between p-4 shadow-md border-b border-b-neutral-700 transition-all duration-300",
        {
          "bg-black": theme === "dark",
          "bg-gray-900": theme === "light",
        }
      )}
    >
      <div className="flex items-center space-x-2">
        <div className="activity-icon-container rounded-lg p-3 bg-emerald-600">
          <SparklesIcon className="size-5" />
        </div>
        <FaAngleDoubleRight className="size-3" />
        <div className="text-xl font-bold text-white">
          {cleanPathname !== ""
            ? capitalizeFirstLetter(cleanPathname)
            : "Overview"}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {isConnected ? (
          <>
            <div className="flex items-center space-x-2 text-white">
              <span>{address}</span>
              <FaCopy
                className="cursor-pointer"
                onClick={copyToClipboard}
                title="Copy address"
              />
            </div>
            {profilePic && (
              <img
                src={profilePic}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
            )}
            <button
              onClick={handleDisconnect}
              className="text-red-500 hover:text-white border border-red-500 hover:bg-red-600 focus:ring-4 
                        focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              Sign Out.
            </button>
          </>
        ) : (
          <button
            type="button"
            className="text-green-700 hover:text-white border border-green-700 hover:bg-green-800 focus:ring-4 
                        focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            onClick={handleConnect}
          >
            Sign In Via Email.
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
