import React, { useState, useEffect } from "react";

import { message, createDataItemSigner, result } from "@permaweb/aoconnect";
import * as othent from "@othent/kms";

const LeaderboardPage: React.FC = () => {
  const AOC = "6XvODi4DHKQh1ebBugfyVIXuaHUE5SKEaK1-JbhkMfs"; // Your process ID

  interface LeaderboardEntry {
    totalTrades: number;
    wins: number;
    losses: number;
    winRate: number;
    traderID: string;
  }

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
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
            return;
          }

          if (!Messages || Messages.length === 0) {
            alert("No messages were returned from AO. Please try later.");
            return;
          }

          const data = JSON.parse(Messages[0].Data);
          const leaderboardData = Object.entries(data).map(
            ([traderID, stats]: [string, any]) => ({
              traderID,
              totalTrades: stats.totalTrades,
              wins: stats.wins,
              losses: stats.losses,
              winRate: stats.winRate,
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
        } catch (error) {
          alert("There was an error when loading the leaderboard: " + error);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };

    fetchLeaderboard(); // Call fetchLeaderboard when component mounts
  }, []);

  return (
    <div className="content p-8 text-black dark:text-white">
      <div
        className="w-full p-8 border border-neutral-700 rounded-lg overflow-hidden"
        style={{
          background:
            "linear-gradient(to top left, rgba(135, 206, 250, 0.2), rgba(135, 206, 250, 0))",
        }}
      >
        <h3 className="w-full text-xl font-bold mb-5 text-center">
          LeaderBoard
        </h3>
        <div className="table w-full">
          <div className="table-header-group">
            <div className="table-cell text-left border border-neutral-700 p-3 rounded-tl-md">
              Rank
            </div>
            <div className="table-cell text-left border border-neutral-700 p-3">
              Trader ID
            </div>
            <div className="table-cell text-left border border-neutral-700 p-3">
              Total Trades
            </div>
            <div className="table-cell text-left border border-neutral-700 p-3">
              Wins
            </div>
            <div className="table-cell text-left border border-neutral-700 p-3">
              Losses
            </div>
            <div className="table-cell text-left border border-neutral-700 p-3 rounded-tr-md">
              Win Rate (%)
            </div>
          </div>
          <div className="table-row-group">
            {leaderboard.map((entry, index) => (
              <div className="table-row" key={index}>
                <div className="table-cell text-left border border-neutral-700 p-3">
                  {index + 1}
                </div>
                <div className="table-cell text-left border border-neutral-700 p-3">
                  {entry.traderID}
                </div>
                <div className="table-cell text-left border border-neutral-700 p-3">
                  {entry.totalTrades}
                </div>
                <div className="table-cell text-left border border-neutral-700 p-3">
                  {entry.wins}
                </div>
                <div className="table-cell text-left border border-neutral-700 p-3">
                  {entry.losses}
                </div>
                <div className="table-cell text-left border border-neutral-700 p-3">
                  {entry.winRate.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
