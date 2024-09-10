import React, { useState, useEffect } from 'react';
import axios from "axios";

import { message, createDataItemSigner, result } from "@permaweb/aoconnect";
import { PermissionType } from "arconnect";

const TradesTable: React.FC<{ trades: any, tabletype: string }> = ({ trades, tabletype }) => {
    return (
        <div className='w-full p-8 border border-neutral-700 rounded-lg mb-8' style={{
            background: tabletype === "open" ?
                'linear-gradient(to top left, rgba(135, 206, 250, 0.2), rgba(135, 206, 250, 0))' :
                'linear-gradient(to top left, rgba(250, 178, 133, 0.2), rgba(135, 206, 250, 0))'
        }}>
            <h3 className="w-full text-xl font-bold mb-5 text-center">{tabletype === "open" ? "Open Trades" : "Closed Trades"}</h3>
            <div className='table w-full'>
                <div className='table-header-group'>
                    <div className='table-cell text-left border border-neutral-700 p-3 rounded-tl-md'>ProcessId</div>
                    <div className='table-cell text-left border border-neutral-700 p-3'>Country</div>
                    <div className='table-cell text-left border border-neutral-700 p-3'>City</div>
                    <div className='table-cell text-left border border-neutral-700 p-3'>Bought Temp</div>
                    <div className='table-cell text-left border border-neutral-700 p-3'>Closing Temp</div>
                    <div className='table-cell text-left border border-neutral-700 p-3'>Contract Type</div>
                    <div className='table-cell text-left border border-neutral-700 p-3'>Trade Amount</div>
                    <div className='table-cell text-left border border-neutral-700 p-3'>Created Time</div>
                    <div className='table-cell text-left border border-neutral-700 p-3'>Contract Expiry</div>
                    <div className='table-cell text-left border border-neutral-700 p-3'>Contract Status</div>
                    <div className='table-cell text-left border border-neutral-700 p-3'>Payout</div>
                    <div className='table-cell text-left border border-neutral-700 p-3 rounded-tr-md'>Outcome</div>
                </div>
                <div className='table-row-group'>
                    {trades.map((trade, index) => (
                        <div className='table-row' key={index}>
                            <div className='table-cell text-left border border-neutral-700 p-3'>{trade.UserId}</div>
                            <div className='table-cell text-left border border-neutral-700 p-3'>{trade.Country}</div>
                            <div className='table-cell text-left border border-neutral-700 p-3'>{trade.City}</div>
                            <div className='table-cell text-left border border-neutral-700 p-3'>{trade.CurrentTemp}</div>
                            <div className='table-cell text-left border border-neutral-700 p-3'>{trade.ClosingTemp}</div>
                            <div className='table-cell text-left border border-neutral-700 p-3'>{trade.ContractType}</div>
                            <div className='table-cell text-left border border-neutral-700 p-3'>{trade.BetAmount}</div>
                            <div className='table-cell text-left border border-neutral-700 p-3'>{trade.CreatedTime}</div>
                            <div className='table-cell text-left border border-neutral-700 p-3'>{trade.ContractExpiry}</div>
                            <div className='table-cell text-left border border-neutral-700 p-3'>{trade.ContractStatus}</div>
                            <div className='table-cell text-left border border-neutral-700 p-3'>{trade.ClosingTime}</div>
                            <div className='table-cell text-left border border-neutral-700 p-3'>{trade.Payout}</div>
                            <div className='table-cell text-left border border-neutral-700 p-3'>{trade.Outcome}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const TradesAnalysisPage: React.FC = (() => {
    interface Tag {
        name: string;
        value: string;
    }

    interface TradeDetails {
        UserId: string;
        TradeId: number;
        BetAmount: number;
        Outcome: string;
        ContractType: string;
        Country: string;
        CurrentTemp: string;
        ContractStatus: string;
        CountryId: string;
        ContractExpiry: string;
        CreatedTime: string;
        ClosingTemp: number;
        ClosingTime: string;
        Payout: number;
        City: string;
    }

    interface Trade {
        UserId: string;
        TradeId: number;
        BetAmount: number;
        ContractType: string;
        Outcome: string;
        Country: string;
        CurrentTemp: string;
        ContractStatus: string;
        CountryId: string;
        ContractExpiry: string;
        CreatedTime: string;
        ClosingTemp: number;
        ClosingTime: string;
        Payout: number;
        City: string;
    }

    const AOC = "6XvODi4DHKQh1ebBugfyVIXuaHUE5SKEaK1-JbhkMfs";
    const [opentrades, setOpenTrades] = useState<Trade[]>([]);
    const [closedtrades, setClosedTrades] = useState<Trade[]>([]);

    useEffect(() => {
        const fetchOpenTrades = async () => {
            try {
                const messageResponse = await message({
                    process: AOC,
                    tags: [{ name: "Action", value: "openTrades" }],
                    signer: createDataItemSigner(window.arweaveWallet),
                });
                const getProposalsMessage = messageResponse;
                try {
                    let { Messages, Error } = await result({
                        message: getProposalsMessage,
                        process: AOC,
                    });
                    if (Error) {
                        alert("Error fetching proposals:" + Error);
                        return;
                    }
                    if (!Messages || Messages.length === 0) {
                        alert("No messages were returned from ao. Please try later.");
                        return;
                    }
                    const data = JSON.parse(Messages[0].Data);
                    const openTradesData = Object.entries(data).map(([name, details]) => {
                        const typedDetails: TradeDetails = details as TradeDetails;
                        return {
                            name,
                            BetAmount: typedDetails.BetAmount / 1000000000000,
                            ContractType: typedDetails.ContractType,
                            ContractExpiry: new Date(
                                typedDetails.ContractExpiry
                            ).toLocaleString("en-US", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false, // Use 24-hour format
                            }),
                            CreatedTime: new Date(typedDetails.CreatedTime).toLocaleString(
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
                            Country: typedDetails.Country,
                            City: typedDetails.City,
                            CurrentTemp: typedDetails.CurrentTemp,
                            ContractStatus: typedDetails.ContractStatus,
                            TradeId: typedDetails.TradeId,
                            ClosingTime: typedDetails.ClosingTime
                                ? new Date(typedDetails.ClosingTime).toLocaleString("en-US", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                })
                                : "Pending",
                            ClosingTemp: typedDetails.ClosingTemp,
                            Payout: typedDetails.Payout,
                            UserId: typedDetails.UserId,
                            Outcome: typedDetails.Outcome,
                        };
                    });
                    setOpenTrades(openTradesData);
                } catch (error) {
                    alert("There was an error when loading balances: " + error);
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchOpenTrades();
    }, []);

    useEffect(() => {
        const fetchClosedTrades = async () => {
            try {
                const messageResponse = await message({
                    process: AOC,
                    tags: [{ name: "Action", value: "closedTrades" }],
                    signer: createDataItemSigner(window.arweaveWallet),
                });
                const getProposalsMessage = messageResponse;
                try {
                    let { Messages, Error } = await result({
                        message: getProposalsMessage,
                        process: AOC,
                    });
                    if (Error) {
                        alert("Error fetching proposals:" + Error);
                        return;
                    }
                    if (!Messages || Messages.length === 0) {
                        alert("No messages were returned from ao. Please try later.");
                        return;
                    }
                    const data = JSON.parse(Messages[0].Data);
                    const closedTradesData = Object.entries(data).map(
                        ([name, details]) => {
                            const typedDetails: TradeDetails = details as TradeDetails;
                            return {
                                Country: typedDetails.Country,
                                City: typedDetails.City,
                                CurrentTemp: typedDetails.CurrentTemp,
                                ContractStatus: typedDetails.ContractStatus,
                                CountryId: typedDetails.CountryId,
                                TradeId: typedDetails.TradeId,
                                Outcome: typedDetails.Outcome,
                                name,
                                BetAmount: typedDetails.BetAmount / 1000000000000,
                                ContractType: typedDetails.ContractType,
                                ContractExpiry: new Date(
                                    typedDetails.ContractExpiry
                                ).toLocaleString("en-US", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false, // Use 24-hour format
                                }),
                                CreatedTime: new Date(typedDetails.CreatedTime).toLocaleString(
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
                                ClosingTime: typedDetails.ClosingTime
                                    ? new Date(typedDetails.ClosingTime).toLocaleString("en-US", {
                                        year: "numeric",
                                        month: "2-digit",
                                        day: "2-digit",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: false,
                                    })
                                    : "Pending",
                                ClosingTemp: typedDetails.ClosingTemp,
                                Payout: typedDetails.Payout,
                                UserId: typedDetails.UserId,
                            };
                        }
                    );
                    setClosedTrades(closedTradesData);
                } catch (error) {
                    alert("There was an error when loading balances: " + error);
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchClosedTrades();
    }, []);

    return (
        <div className="content p-8 text-black dark:text-white">
            < TradesTable trades={opentrades} tabletype='open' />
            < TradesTable trades={closedtrades} tabletype='close' />
        </div>
    )
});

export default TradesAnalysisPage
