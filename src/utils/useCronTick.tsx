import { useEffect } from "react";
import { message, createDataItemSigner } from "@permaweb/aoconnect";

import * as othent from "@othent/kms";

const useCronTick = (process: string) => {
  useEffect(() => {
    const checkExpiredContracts = async () => {
      try {
        const signer = createDataItemSigner(othent); // Create Othent signer

        // Send message to check expired contracts
        const messageResponse = await message({
          process,
          tags: [{ name: "Action", value: "Cron" }],
          signer, // Using Othent signer here
        });

        console.log("Expired contracts checked successfully", messageResponse);
      } catch (error) {
        console.error("Error checking expired contracts:", error);
      }
    };

    const intervalId = setInterval(checkExpiredContracts, 100000); // Every minute

    return () => clearInterval(intervalId);
  }, [process]);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const signer = createDataItemSigner(othent); // Create Othent signer

        // Send message to fetch prices
        const messageResponse = await message({
          process,
          tags: [{ name: "Action", value: "completeTrade" }],
          signer, // Using Othent signer here
        });

        console.log("Trades completed successfully", messageResponse);
      } catch (error) {
        console.error("Error completing trade:", error);
      }
    };

    const intervalId = setInterval(fetchPrice, 120000); // Every minute and 5 seconds

    return () => clearInterval(intervalId);
  }, [process]);

  useEffect(() => {
    const closePositions = async () => {
      try {
        const signer = createDataItemSigner(othent); // Create Othent signer

        // Send message to close positions
        const messageResponse = await message({
          process,
          tags: [{ name: "Action", value: "Close-Positions" }],
          signer, // Using Othent signer here
        });

        console.log("Positions closed successfully", messageResponse);
      } catch (error) {
        console.error("Error closing positions:", error);
      }
    };

    const intervalId = setInterval(closePositions, 130000); // Every minute and 15 seconds

    return () => clearInterval(intervalId);
  }, [process]);
};

export default useCronTick;
