import React, { useState, useEffect } from "react";

import * as othent from "@othent/kms";
import { message, createDataItemSigner, result } from "@permaweb/aoconnect";

interface Trade {
  UserId: string;
  TradeId: string; // Changed from number to string
  BetAmount: number;
  ContractType: string;
  Outcome: string;
  Country: string;
  CurrentTemp: string;
  ContractStatus: string;
  CountryId: string;
  ContractExpiry: number; // Changed from string to number (timestamp)
  CreatedTime: number; // Changed from string to number (timestamp)
  ClosingTemp: number;
  ClosingTime: number; // Changed from string to number (timestamp)
  Payout: string; // Changed from number to string
  City: string;
}

interface TradeDetails {
  UserId: string;
  TradeId: string; // Changed from number to string
  BetAmount: number;
  Outcome: string;
  ContractType: string;
  Country: string;
  CurrentTemp: string;
  ContractStatus: string;
  CountryId: string;
  ContractExpiry: number; // Changed from string to number (timestamp)
  CreatedTime: number; // Changed from string to number (timestamp)
  ClosingTemp: number;
  ClosingTime: number; // Changed from string to number (timestamp)
  Payout: string; // Changed from number to string
  City: string;
}

const TradesTable: React.FC<{ trades: Trade[]; tabletype: string }> = ({
  trades,
  tabletype,
}) => {
  return (
    <div
      className="w-full p-8 border border-neutral-700 rounded-lg mb-8"
      style={{
        background:
          tabletype === "open"
            ? "linear-gradient(to top left, rgba(135, 206, 250, 0.2), rgba(135, 206, 250, 0))"
            : "linear-gradient(to top left, rgba(250, 178, 133, 0.2), rgba(135, 206, 250, 0))",
      }}
    >
      <h3 className="w-full text-xl font-bold mb-5 text-center">
        {tabletype === "open" ? "Open Trades" : "Closed Trades"}
      </h3>
      <div className="max-w-full overflow-x-auto">
        <div className="w-full table ">
          <div className="table-header-group">
            <div className="table-cell text-left border border-neutral-700 px-3 py-4 rounded-tl-md">
              ProcessId
            </div>
            <div className="table-cell text-left border border-neutral-700 px-3 py-4">
              Country
            </div>
            <div className="table-cell text-left border border-neutral-700 px-3 py-4">
              City
            </div>
            <div className="table-cell text-left border border-neutral-700 px-3 py-4">
              Bought Temp
            </div>
            <div className="table-cell text-left border border-neutral-700 px-3 py-4">
              Closing Temp
            </div>
            <div className="table-cell text-left border border-neutral-700 px-3 py-4">
              Contract Type
            </div>
            <div className="table-cell text-left border border-neutral-700 px-3 py-4">
              Trade Amount
            </div>
            <div className="table-cell text-left border border-neutral-700 px-3 py-4">
              Created Time
            </div>
            <div className="table-cell text-left border border-neutral-700 px-3 py-4">
              Contract Expiry
            </div>
            <div className="table-cell text-left border border-neutral-700 px-3 py-4">
              Contract Status
            </div>
            <div className="table-cell text-left border border-neutral-700 px-3 py-4">
              Closing Time
            </div>
            <div className="table-cell text-left border border-neutral-700 px-3 py-4">
              Payout
            </div>
            <div className="table-cell text-left border border-neutral-700 px-3 py-4 rounded-tr-md">
              Outcome
            </div>
          </div>
          <div className="table-row-group">
            {trades.map((trade: Trade, index: number) => (
              <div className="table-row" key={index}>
                <div className="table-cell text-left border border-neutral-700 px-3 py-4">
                  {trade.UserId.substring(0, 8)}
                </div>
                <div className="table-cell text-left border border-neutral-700 px-3 py-4">
                  {trade.Country}
                </div>
                <div className="table-cell text-left border border-neutral-700 px-3 py-4">
                  {trade.City}
                </div>
                <div className="table-cell text-left border border-neutral-700 px-3 py-4">
                  {trade.CurrentTemp}
                </div>
                <div className="table-cell text-left border border-neutral-700 px-3 py-4">
                  {trade.ClosingTemp}
                </div>
                <div className="table-cell text-left border border-neutral-700 px-3 py-4">
                  {trade.ContractType}
                </div>
                <div className="table-cell text-left border border-neutral-700 px-3 py-4">
                  {trade.BetAmount}
                </div>
                <div className="table-cell text-left border border-neutral-700 px-3 py-4">
                  {trade.CreatedTime}
                </div>
                <div className="table-cell text-left border border-neutral-700 px-3 py-4">
                  {trade.ContractExpiry}
                </div>
                <div className="table-cell text-left border border-neutral-700 px-3 py-4">
                  {trade.ContractStatus}
                </div>
                <div className="table-cell text-left border border-neutral-700 px-3 py-4">
                  {trade.ClosingTime}
                </div>
                <div className="table-cell text-left border border-neutral-700 px-3 py-4">
                  {trade.Payout}
                </div>
                <div className="table-cell text-left border border-neutral-700 px-3 py-4">
                  {trade.Outcome}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const TradesAnalysisPage: React.FC = () => {
  interface Tag {
    name: string;
    value: string;
  }

  const AOC = "6XvODi4DHKQh1ebBugfyVIXuaHUE5SKEaK1-JbhkMfs";
  const [opentrades, setOpenTrades] = useState<Trade[]>([]);
  const [closedtrades, setClosedTrades] = useState<Trade[]>([]);

  useEffect(() => {
    const fetchOpenTrades = async () => {
      try {
        // Create a signer using othent
        const signer = createDataItemSigner(othent);

        // Send the message to the AO process
        const messageResponse = await message({
          process: AOC,
          tags: [{ name: "Action", value: "openTrades" }],
          signer, // Use the signer created above
        });

        const getProposalsMessage = messageResponse;

        try {
          const { Messages, Error } = await result({
            message: getProposalsMessage,
            process: AOC,
          });

          if (Error) {
            alert("Error fetching proposals: " + Error);
            return;
          }

          if (!Messages || Messages.length === 0) {
            alert("No messages were returned from AO. Please try later.");
            return;
          }

          // Parse the data returned from the message
          const data = JSON.parse(Messages[0].Data);
          const openTradesData = Object.entries(data).map(([name, details]) => {
            const typedDetails = details as TradeDetails;
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
              CountryId: typedDetails.CountryId,
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

          // Set the open trades data to state
          setOpenTrades(openTradesData);
        } catch (error) {
          alert("There was an error when loading balances: " + error);
        }
      } catch (error) {
        console.error("Error fetching open trades:", error);
      }
    };

    // Call the fetch function on component mount
    fetchOpenTrades();
  }, []);

  useEffect(() => {
    const fetchClosedTrades = async () => {
      try {
        const signer = createDataItemSigner(othent);

        const messageResponse = await message({
          process: AOC,
          tags: [{ name: "Action", value: "closedTrades" }],
          signer,
        });

        const { Messages, Error } = await result({
          message: messageResponse,
          process: AOC,
        });

        if (Error) {
          alert("Error fetching closed trades: " + Error);
          return;
        }

        if (!Messages || Messages.length === 0 || !Messages[0].Data) {
          alert("No closed trades were returned from AO.");
          return;
        }

        // Parse the closed trades data
        const data = JSON.parse(Messages[0].Data);

        const closedTradesData = Object.entries(data).map(([name, details]) => {
          const typedDetails = details as TradeDetails;

          return {
            Country: typedDetails.Country,
            City: typedDetails.City,
            CurrentTemp: typedDetails.CurrentTemp,
            ContractStatus: typedDetails.ContractStatus,
            CountryId: typedDetails.CountryId,
            TradeId: typedDetails.TradeId,
            Outcome: typedDetails.Outcome,
            name,
            BetAmount: typedDetails.BetAmount / 1000000000000, // Keep this division if it's expected
            ContractType: typedDetails.ContractType,
            ContractExpiry: typedDetails.ContractExpiry, // Keep as number
            CreatedTime: typedDetails.CreatedTime, // Keep as number
            ClosingTime: typedDetails.ClosingTime ?? null, // Handle as number or null
            ClosingTemp: typedDetails.ClosingTemp,
            Payout: typedDetails.Payout,
            UserId: typedDetails.UserId,
          };
        });

        // Set the closed trades data into state
        setClosedTrades(closedTradesData);
      } catch (error) {
        console.error("Error fetching closed trades:", error);
        alert("There was an error when loading closed trades: " + error);
      }
    };

    fetchClosedTrades(); // Fetch closed trades on component mount
  }, []);

  return (
    <div className="content p-8 text-black dark:text-white">
      <TradesTable trades={opentrades} tabletype="open" />
      <TradesTable trades={closedtrades} tabletype="close" />
    </div>
  );
};

export default TradesAnalysisPage;
