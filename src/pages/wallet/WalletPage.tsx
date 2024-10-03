import React, { useState, useEffect } from 'react';
import axios from "axios";

import { message, createDataItemSigner, result } from "@permaweb/aoconnect";
import { PermissionType } from "arconnect";

import OverviewSection from "../../components/walletOverview/WalletOverview"


const WalletPage: React.FC = (() => {
    const permissions: PermissionType[] = [
        "ACCESS_ADDRESS",
        "SIGNATURE",
        "SIGN_TRANSACTION",
        "DISPATCH",
    ];

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        switch (name) {
            case "depositAmount":
                setDepositAmount(value);
                break;
            case "withdrawAmount":
                setWithdrawAmount(value);
                break;
            default:
                break;
        }
    };

    const AOC = "6XvODi4DHKQh1ebBugfyVIXuaHUE5SKEaK1-JbhkMfs";
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
    const [depositAmount, setDepositAmount] = useState("");
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [sendSuccess, setSuccess] = useState(false);
    const [transactionlist, setTransactionDetails] = useState<Transaction[]>([]);

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
        setIsLoadingDeposit(true);

        // Function to handle the swap and set success state
        const send = async (): Promise<void> => {
            const value = parseInt(depositAmount);
            const units = value * 1000000000000;
            const credUnits = units.toString();
            try {
                const getSwapMessage = await message({
                    process: USDA,
                    tags: [
                        { name: "Action", value: "Transfer" },
                        { name: "Recipient", value: AOC },
                        { name: "Quantity", value: credUnits },
                    ],
                    signer: createDataItemSigner(window.arweaveWallet),
                });

                const { Messages, Error } = await result({
                    message: getSwapMessage,
                    process: USDA,
                });
                if (Error) {
                    alert("Error Sending USDA: " + Error);
                    throw new Error(Error);
                }
                if (!Messages || Messages.length === 0) {
                    alert("No messages were returned from ao. Please try later.");
                    throw new Error("No messages were returned from ao.");
                }
                const actionTag = Messages[0].Tags.find(
                    (tag: Tag) => tag.name === "Action"
                );
                if (actionTag.value === "Debit-Notice") {
                    setSuccess(true);
                }
            } catch (error) {
                alert("There was an error sending USDA: " + error?.toString());
                throw error;
            }
        };
        try {
            // Await the send function to ensure it completes before proceeding
            await send();

            // Proceed with creating the trade only if send was successful
            const getPropMessage = await message({
                process: AOC,
                tags: [
                    { name: "Action", value: "deposit" },
                    {
                        name: "Amount",
                        value: String(parseInt(depositAmount) * 1000000000000),
                    },
                ],
                signer: createDataItemSigner(window.arweaveWallet),
            });

            const { Messages, Error } = await result({
                message: getPropMessage,
                process: AOC,
            });
            if (Error) {
                alert("Error Depositing : " + Error);
                return;
            }
            if (!Messages || Messages.length === 0) {
                alert("No messages were returned from ao. Please try later.");
                return;
            }
            alert(Messages[0].Data);
            setDepositAmount("");
        } catch (error) {
            alert("There was an error in the deposit process: " + error);
        }

        setIsLoadingDeposit(false);
        reloadPage(true);
    };

    const withdraw = async () => {
        setIsLoadingWithdraw(true);
        const value = parseInt(withdrawAmount);
        const units = value * 1000000000000;
        const credUnits = units.toString();
        try {
            // Proceed with creating the trade only if send was successful
            const getPropMessage = await message({
                process: AOC,
                tags: [
                    { name: "Action", value: "withdraw" },
                    {
                        name: "Amount",
                        value: String(credUnits),
                    },
                ],
                signer: createDataItemSigner(window.arweaveWallet),
            });

            const { Messages, Error } = await result({
                message: getPropMessage,
                process: AOC,
            });
            if (Error) {
                alert("Error Withdrawing : " + Error);
                return;
            }
            if (!Messages || Messages.length === 0) {
                alert("No messages were returned from ao. Please try later.");
                return;
            }
            alert(Messages[0].Data);
            setWithdrawAmount("");
        } catch (error) {
            alert("There was an error in the trade process: " + error);
        }
        setIsLoadingWithdraw(false);
        reloadPage(true);
    };

    useEffect(() => {
        const fetchBalanceUsda = async (process: string) => {
            try {
                const messageResponse = await message({
                    process,
                    tags: [{ name: "Action", value: "Balance" }],
                    signer: createDataItemSigner(window.arweaveWallet),
                });
                const getBalanceMessage = messageResponse;
                try {
                    const { Messages, Error } = await result({
                        message: getBalanceMessage,
                        process,
                    });
                    if (Error) {
                        alert("Error fetching balances:" + Error);
                        return;
                    }
                    if (!Messages || Messages.length === 0) {
                        alert("No messages were returned from ao. Please try later.");
                        return;
                    }
                    const balanceTag = Messages[0].Tags.find(
                        (tag: Tag) => tag.name === "Balance"
                    );
                    const balance = balanceTag
                        ? parseFloat((balanceTag.value / 1000000000000).toFixed(4))
                        : 0;
                    if (process === USDA) {
                        setUsdaBalance(balance);
                    }
                } catch (error) {
                    alert("There was an error when loading balances: " + error);
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchBalanceUsda(USDA);
    }, []);

    useEffect(() => {
        const fetchBalanceAoc = async (process: string) => {
            try {
                const messageResponse = await message({
                    process,
                    tags: [{ name: "Action", value: "Balance" }],
                    signer: createDataItemSigner(window.arweaveWallet),
                });
                const getBalanceMessage = messageResponse;
                try {
                    const { Messages, Error } = await result({
                        message: getBalanceMessage,
                        process,
                    });
                    if (Error) {
                        alert("Error fetching balances:" + Error);
                        return;
                    }
                    if (!Messages || Messages.length === 0) {
                        alert("No messages were returned from ao. Please try later.");
                        return;
                    }
                    const balanceTag = Messages[0].Tags.find(
                        (tag: Tag) => tag.name === "Balance"
                    );
                    const balance = balanceTag
                        ? parseFloat((balanceTag.value / 1000000000000).toFixed(4))
                        : 0;
                    if (process === AOC) {
                        setAocBalance(balance);
                    }
                } catch (error) {
                    alert("There was an error when loading balances: " + error);
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchBalanceAoc(AOC);
    }, []);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const messageResponse = await message({
                    process: AOC,
                    tags: [{ name: "Action", value: "view_transactions" }],
                    signer: createDataItemSigner(window.arweaveWallet),
                });
                const getProposalsMessage = messageResponse;
                try {
                    const { Messages, Error } = await result({
                        message: getProposalsMessage,
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
                    const openTradesData = Object.entries(data).map(([name, details]) => {
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
                    });
                    setTransactionDetails(openTradesData);
                } catch (error) {
                    alert("There was an error when loading balances: " + error);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchTransactions();
    }, []);

    return (
        <div className="content text-black dark:text-white">
            <OverviewSection aocBalance={aocBalance} />

            <div className='md:p-8 pt-0'>
                <div className='px-3 md:px-0'>
                    <div className='w-full flex items-center justify-between text-white p-6 mb-8 shadow-lg border border-neutral-700 rounded-lg space-x-5'>
                        <div className='flex flex-col space-y-4'>
                            <div className="relative rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input type="number" name="depositAmount" id="amount" className="w-full block rounded-md border-0 py-1.5 pl-7 text-white ring-1 ring-inset ring-gray-300 
                                placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" placeholder="USDA Amount"
                                    value={depositAmount} onChange={handleInputChange}>
                                </input>
                            </div>
                            <div className='flex justify-center'>
                                <button className="w-full top-3 left-3 bg-green-500 text-white px-3 py-2 md:px-4 md:py-3 rounded-md opacity-80 hover:opacity-100 text-xs md:text-md"
                                    onClick={deposit}>
                                    Deposit
                                </button>
                            </div>
                        </div>

                        <div className='flex flex-col space-y-4'>
                            <div className="relative rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-gray-500 text-sm">$</span>
                                </div>
                                <input type="number" name="withdrawAmount" id="amount" className="w-full block rounded-md border-0 py-1.5 pl-7 text-white ring-1 ring-inset ring-gray-300 
                                placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" placeholder="USDA Amount"
                                    value={withdrawAmount} onChange={handleInputChange}>
                                </input>
                            </div>
                            <div className='flex justify-center'>
                                <button className="w-full bg-red-500 text-white px-3 py-2 md:px-4 md:py-3 rounded-md opacity-80 hover:opacity-100 text-xs md:text-md"
                                    onClick={withdraw}>
                                    Withdraw
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='px-1 md:px-0'>
                    <div className='w-full px-4 md:px-8 py-8 border border-neutral-700 rounded-lg overflow-hidden' style={{
                        background: 'linear-gradient(to top left, rgba(135, 206, 250, 0.2), rgba(135, 206, 250, 0))'
                    }}>
                        <h3 className="w-full text-lg md:text-xl font-bold mb-5 text-center">Your Transaction History</h3>
                        <div className='max-w-full overflow-x-auto'>
                            <div className='table w-full'>
                                <div className='table-header-group text-md lg-text-xl'>
                                    <div className='table-cell text-left border border-neutral-700 p-3 rounded-tl-md'>tId</div>
                                    <div className='table-cell text-left border border-neutral-700 p-3'>User</div>
                                    <div className='table-cell text-left border border-neutral-700 p-3'>Amount</div>
                                    <div className='table-cell text-left border border-neutral-700 p-3'>Type</div>
                                    <div className='table-cell text-left border border-neutral-700 p-3'>Balance</div>
                                    <div className='table-cell text-left border border-neutral-700 p-3 rounded-tr-md'>Timestamp</div>
                                </div>
                                <div className='table-row-group text-sm lg:text-md'>
                                    {transactionlist.map((transaction, index) => (
                                        <div className='table-row' key={index}>
                                            <div className='table-cell text-left border border-neutral-700 p-3'>{transaction.transactionid}</div>
                                            <div className='table-cell text-left border border-neutral-700 p-3'>{transaction.user.substring(0, 8)}</div>
                                            <div className='table-cell text-left border border-neutral-700 p-3'>{transaction.amount}</div>
                                            <div className='table-cell text-left border border-neutral-700 p-3'>{transaction.type}</div>
                                            <div className='table-cell text-left border border-neutral-700 p-3'>{transaction.balance}</div>
                                            <div className='table-cell text-left border border-neutral-700 p-3'>{transaction.timestamp}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

});

export default WalletPage