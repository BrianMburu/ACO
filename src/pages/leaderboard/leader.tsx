import React, { useState, useEffect } from "react";
import { message, createDataItemSigner, result } from "@permaweb/aoconnect";
import * as othent from "@othent/kms";
import { FaSpinner } from "react-icons/fa"; // Import spinner icon
import useCronTick from "../../utils/useCronTick";

const LeaderboardPage: React.FC = () => {
  const AOC = "ga5QHk3FOfKf4YoEQxQSuZDgL5Z4Rjbswk3ASg2CeQE"; // Your process ID

  interface Stats {
    totalTrades: number;
    wins: number;
    losses: number;
    winRate: number;
  }

  interface TraderData {
    UserId: string;
    stats: Stats;
  }

  interface LeaderboardEntry {
    totalTrades: number;
    wins: number;
    losses: number;
    winRate: number;
    traderID: string;
  }

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [sendSuccess, setSuccess] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true); // Start loading

      try {
        const signer = createDataItemSigner(othent); // Create Othent signer

        // Send message to fetch leaderboard
        const messageResponse = await message({
          process: AOC,
          tags: [{ name: "Action", value: "fetch_leaderboard" }],
          signer, // Using Othent signer here
        });

        const getLeaderboardMessage = messageResponse;
        try {
          const { Messages, Error } = await result({
            message: getLeaderboardMessage,
            process: AOC,
          });

          if (Error) {
            alert("Error fetching leaderboard: " + Error);
            setLoading(false);
            return;
          }

          if (!Messages || Messages.length === 0) {
            alert("No messages were returned from AO. Please try later.");
            setLoading(false);
            return;
          }

          // Explicitly cast the parsed data to Record<string, TraderData>
          const data: Record<string, TraderData> = JSON.parse(Messages[0].Data);

          // Properly map the leaderboard data
          const leaderboardData = Object.entries(data).map(
            ([rank, traderData]) => ({
              traderID: traderData.UserId,
              totalTrades: traderData.stats.totalTrades,
              wins: traderData.stats.wins,
              losses: traderData.stats.losses,
              winRate: traderData.stats.winRate,
              rank: parseInt(rank), // Parse rank as an integer
            })
          );

          // Sort the leaderboard data by win rate, then by total trades if win rates are the same
          const sortedLeaderboard = leaderboardData.sort((a, b) => {
            if (b.winRate === a.winRate) {
              return b.totalTrades - a.totalTrades; // Compare total trades if win rates are equal
            }
            return b.winRate - a.winRate; // Compare win rates
          });

          setLeaderboard(sortedLeaderboard); // Update the leaderboard state
          setLoading(false); // End loading
        } catch (error) {
          alert("There was an error when loading the leaderboard: " + error);
          setLoading(false); // End loading on error
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setLoading(false); // End loading on error
      }
    };

    fetchLeaderboard(); // Call fetchLeaderboard when component mounts
  }, []);
  useCronTick(AOC);
  return (
    <div className="content py-8 px-1 md:px-8 h-full text-black dark:text-white">
      {loading ? (
        <div className="flex justify-center items-center h-full">
          {/* Loading Spinner */}
          <FaSpinner className="animate-spin text-3xl" />{" "}
        </div>
      ) :
        <div
          className="w-full px-4 md:px-8 py-8 border border-neutral-700 rounded-lg mb-8"
          style={{
            background:
              "linear-gradient(to top left, rgba(135, 206, 250, 0.2), rgba(135, 206, 250, 0))",
          }}
        >
          <h3 className="w-full text-lg md:text-xl font-bold mb-5 text-center">
            LeaderBoard
          </h3>
          {leaderboard.length === 0 ? (
            <div className="text-center text-gray-500">
              No traders found on the leaderboard.
            </div>
          ) : (
            <div className='max-w-full overflow-x-auto'>
              <div className="table w-full">
                <div className="table-header-group text-sm lg-text-lg">
                  <div className="table-cell text-left border border-neutral-700 px-3 py-4 rounded-tl-md">
                    Rank
                  </div>
                  <div className="table-cell text-left border border-neutral-700 px-3 py-4">
                    Trader ID
                  </div>
                  <div className="table-cell text-left border border-neutral-700 px-3 py-4">
                    Total Trades
                  </div>
                  <div className="table-cell text-left border border-neutral-700 px-3 py-4">
                    Wins
                  </div>
                  <div className="table-cell text-left border border-neutral-700 px-3 py-4">
                    Losses
                  </div>
                  <div className="table-cell text-left border border-neutral-700 px-3 py-4 rounded-tr-md">
                    Win Rate (%)
                  </div>
                </div>
                <div className="table-row-group text-xs lg:text-md">
                  {leaderboard.map((entry, index) => (
                    <div className="table-row" key={index}>
                      <div className="table-cell text-left border border-neutral-700 px-3 py-4">
                        {index + 1}
                      </div>
                      <div className="table-cell text-left border border-neutral-700 px-3 py-4">
                        {entry.traderID.substring(0, 8)}
                      </div>
                      <div className="table-cell text-left border border-neutral-700 px-3 py-4">
                        {entry.totalTrades}
                      </div>
                      <div className="table-cell text-left border border-neutral-700 px-3 py-4">
                        {entry.wins}
                      </div>
                      <div className="table-cell text-left border border-neutral-700 px-3 py-4">
                        {entry.losses}
                      </div>
                      <div className="table-cell text-left border border-neutral-700 px-3 py-4">
                        {entry.winRate}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>}
    </div>
  );
};

export default LeaderboardPage;
