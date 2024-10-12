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

const TradesTable: React.FC<{ trades: Trade[], tabletype: string }> = ({ trades, tabletype }) => {
  return (
    <div className='w-full px-4 md:px-8 py-8 border border-neutral-700 rounded-lg mb-8' style={{
      background: tabletype === "open" ?
        "linear-gradient(to top left, rgba(135, 206, 250, 0.2), rgba(135, 206, 250, 0))" :
        tabletype === "close" ?
          "linear-gradient(to top left, rgba(250, 178, 133, 0.2), rgba(135, 206, 250, 0))" :
          "linear-gradient(to top left, rgba(169, 169, 169, 0.2), rgba(135, 206, 250, 0))",
    }}>
      <h3 className="w-full text-lg md:text-xl font-bold mb-5 text-center">
        {tabletype === "open"
          ? "Open Trades"
          : tabletype === "close"
            ? "Closed Trades"
            : "Archived Trades"}
      </h3>
      {trades.length === 0 ?
        <div className="text-center text-gray-500">
          No{" "}
          {tabletype === "open" ? "Open" :
            tabletype === "close" ? "Closed" : "Archived"}
          {" "}
          Trades Available.
        </div>
        :
        <div className='max-w-full overflow-x-auto'>
          <div className='w-full table '>
            <div className='table-header-group text-sm lg-text-lg'>
              <div className='table-cell text-left border border-neutral-700 px-3 py-4 rounded-tl-md'>ProcessId</div>
              <div className='table-cell text-left border border-neutral-700 px-3 py-4'>Country</div>
              <div className='table-cell text-left border border-neutral-700 px-3 py-4'>City</div>
              <div className='table-cell text-left border border-neutral-700 px-3 py-4'>Bought Temp</div>
              <div className='table-cell text-left border border-neutral-700 px-3 py-4'>Closing Temp</div>
              <div className='table-cell text-left border border-neutral-700 px-3 py-4'>Contract Type</div>
              <div className='table-cell text-left border border-neutral-700 px-3 py-4'>Trade Amount</div>
              <div className='table-cell text-left border border-neutral-700 px-3 py-4'>Created Time</div>
              <div className='table-cell text-left border border-neutral-700 px-3 py-4'>Contract Expiry</div>
              <div className='table-cell text-left border border-neutral-700 px-3 py-4'>Contract Status</div>
              <div className='table-cell text-left border border-neutral-700 px-3 py-4'>Closing Time</div>
              <div className='table-cell text-left border border-neutral-700 px-3 py-4'>Payout</div>
              <div className='table-cell text-left border border-neutral-700 px-3 py-4 rounded-tr-md'>Outcome</div>
            </div>
            <div className='table-row-group text-xs lg:text-md'>
              {trades.map((trade: Trade, index: number) => (
                <div className='table-row' key={index}>
                  <div className='table-cell text-left border border-neutral-700 px-3 py-4'>{trade.UserId.substring(0, 8)}</div>
                  <div className='table-cell text-left border border-neutral-700 px-3 py-4'>{trade.Country}</div>
                  <div className='table-cell text-left border border-neutral-700 px-3 py-4'>{trade.City}</div>
                  <div className='table-cell text-left border border-neutral-700 px-3 py-4'>{trade.CurrentTemp}</div>
                  <div className='table-cell text-left border border-neutral-700 px-3 py-4'>{trade.ClosingTemp}</div>
                  <div className='table-cell text-left border border-neutral-700 px-3 py-4'>{trade.ContractType}</div>
                  <div className='table-cell text-left border border-neutral-700 px-3 py-4'>{trade.BetAmount}</div>
                  <div className='table-cell text-left border border-neutral-700 px-3 py-4'>{trade.CreatedTime}</div>
                  <div className='table-cell text-left border border-neutral-700 px-3 py-4'>{trade.ContractExpiry}</div>
                  <div className='table-cell text-left border border-neutral-700 px-3 py-4'>{trade.ContractStatus}</div>
                  <div className='table-cell text-left border border-neutral-700 px-3 py-4'>{trade.ClosingTime}</div>
                  <div className='table-cell text-left border border-neutral-700 px-3 py-4'>{trade.Payout}</div>
                  <div className='table-cell text-left border border-neutral-700 px-3 py-4'>{trade.Outcome}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    </div>
  );
}

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
    <div className="content py-8 h-full  px-1 md:px-8 text-black dark:text-white">
      {loading ? (
        <div className="flex flex-col justify-center items-center h-full">
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
