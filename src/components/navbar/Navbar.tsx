import React, { useState, useEffect } from "react";
import { FaAngleDoubleRight } from "react-icons/fa";
import { SparklesIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import { useLocation } from "react-router-dom";
import { connect, disconnect } from "@othent/kms";
import { FaSpinner } from "react-icons/fa"; // Import spinner icon

const Navbar: React.FC<{ theme: string }> = ({ theme }) => {
  const locationURL = useLocation();
  const { pathname } = locationURL;
  const [address, setAddress] = useState<string | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false); // New state for sign-in loading
  const [isSigningOut, setIsSigningOut] = useState(false); // New state for sign-out loading

  useEffect(() => {
    // Retrieve address and profilePic from localStorage if they exist
    const storedAddress = localStorage.getItem("walletAddress");
    const storedProfilePic = localStorage.getItem("profilePic");

    if (storedAddress && storedAddress !== "undefined") {
      setAddress(storedAddress);
      setIsConnected(true);
    } else {
      setAddress(null);
    }

    if (storedProfilePic && storedProfilePic !== "undefined") {
      setProfilePic(storedProfilePic);
    } else {
      setProfilePic(null);
    }
  }, []);

  const handleConnect = async () => {
    setIsSigningIn(true); // Start loading spinner for sign-in
    try {
      const res = await connect();
      setAddress(res.walletAddress);
      setProfilePic(res.picture);

      // Save to localStorage
      localStorage.setItem("walletAddress", res.walletAddress);
      localStorage.setItem("profilePic", res.picture);

      setIsConnected(true);
    } catch (error) {
      console.error("Connection failed", error);
    } finally {
      setIsSigningIn(false); // Stop loading spinner for sign-in
    }
  };

  const handleDisconnect = async () => {
    setIsSigningOut(true); // Start loading spinner for sign-out
    try {
      await disconnect();
      setAddress(null);
      setProfilePic(null);

      // Remove from localStorage
      localStorage.removeItem("walletAddress");
      localStorage.removeItem("profilePic");

      setIsConnected(false);
    } catch (error) {
      console.error("Disconnection failed", error);
    } finally {
      setIsSigningOut(false); // Stop loading spinner for sign-out
    }
  };

  const capitalizeFirstLetter = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1);

  const cleanPathname = pathname.startsWith("/") ? pathname.slice(1) : pathname;

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
              disabled={isSigningOut} // Disable button while signing out
            >
              {isSigningOut ? (
                <FaSpinner className="animate-spin" /> // Show spinner while signing out
              ) : (
                "Sign Out"
              )}
            </button>
          </>
        ) : (
          <button
            type="button"
            className="text-green-700 hover:text-white border border-green-700 hover:bg-green-800 focus:ring-4 
                        focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            onClick={handleConnect}
            disabled={isSigningIn} // Disable button while signing in
          >
            {isSigningIn ? (
              <FaSpinner className="animate-spin" /> // Show spinner while signing in
            ) : (
              "Sign In Via Email"
            )}
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
