import React, { useState, useEffect } from 'react';
import { FaBell, FaAngleDoubleRight } from 'react-icons/fa';
import { SparklesIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import { useLocation } from 'react-router-dom';

import { PermissionType } from "arconnect";

const permissions: PermissionType[] = [
  "ACCESS_ADDRESS",
  "SIGNATURE",
  "SIGN_TRANSACTION",
  "DISPATCH",
];

const Navbar: React.FC<{ theme: string }> = ({ theme }) => {
  const locationURL = useLocation();
  const { pathname } = locationURL;
  const [address, setAddress] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  // FUnction to reload page
  function reloadPage(forceReload = false): void {
    if (forceReload) {
      // Force reload from the server
      location.href = location.href;
    } else {
      // Reload using the cache
      location.reload();
    }
  }

  useEffect(() => {
    // Retrieve address from localStorage when component mounts
    const storedAddress = localStorage.getItem("walletAddress");
    if (storedAddress) {
      setAddress(storedAddress);
      setIsConnected(true); // User is connected if address exists
    }

    // Listen to wallet switch events
    const handleWalletSwitch = (e: any) => {
      const newAddress = e.detail.address;
      setAddress(newAddress);
      localStorage.setItem("walletAddress", newAddress);
    };

    window.addEventListener("walletSwitch", handleWalletSwitch);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("walletSwitch", handleWalletSwitch);
    };
  }, []);

  const fetchAddress = async () => {
    try {
      await window.arweaveWallet.connect(permissions, {
        name: "Notus",
        logo: "OVJ2EyD3dKFctzANd0KX_PCgg8IQvk0zYqkWIj-aeaU",
      });
      const address = await window.arweaveWallet.getActiveAddress();
      setAddress(address);
      localStorage.setItem("walletAddress", address); // Store in localStorage
      setIsConnected(true); // Set connection state to true
      reloadPage();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  // Disconnect from the extension
  const disconnect = async () => {
    try {
      await window.arweaveWallet.disconnect();
      setAddress(""); // Clear the address when disconnected
      localStorage.removeItem("walletAddress"); // Remove from localStorage
      setIsConnected(false); // Set connection state to false
      reloadPage();
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  // Capitalize the first letter
  const capitalizeFirstLetter = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  // Remove the leading slash
  const cleanPathname = pathname.startsWith('/') ? pathname.slice(1) : pathname;
  return (
    <nav className={classNames("flex items-center justify-between p-4 shadow-md border-b border-b-neutral-700 transition-all duration-300", {
      'bg-black': theme == 'dark',
      'bg-gray-900': theme == 'light'
    })}>
      <div className="flex items-center space-x-2">
        <div className='activity-icon-container rounded-lg p-3 bg-emerald-600'>
          <SparklesIcon className='size-5' />
        </div>
        <FaAngleDoubleRight className="size-3" />
        <div className="text-xl font-bold text-white">{cleanPathname !== "" ? capitalizeFirstLetter(cleanPathname) : "Overview"}</div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-white">ArConnect</div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input id="switch-2" type="checkbox" className="peer sr-only" checked={isConnected} // Bind to connection state
            onChange={isConnected ? disconnect : fetchAddress} />
          <label htmlFor="switch-2" className="hidden"></label>
          <div className="peer h-4 w-11 rounded-full border bg-slate-200 after:absolute after:-top-1 after:left-0 after:h-6 after:w-6 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-focus:ring-emerald-600"></div>
        </label>
        {/* <label className="relative inline-flex cursor-pointer items-center">
                    <input id="switch" type="checkbox" className="peer sr-only" />
                    <label htmlFor="switch" className="hidden"></label>
                    <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full  after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-focus:ring-green-300"></div>
                </label> */}
        {!isConnected && <div>
          <button type="button" className="text-green-700 hover:text-white border border-green-700 hover:bg-green-800 focus:ring-4 
                        focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center 
                        dark:border-green-500 dark:text-green-500 dark:hover:text-white dark:hover:bg-green-600 dark:focus:ring-green-800"
            onClick={fetchAddress}>
            Connect</button>
        </div>}

        {/* <FaBell className="text-white" /> */}
      </div>
    </nav>
  );
};

export default Navbar;
