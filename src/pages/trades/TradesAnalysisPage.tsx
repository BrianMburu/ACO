import React, { useState, useEffect } from "react";
import { FaSpinner } from "react-icons/fa"; // Import spinner icon
import { message, createDataItemSigner, result } from "@permaweb/aoconnect";
import * as othent from "@othent/kms";

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
            : tabletype === "close"
            ? "linear-gradient(to top left, rgba(250, 178, 133, 0.2), rgba(135, 206, 250, 0))"
            : "linear-gradient(to top left, rgba(169, 169, 169, 0.2), rgba(135, 206, 250, 0))",
      }}
    >
      <h3 className="w-full text-xl font-bold mb-5 text-center">
        {tabletype === "open"
          ? "Open Trades"
          : tabletype === "close"
          ? "Closed Trades"
          : "Archived Trades"}
      </h3>
      {trades.length === 0 ? (
        <div className="text-center text-gray-500">
          No{" "}
          {tabletype === "open"
            ? "Open"
            : tabletype === "close"
            ? "Closed"
            : "Archived"}{" "}
          Trades Available.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-neutral-700">
            <thead>
              <tr>
                <th className="px-4 py-2 border border-neutral-700">
                  ProcessId
                </th>
                <th className="px-4 py-2 border border-neutral-700">Country</th>
                <th className="px-4 py-2 border border-neutral-700">City</th>
                <th className="px-4 py-2 border border-neutral-700">
                  Bought Temp
                </th>
                <th className="px-4 py-2 border border-neutral-700">
                  Closing Temp
                </th>
                <th className="px-4 py-2 border border-neutral-700">
                  Contract Type
                </th>
                <th className="px-4 py-2 border border-neutral-700">
                  Trade Amount
                </th>
                <th className="px-4 py-2 border border-neutral-700">
                  Created Time
                </th>
                <th className="px-4 py-2 border border-neutral-700">
                  Contract Expiry
                </th>
                <th className="px-4 py-2 border border-neutral-700">
                  Contract Status
                </th>
                <th className="px-4 py-2 border border-neutral-700">
                  Closing Time
                </th>
                <th className="px-4 py-2 border border-neutral-700">Payout</th>
                <th className="px-4 py-2 border border-neutral-700">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade: Trade, index: number) => (
                <tr key={index} className="bg-gray-100 dark:bg-gray-800">
                  <td className="px-4 py-2 border border-neutral-700">
                    {trade.UserId.substring(0, 8)}
                  </td>
                  <td className="px-4 py-2 border border-neutral-700">
                    {trade.Country}
                  </td>
                  <td className="px-4 py-2 border border-neutral-700">
                    {trade.City}
                  </td>
                  <td className="px-4 py-2 border border-neutral-700">
                    {trade.CurrentTemp}
                  </td>
                  <td className="px-4 py-2 border border-neutral-700">
                    {trade.ClosingTemp || "Pending"}
                  </td>
                  <td className="px-4 py-2 border border-neutral-700">
                    {trade.ContractType}
                  </td>
                  <td className="px-4 py-2 border border-neutral-700">
                    {trade.BetAmount}
                  </td>
                  <td className="px-4 py-2 border border-neutral-700">
                    {trade.CreatedTime}
                  </td>
                  <td className="px-4 py-2 border border-neutral-700">
                    {trade.ContractExpiry}
                  </td>
                  <td className="px-4 py-2 border border-neutral-700">
                    {trade.ContractStatus}
                  </td>
                  <td className="px-4 py-2 border border-neutral-700">
                    {trade.ClosingTime || "Pending"}
                  </td>
                  <td className="px-4 py-2 border border-neutral-700">
                    {trade.Payout}
                  </td>
                  <td className="px-4 py-2 border border-neutral-700">
                    {trade.Outcome}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const TradesAnalysisPage: React.FC = () => {
  interface Tag {
    name: string;
    value: string;
  }

  const AOC = "ga5QHk3FOfKf4YoEQxQSuZDgL5Z4Rjbswk3ASg2CeQE";
  const [opentrades, setOpenTrades] = useState<Trade[]>([]);
  const [closedtrades, setClosedTrades] = useState<Trade[]>([]);
  const [archivedtrades, setArchivedTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchTradesData = async () => {
      setLoading(true); // Start loading

      try {
        const othentSigner = createDataItemSigner(othent);

        // Fetch open trades
        const openTradesResponse = await message({
          process: AOC,
          tags: [{ name: "Action", value: "openTrades" }],
          signer: othentSigner,
        });

        const openTradesResult = await result({
          message: openTradesResponse,
          process: AOC,
        });

        if (!openTradesResult.Error) {
          const data = JSON.parse(openTradesResult.Messages[0].Data);
          const openTradesData = Object.entries(data).map(([name, details]) => {
            const typedDetails: TradeDetails = details as TradeDetails;
            return {
              ...typedDetails,
              BetAmount: typedDetails.BetAmount / 1000000000000,
              ContractExpiry: new Date(
                typedDetails.ContractExpiry
              ).toLocaleString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }),
              CreatedTime: new Date(typedDetails.CreatedTime).toLocaleString(
                "en-US",
                {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
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
            };
          });
          setOpenTrades(openTradesData);
        }

        // Fetch closed trades
        const closedTradesResponse = await message({
          process: AOC,
          tags: [{ name: "Action", value: "closedTrades" }],
          signer: othentSigner,
        });

        const closedTradesResult = await result({
          message: closedTradesResponse,
          process: AOC,
        });

        if (!closedTradesResult.Error) {
          const data = JSON.parse(closedTradesResult.Messages[0].Data);
          const closedTradesData = Object.entries(data).map(
            ([name, details]) => {
              const typedDetails: TradeDetails = details as TradeDetails;
              return {
                ...typedDetails,
                BetAmount: typedDetails.BetAmount / 1000000000000,
                ContractExpiry: new Date(
                  typedDetails.ContractExpiry
                ).toLocaleString("en-US", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                }),
                CreatedTime: new Date(typedDetails.CreatedTime).toLocaleString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
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
              };
            }
          );
          setClosedTrades(closedTradesData);
        }

        // Fetch archived trades
        const archivedTradesResponse = await message({
          process: AOC,
          tags: [{ name: "Action", value: "archivedTrades" }],
          signer: othentSigner,
        });

        const archivedTradesResult = await result({
          message: archivedTradesResponse,
          process: AOC,
        });

        if (!archivedTradesResult.Error) {
          const data = JSON.parse(archivedTradesResult.Messages[0].Data);
          const archivedTradesData = Object.entries(data).map(
            ([name, details]) => {
              const typedDetails: TradeDetails = details as TradeDetails;
              return {
                ...typedDetails,
                BetAmount: typedDetails.BetAmount / 1000000000000,
                ContractExpiry: new Date(
                  typedDetails.ContractExpiry
                ).toLocaleString("en-US", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                }),
                CreatedTime: new Date(typedDetails.CreatedTime).toLocaleString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
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
              };
            }
          );
          setArchivedTrades(archivedTradesData);
        }

        setLoading(false); // End loading when all trades are fetched
      } catch (error) {
        console.error("Error fetching trades:", error);
        setLoading(false); // End loading on error
      }
    };

    fetchTradesData();
  }, []);

  return (
    <div className="container mx-auto p-8">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-3xl" />{" "}
          {/* Loading Spinner */}
        </div>
      ) : (
        <>
          <TradesTable trades={opentrades} tabletype="open" />
          <TradesTable trades={closedtrades} tabletype="close" />
          <TradesTable trades={archivedtrades} tabletype="archive" />
        </>
      )}
    </div>
  );
};

export default TradesAnalysisPage;
