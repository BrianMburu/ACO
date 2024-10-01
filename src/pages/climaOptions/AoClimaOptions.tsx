import React, { useState, useEffect } from "react";
import axios from "axios";
import classNames from "classnames";
import * as othent from "@othent/kms";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ChartOptions,
} from "chart.js";
import "chart.js/auto";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);
import "chartjs-adapter-date-fns";

import Select, { MultiValue, SingleValue } from "react-select";

import { message, createDataItemSigner, result } from "@permaweb/aoconnect";
import { PermissionType } from "arconnect";

import useCronTick from "../../utils/useCronTick";
import OverviewSection from "../walletOverview/WalletOverview";
import Map from "../../components/map/Map";
import { FaSpinner } from "react-icons/fa"; // Import the spinner icon

interface HistoricalData {
  time: number[];
  [key: string]: number[];
}

interface OptionType {
  value: string;
  label: string;
}

interface Tag {
  name: string;
  value: string;
}

interface WeatherDataProps {
  name: string;
  id: number;
  dt: number;
  main: {
    temp: number;
  };
  sys: {
    country: string;
  };
}

const weatherOptions: OptionType[] = [
  { value: "temperature_2m", label: "Temperature (2m)" },
  { value: "relative_humidity_2m", label: "Relative Humidity (2m)" },
  { value: "rain", label: "Rain" },
  { value: "showers", label: "Showers" },
  { value: "snowfall", label: "Snowfall" },
  { value: "cloud_cover", label: "Cloud Cover" },
  { value: "cloud_cover_low", label: "Low Cloud Cover" },
  { value: "cloud_cover_mid", label: "Mid Cloud Cover" },
  { value: "cloud_cover_high", label: "High Cloud Cover" },
  { value: "wind_speed_10m", label: "Wind Speed (10m)" },
  { value: "apparent_temperature", label: "Apparent Temperature" },
];

const timeRanges = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const ChartComponent: React.FC<{
  selectedOptions: MultiValue<OptionType>;
  timeRange: SingleValue<OptionType>;
  lat: number;
  lng: number;
}> = ({ selectedOptions, timeRange, lat, lng }) => {
  const [chartData, setChartData] = useState<HistoricalData | null>(null);

  const fetchHistoricalData = async (
    latitude: number,
    longitude: number
  ): Promise<HistoricalData | null> => {
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() - 6);

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`;

    const paramsHistorical = {
      latitude,
      longitude,
      start_date: "2024-01-01",
      end_date: formattedDate,
      hourly: [
        "temperature_2m",
        "relative_humidity_2m",
        "rain",
        "showers",
        "snowfall",
        "cloud_cover",
        "cloud_cover_low",
        "cloud_cover_mid",
        "cloud_cover_high",
        "wind_speed_10m",
        "apparent_temperature",
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

  useEffect(() => {
    fetchHistoricalData(lat, lng)
      .then((data) => {
        setChartData(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [lat, lng]);

  const filterDataByTimeRange = (data: HistoricalData, range: string) => {
    const now = new Date();
    let startDate: Date;

    switch (range) {
      case "daily":
        startDate = new Date(now.getTime() - 48 * 60 * 60 * 1000);
        break;
      case "weekly":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "monthly":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "yearly":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const filteredData: HistoricalData = {
      time: [],
      ...Object.fromEntries(Object.keys(data).map((key) => [key, []])),
    };

    data.time.forEach((time, index) => {
      const date = new Date(time);
      if (date >= startDate) {
        filteredData.time.push(time);
        Object.keys(data).forEach((key) => {
          if (key !== "time") {
            filteredData[key].push(data[key][index]);
          }
        });
      }
    });

    return filteredData;
  };

  const getChartData = () => {
    if (!chartData) return null;

    const filteredData = filterDataByTimeRange(
      chartData,
      timeRange?.value ?? "monthly"
    );

    const labels = filteredData.time.map((time) => new Date(time));
    const datasets = selectedOptions.map((option) => ({
      label: option.label,
      data: filteredData[option.value],
      borderColor: "#4CAF50", // Customize the line color
      fill: false,
    }));

    return {
      labels,
      datasets,
    };
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    scales: {
      x: {
        type: "time",
        time: {
          unit:
            timeRange?.value === "daily"
              ? "hour"
              : timeRange?.value === "weekly"
              ? "day"
              : timeRange?.value === "monthly"
              ? "week"
              : "month",
        },
      },
      y: {
        position: "right",
      },
    },
    plugins: {
      legend: {
        display: true,
      },
    },
  };

  return chartData ? (
    <Line data={getChartData()!} options={chartOptions} />
  ) : (
    <p>Loading chart data...</p>
  );
};

const AoClimaOptions: React.FC = () => {
  const [lat, setLat] = useState<number | null>(40.7128);
  const [lng, setLng] = useState<number | null>(-74.006);
  const [mapLocation, setMapLocation] = useState<string | null>("New York, NY");

  useEffect(() => {
    const storedLat = localStorage.getItem("lat");
    const storedLng = localStorage.getItem("lng");
    const storedMapLocation = localStorage.getItem("location");

    if (storedLat && storedLng && storedMapLocation) {
      setLat(Number(storedLat));
      setLng(Number(storedLng));
      setMapLocation(storedMapLocation);
    }
  }, []);

  const api_key = import.meta.env.VITE_OPENWEATHER_API_KEY;
  const api_Endpoint = "https://api.openweathermap.org/data/2.5/";

  const [weatherData, setWeatherData] = useState<WeatherDataProps | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<
    MultiValue<OptionType>
  >([{ value: "temperature_2m", label: "Temperature (2m)" }]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<
    SingleValue<OptionType>
  >({ value: "monthly", label: "Monthly" });

  const fetchCurrentWeather = async (lat: number, long: number) => {
    const url = `${api_Endpoint}weather?lat=${lat}&lon=${long}&appid=${api_key}&units=metric`;
    const searchResponse = await axios.get(url);
    setWeatherData(searchResponse.data);
  };

  useEffect(() => {
    fetchCurrentWeather(lat!, lng!).catch((error) => {
      console.error(error);
    });
  }, [lat, lng]);

  const AOC = "ga5QHk3FOfKf4YoEQxQSuZDgL5Z4Rjbswk3ASg2CeQE";
  const USDA = "GcFxqTQnKHcr304qnOcq00ZqbaYGDn4Wbb0DHAM-wvU";
  const [aocBalance, setAocBalance] = useState(0);
  const [betAmount, setBetAmount] = useState("");
  const [isTradeLoading, setIsTradeLoading] = useState(false); // Spinner state
  const [usdaBalance, setUsdaBalance] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBetAmount(event.target.value);
  };

  const randomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        setIsLoadingData(true); // Start loading
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
      } catch (error) {
        console.error("Error fetching balances:", error);
      } finally {
        setIsLoadingData(false); // Stop loading
      }
    };

    fetchBalances();
  }, []);

  const trade = async (contractType: string) => {
    setIsTradeLoading(true); // Start spinner
    const value = parseInt(betAmount);
    const credUnits = (value * 1000000000000).toString();

    try {
      const getTradeMessage = await message({
        process: AOC,
        tags: [
          { name: "Action", value: "trade" },
          { name: "TradeId", value: String(randomInt(1, 1000000000)) },
          { name: "Country", value: String(weatherData?.sys.country) },
          { name: "City", value: String(weatherData?.name) },
          { name: "CountryId", value: String(weatherData?.id) },
          { name: "CurrentTemp", value: String(weatherData?.main.temp) },
          { name: "CreatedTime", value: String(weatherData?.dt) },
          {
            name: "ContractType",
            value: contractType === "Call" ? "Call" : "Put",
          },
          { name: "ContractStatus", value: "Open" },
          { name: "BetAmount", value: credUnits },
          { name: "Payout", value: String(1.5) }, // Fixed payout ratio
        ],
        signer: createDataItemSigner(othent),
      });

      const { Messages, Error } = await result({
        message: getTradeMessage,
        process: AOC,
      });

      if (Error) {
        alert("Error trading : " + Error);
        throw new Error(Error);
      }

      alert(Messages[0].Data);
      setBetAmount(""); // Reset the amount after a successful trade
    } catch (error) {
      alert("There was an error in the trade process: " + error);
      console.error(error);
    } finally {
      setIsTradeLoading(false); // Stop spinner
      reloadPage(true); // Reload page after trade
    }
  };

  useCronTick(AOC);

  function reloadPage(forceReload = false): void {
    if (forceReload) {
      location.href = location.href;
    } else {
      location.reload();
    }
  }

  return (
    <div className={classNames("content text-black dark:text-white")}>
      <OverviewSection aocBalance={aocBalance} usdaBalance={usdaBalance} />

      <div className="p-8 pt-0">
        <div className="pb-4 text-xl font-semibold text-white">
          <h2>Select Location to Predict from the Map:</h2>
        </div>

        <div className="relative rounded-lg overflow-hidden text-white dark:text-blue-700 font-semibold">
          <Map lat={lat!} lng={lng!} setLat={setLat} setLng={setLng} />
        </div>

        <div className="flex w-full justify-between flex-wrap-reverse lg:space-x-4 sm:space-x-0 mt-8 weather-options">
          <div className="sm:w-100 lg:w-1/2 max-w-1/2">
            <label className="block mb-2 text-xl text-white font-semibold">
              Select Weather Data:
            </label>
            <Select
              isMulti
              options={weatherOptions}
              defaultValue={selectedOptions}
              onChange={setSelectedOptions}
              className="bg-gray-900 dark:bg-black text-black dark:text-white"
              placeholder="Select weather metrics..."
            />
          </div>
          <div className="sm:w-50 lg:w-1/3 max-w-1/2">
            <label className="block mb-2 text-xl text-white font-semibold">
              Select Time Range:
            </label>
            <Select
              options={timeRanges}
              defaultValue={selectedTimeRange}
              onChange={setSelectedTimeRange}
              className="bg-gray-900 dark:bg-black text-black dark:text-white"
              placeholder="Select time range..."
            />
          </div>
        </div>

        <div className="overflow-x-auto mt-8">
          <div
            className="h-500px w-full shadow-lg p-6 bg-gradient-to-tl rounded-lg"
            style={{
              background:
                "linear-gradient(to top left, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0))",
            }}
          >
            <div className="trade-card flex flex-col space-y-4 sm:w-1/3 md:w-1/3 lg:w-1/5">
              <div className="relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="betAmount"
                  id="amount"
                  className="w-full block rounded-md border-0 py-1.5 pl-7 text-white ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="USDA Amount"
                  value={betAmount}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex space-x-3 justify-center">
                <button
                  className="top-3 w-1/2 left-3 bg-green-500 text-white lg:text-sm px-3 py-2 rounded-md opacity-80 hover:opacity-100"
                  onClick={() => trade("Call")}
                  disabled={isTradeLoading}
                >
                  {isTradeLoading ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    "Buy Higher"
                  )}
                </button>
                <button
                  className="top-3 w-1/2 left-20 bg-red-500 text-white lg:text-sm px-3 py-2 rounded-md opacity-80 hover:opacity-100"
                  onClick={() => trade("Put")}
                  disabled={isTradeLoading}
                >
                  {isTradeLoading ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    "Buy Lower"
                  )}
                </button>
              </div>
            </div>
            <ChartComponent
              selectedOptions={selectedOptions}
              timeRange={selectedTimeRange}
              lat={lat!}
              lng={lng!}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AoClimaOptions;
