import React, { useEffect, useState } from "react";
import {
  Button,
  Container,
  Divider,
  Form,
  Message,
  Segment,
  TextArea,
} from "semantic-ui-react";
import { message, createDataItemSigner, result } from "@permaweb/aoconnect";
import { PermissionType } from "arconnect";
import axios from "axios";

interface Tag {
  name: string;
  value: string;
}

interface check {
  Forecast: string;
  Historical: string;
  activities: string;
}

// Function to fetch forecast data
const fetchForecastData = async (latitude: number, longitude: number) => {
  const paramsForecast = {
    latitude,
    longitude,
    hourly: [
      "temperature_2m",
      "relative_humidity_2m",
      "dew_point_2m",
      "apparent_temperature",
      "precipitation_probability",
      "precipitation",
    ],
    forecast_days: 1,
  };

  const url = "https://api.open-meteo.com/v1/forecast";
  try {
    const response = await axios.get(url, { params: paramsForecast });
    return response.data.hourly; // Return forecast data
  } catch (error) {
    console.error("Error fetching forecast data:", error);
    return null;
  }
};

// Function to fetch historical data
const fetchHistoricalData = async (latitude: number, longitude: number) => {
  const paramsHistorical = {
    latitude,
    longitude,
    start_date: "2024-09-06",
    end_date: "2024-09-07",
    hourly: [
      "temperature_2m",
      "relative_humidity_2m",
      "dew_point_2m",
      "apparent_temperature",
      "precipitation",
    ],
  };

  const urlHistorical = "https://archive-api.open-meteo.com/v1/archive";
  try {
    const response = await axios.get(urlHistorical, {
      params: paramsHistorical,
    });
    return response.data.hourly; // Return historical data
  } catch (error) {
    console.error("Error fetching historical data:", error);
    return null;
  }
};

const aoWeatherAgent = () => {
  const NOT = "kN2oP4VDhAVn-7ZuVBTvWvWfD4fLZ5OK_yLCnaFUBNY";
  const AOC = "6XvODi4DHKQh1ebBugfyVIXuaHUE5SKEaK1-JbhkMfs";

  const [forecastData, setForecastData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aocBalance, setAocBalance] = useState(0);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [activities, setActivities] = useState("");
  const [sendSuccess, setSuccess] = useState(false);

  function reloadPage(forceReload: boolean = false): void {
    if (forceReload) {
      // Force reload from the server
      location.href = location.href;
    } else {
      // Reload using the cache
      location.reload();
    }
  }

  // Function to handle check button functionality
  const handleCheck = async () => {
    setIsLoading(true);
    if (latitude === null || longitude === null) {
      alert("Please enter valid latitude and longitude values.");
      return;
    }

    // Function to handle the swap and set success state
    const send = async (): Promise<void> => {
      var units = 1 * 1000000000000;
      var credUnits = units.toString();
      try {
        const getSwapMessage = await message({
          process: AOC,
          tags: [
            { name: "Action", value: "Transfer" },
            { name: "Recipient", value: AOC },
            { name: "Quantity", value: credUnits },
          ],
          signer: createDataItemSigner(window.arweaveWallet),
        });

        let { Messages, Error } = await result({
          message: getSwapMessage,
          process: AOC,
        });
        if (Error) {
          alert("Error Sending AOC: " + Error);
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
        alert("There was an error sending CEC: " + error);
        throw error;
      }
    };
    try {
      // Await the send function to ensure it completes before proceeding
      await send();
      // Fetch both forecast and historical data
      const forecast = await fetchForecastData(latitude, longitude);
      const historical = await fetchHistoricalData(latitude, longitude);
      console.log(forecast);
      console.log(historical);
      setForecastData(forecast);
      setHistoricalData(historical);

      // Call message function with tags for forecast, historical, and activities
      const messageResponse = await message({
        process: NOT,
        tags: [
          { name: "Action", value: "check" },
          { name: "Latitude", value: String(latitude) },
          { name: "Longitude", value: String(longitude) },
          { name: "Activities", value: String(activities) },
        ],
        signer: createDataItemSigner(window.arweaveWallet),
      });

      const resultMessage = await result({
        message: messageResponse,
        process: NOT,
      });

      if (resultMessage.Error) {
        alert("Error: " + resultMessage.Error);
      } else {
        alert("Data successfully sent!");
      }
    } catch (error) {
      console.error("Error during check:", error);
    }
    setIsLoading(false);
    reloadPage(true);
  };

  // Fetch balance when component mounts
  useEffect(() => {
    const fetchBalanceAoc = async (process: string) => {
      try {
        const messageResponse = await message({
          process,
          tags: [{ name: "Action", value: "Balance" }],
          signer: createDataItemSigner(window.arweaveWallet),
        });
        const { Messages, Error } = await result({
          message: messageResponse,
          process,
        });

        if (!Error && Messages && Messages.length > 0) {
          const balanceTag = Messages[0].Tags.find(
            (tag: any) => tag.name === "Balance"
          );
          const balance = balanceTag
            ? parseFloat((balanceTag.value / 1000000000000).toFixed(4))
            : 0;
          setAocBalance(balance);
        }
      } catch (error) {
        console.error("Error fetching AOC balance:", error);
      }
    };
    fetchBalanceAoc(AOC);
  }, []);

  return (
    <Container>
      <Divider />
      <Button>AOC Balance: {aocBalance} Acess Fee IS 1 AOC</Button>
      <Divider />
      <Form size="large">
        <Segment stacked>
          <span>Enter Latitude and Longitude.</span>
          <Divider />
          <Form.Input
            placeholder="Enter Latitude"
            value={latitude ?? ""}
            type="number"
            onChange={(e) => setLatitude(parseFloat(e.target.value))}
          />
          <Form.Input
            placeholder="Enter Longitude"
            value={longitude ?? ""}
            type="number"
            onChange={(e) => setLongitude(parseFloat(e.target.value))}
          />
          <span>Enter Activities you plan on doing today.</span>
          <Divider />
          <TextArea
            placeholder="Activities"
            value={activities}
            onChange={(e) => setActivities(e.target.value)}
          />
          <Divider />
          <Message positive>
            <Message.Header>Disclaimer!</Message.Header>
            <p>AO Weather Agent is still in development. Use with caution.</p>
          </Message>
          <Button
            color="teal"
            fluid
            size="small"
            loading={isLoading}
            onClick={handleCheck}
          >
            Check
          </Button>
        </Segment>
      </Form>
    </Container>
  );
};

export default aoWeatherAgent;
