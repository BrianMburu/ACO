import React, { useState, useEffect } from "react";
import * as othent from "@othent/kms";
import { message, createDataItemSigner, result } from "@permaweb/aoconnect";
import { FaSpinner } from "react-icons/fa"; // Spinner Icon
import OverviewSection from "../walletOverview/WalletOverview";

const WalletPage: React.FC = () => {
  const AOC = "ga5QHk3FOfKf4YoEQxQSuZDgL5Z4Rjbswk3ASg2CeQE";
  const USDA = "GcFxqTQnKHcr304qnOcq00ZqbaYGDn4Wbb0DHAM-wvU";

  interface Tag {
    name: string;
    value: string;
  }

  interface Transaction {
    user: string;
    transactionid: string;
    amount: string;
    type: string;
    balance: string;
    timestamp: string;
  }

  const [aocBalance, setAocBalance] = useState(0);
  const [usdaBalance, setUsdaBalance] = useState(0);
  const [isLoadingDeposit, setIsLoadingDeposit] = useState(false);
  const [isLoadingWithdraw, setIsLoadingWithdraw] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true); // New loading state for fetching data
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [transactionlist, setTransactionDetails] = useState<Transaction[]>([]);
  const [sendSuccess, setSuccess] = useState(false);
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === "depositAmount") setDepositAmount(value);
    else if (name === "withdrawAmount") setWithdrawAmount(value);
  };

  // Function to reload the page.
  function reloadPage(forceReload = false): void {
    if (forceReload) {
      // Force reload from the server
      location.href = location.href;
    } else {
      // Reload using the cache
      location.reload();
    }
  }

  const deposit = async () => {
    setIsLoadingDeposit(true); // Start spinner for deposit
    const value = parseInt(depositAmount);
    const credUnits = (value * 1000000000000).toString();

    try {
      const getSwapMessage = await message({
        process: USDA,
        tags: [
          { name: "Action", value: "Transfer" },
          { name: "Recipient", value: AOC },
          { name: "Quantity", value: credUnits },
        ],
        signer: createDataItemSigner(othent),
      });

      const { Messages, Error } = await result({
        message: getSwapMessage,
        process: USDA,
      });

      if (Error) {
        alert("Error Sending USDA: " + Error);
        return;
      }

      if (
        Messages?.[0].Tags.find((tag: Tag) => tag.name === "Action")?.value ===
        "Debit-Notice"
      ) {
        setSuccess(true);
      }

      const getPropMessage = await message({
        process: AOC,
        tags: [
          { name: "Action", value: "deposit" },
          { name: "Amount", value: credUnits },
        ],
        signer: createDataItemSigner(othent),
      });

      const depositResult = await result({
        message: getPropMessage,
        process: AOC,
      });

      if (depositResult.Error) {
        alert("Error Depositing : " + depositResult.Error);
      } else {
        alert(depositResult.Messages?.[0]?.Data || "Deposit Successful");
        setDepositAmount("");
      }
    } catch (error) {
      alert("Error in deposit process: " + error);
    } finally {
      setIsLoadingDeposit(false); // Stop spinner for deposit
      reloadPage(true);
    }
  };

  const withdraw = async () => {
    setIsLoadingWithdraw(true); // Start spinner for withdraw
    const value = parseInt(withdrawAmount);
    const credUnits = (value * 1000000000000).toString();

    try {
      const getPropMessage = await message({
        process: AOC,
        tags: [
          { name: "Action", value: "withdraw" },
          { name: "Amount", value: credUnits },
        ],
        signer: createDataItemSigner(othent),
      });

      const { Messages, Error } = await result({
        message: getPropMessage,
        process: AOC,
      });

      if (Error) {
        alert("Error Withdrawing : " + Error);
      } else {
        alert(Messages?.[0]?.Data || "Withdrawal Successful");
        setWithdrawAmount("");
      }
    } catch (error) {
      alert("Error in withdrawal process: " + error);
    } finally {
      setIsLoadingWithdraw(false); // Stop spinner for withdraw
      reloadPage(true);
    }
  };

  useEffect(() => {
    const fetchBalancesAndTransactions = async () => {
      try {
        setIsLoadingData(true); // Start loading for data
        // Fetch AOC balance first
        const aocMessageResponse = await message({
          process: AOC,
          tags: [{ name: "Action", value: "Balance" }],
          signer: createDataItemSigner(othent),
        });

        const aocResult = await result({
          message: aocMessageResponse,
          process: AOC,
        });

        if (!aocResult.Error) {
          const aocBalanceTag = aocResult.Messages?.[0].Tags.find(
            (tag: Tag) => tag.name === "Balance"
          );
          setAocBalance(
            parseFloat((aocBalanceTag?.value / 1000000000000).toFixed(4)) || 0
          );
        }

        // Fetch USDA balance
        const usdaMessageResponse = await message({
          process: USDA,
          tags: [{ name: "Action", value: "Balance" }],
          signer: createDataItemSigner(othent),
        });

        const usdaResult = await result({
          message: usdaMessageResponse,
          process: USDA,
        });

        if (!usdaResult.Error) {
          const usdaBalanceTag = usdaResult.Messages?.[0].Tags.find(
            (tag: Tag) => tag.name === "Balance"
          );
          setUsdaBalance(
            parseFloat((usdaBalanceTag?.value / 1000000000000).toFixed(4)) || 0
          );
        }

        // Fetch transaction history after balances
        const fetchTransactions = async () => {
          const messageResponse = await message({
            process: AOC,
            tags: [{ name: "Action", value: "view_transactions" }],
            signer: createDataItemSigner(othent), // Use othent signer
          });
          const { Messages, Error } = await result({
            message: messageResponse,
            process: AOC,
          });

          if (Error) {
            alert("Error fetching transactions:" + Error);
            return;
          }
          if (!Messages || Messages.length === 0) {
            alert("No messages were returned from ao. Please try later.");
            return;
          }

          const data = JSON.parse(Messages[0].Data);
          const transactionData = Object.entries(data).map(
            ([name, details]) => {
              const typedDetails: Transaction = details as Transaction;
              return {
                user: typedDetails.user,
                transactionid: typedDetails.transactionid,
                amount: String(Number(typedDetails.amount) / 1000000000000),
                type: typedDetails.type,
                balance: String(Number(typedDetails.balance) / 1000000000000),
                timestamp: new Date(typedDetails.timestamp).toLocaleString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false, // Use 24-hour format
                  }
                ),
              };
            }
          );
          setTransactionDetails(transactionData);
        };

        await fetchTransactions(); // Call fetch transactions after fetching balances
      } catch (error) {
        console.error("Error fetching balances or transactions:", error);
      } finally {
        setIsLoadingData(false); // Stop loading for data
      }
    };

    fetchBalancesAndTransactions(); // Fetch balances and transactions in sequence
  }, []);

  return (
    <div className="content text-black dark:text-white">
      {isLoadingData ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-3xl" />{" "}
          {/* Loading Spinner */}
        </div>
      ) : (
        <>
          <OverviewSection aocBalance={aocBalance} usdaBalance={usdaBalance} />

          <div className="p-8 pt-0">
            <div className="w-full flex items-center justify-between text-white p-6 mb-8 shadow-lg border border-neutral-700 rounded-lg">
              <div className="flex flex-col space-y-4">
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="depositAmount"
                    id="amount"
                    className="w-full block rounded-md border-0 py-1.5 pl-7 text-white ring-1 ring-inset ring-gray-300 
                                placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="USDA Amount"
                    value={depositAmount}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex justify-center">
                  <button
                    className="w-full top-3 left-3 bg-green-500 text-white px-4 py-3 rounded-md opacity-80 hover:opacity-100"
                    onClick={deposit}
                    disabled={isLoadingDeposit} // Disable button while loading
                  >
                    {isLoadingDeposit ? (
                      <FaSpinner className="animate-spin" /> // Show spinner if loading
                    ) : (
                      "Deposit" // Show text if not loading
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col space-y-4">
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="withdrawAmount"
                    id="amount"
                    className="w-full block rounded-md border-0 py-1.5 pl-7 text-white ring-1 ring-inset ring-gray-300 
                                placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="USDA Amount"
                    value={withdrawAmount}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex justify-center">
                  <button
                    className="w-full top-3 left-3 bg-red-500 text-white px-4 py-3 rounded-md opacity-80 hover:opacity-100"
                    onClick={withdraw}
                    disabled={isLoadingWithdraw} // Disable button while loading
                  >
                    {isLoadingWithdraw ? (
                      <FaSpinner className="animate-spin" /> // Show spinner if loading
                    ) : (
                      "Withdraw" // Show text if not loading
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div
              className="w-full p-8 border border-neutral-700 rounded-lg overflow-hidden"
              style={{
                background:
                  "linear-gradient(to top left, rgba(135, 206, 250, 0.2), rgba(135, 206, 250, 0))",
              }}
            >
              <h3 className="w-full text-xl font-bold mb-5 text-center">
                Your Transaction History
              </h3>
              <div className="table w-full ">
                <div className="table-header-group">
                  <div className="table-cell text-left border border-neutral-700 p-3 rounded-tl-md">
                    tId
                  </div>
                  <div className="table-cell text-left border border-neutral-700 p-3">
                    User
                  </div>
                  <div className="table-cell text-left border border-neutral-700 p-3">
                    Amount
                  </div>
                  <div className="table-cell text-left border border-neutral-700 p-3">
                    Type
                  </div>
                  <div className="table-cell text-left border border-neutral-700 p-3">
                    Balance
                  </div>
                  <div className="table-cell text-left border border-neutral-700 p-3 rounded-tr-md">
                    Timestamp
                  </div>
                </div>
                <div className="table-row-group">
                  {transactionlist.map((transaction, index) => (
                    <div className="table-row" key={index}>
                      <div className="table-cell text-left border border-neutral-700 p-3">
                        {transaction.transactionid}
                      </div>
                      <div className="table-cell text-left border border-neutral-700 p-3">
                        {transaction.user}
                      </div>
                      <div className="table-cell text-left border border-neutral-700 p-3">
                        {transaction.amount}
                      </div>
                      <div className="table-cell text-left border border-neutral-700 p-3">
                        {transaction.type}
                      </div>
                      <div className="table-cell text-left border border-neutral-700 p-3">
                        {transaction.balance}
                      </div>
                      <div className="table-cell text-left border border-neutral-700 p-3">
                        {transaction.timestamp}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WalletPage;
