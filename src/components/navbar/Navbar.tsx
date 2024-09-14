import { FaBell, FaAngleDoubleRight } from "react-icons/fa";
import { Squares2X2Icon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import { PermissionType } from "arconnect";
import React, { useState, useEffect } from "react";

const permissions: PermissionType[] = [
  "ACCESS_ADDRESS",
  "SIGNATURE",
  "SIGN_TRANSACTION",
  "DISPATCH",
];

const Navbar: React.FC<{ theme: string }> = ({ theme }) => {
  const [address, setAddress] = useState("");

  useEffect(() => {
    // Retrieve address from localStorage when component mounts
    const storedAddress = localStorage.getItem("walletAddress");
    if (storedAddress) {
      setAddress(storedAddress);
    }
  }, []);

  const fetchAddress = async () => {
    try {
      await window.arweaveWallet.connect(permissions, {
        name: "Notus",
        logo: "OVJ2EyD3dKFctzANd0KX_PCgg8IQvk0zYqkWIj-aeaU",
      });
      const address = await window.arweaveWallet.getActiveAddress();
      setAddress(address);
      // Store address in localStorage
      localStorage.setItem("walletAddress", address);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  return (
    <nav
      className={classNames(
        "flex items-center justify-between p-4 shadow-md border-b-2 border-b-neutral-700 transition-all duration-300",
        {
          "bg-black": theme === "dark",
          "bg-gray-900": theme === "light",
        }
      )}
    >
      <div className="flex items-center space-x-2">
        <div className="activity-icon-container rounded-lg p-3 bg-emerald-600 cursor-pointer">
          <Squares2X2Icon className="size-5" />
        </div>
        <FaAngleDoubleRight className="size-3" />
        <div className="text-xl font-bold text-white">AoClimaOptions.</div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-white">ArConnect</div>

        <label className="relative inline-flex cursor-pointer items-center">
          <input
            id="switch-2"
            type="checkbox"
            className="peer sr-only"
            onClick={fetchAddress} // Connect wallet when the checkbox is clicked
          />
          <div className="peer h-4 w-11 rounded-full border bg-slate-200 after:absolute after:-top-1 after:left-0 after:h-6 after:w-6 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-focus:ring-emerald-600"></div>
        </label>

        <FaBell className="text-white" />
      </div>
    </nav>
  );
};

export default Navbar;
