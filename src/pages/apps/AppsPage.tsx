import React, { useState, useEffect } from "react";
import axios from "axios";

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
  ChartOptions,
  TimeScale,
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

import classNames from "classnames";
import { FaRobot } from "react-icons/fa";
import { CubeTransparentIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

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

interface HistoricalData {
  time: number[];
  [key: string]: number[];
}

const AppsPage: React.FC = () => {
  const navigate = useNavigate();

  const api_key = "a2f4db644e9107746535b0d2ca43b85d";

  if (!api_key) {
    throw new Error(`No OpenWeather API key Found in environment`);
  }

  const api_Endpoint = "https://api.openweathermap.org/data/2.5/";

  const [chartData, setChartData] = useState<HistoricalData | null>(null);
  const [weatherData, setWeatherData] = React.useState<WeatherDataProps | null>(
    null
  );
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("weekly");

  const fetchHistoricalTempData = async (
    latitude: number,
    longitude: number
  ): Promise<HistoricalData | null> => {
    const currentDate = new Date();

    // Subtract 12 hours from the current time
    currentDate.setHours(currentDate.getHours() - 12);

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(currentDate.getDate()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`; // current day.

    const paramsHistorical = {
      latitude,
      longitude,
      start_date: "2024-01-01",
      end_date: formattedDate,
      hourly: ["temperature_2m"],
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

  const fetchCurrentWeather = async (lat: number, long: number) => {
    const url = `${api_Endpoint}weather?lat=${lat}&lon=${long}&appid=${api_key}&units=metric`;
    const searchResponse = await axios.get(url);

    const currentWeatherData: WeatherDataProps = searchResponse.data;

    setWeatherData(currentWeatherData);

    return { currentWeatherData };
  };

  const filterDataByTimeRange = (data: HistoricalData, range: string) => {
    const now = new Date();
    let startDate: Date;

    switch (range) {
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

  const chartOptions: ChartOptions<"line"> = {
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      x: {
        type: "time",
        time: {
          unit:
            selectedTimeRange === "daily"
              ? "hour"
              : selectedTimeRange === "weekly"
                ? "day"
                : selectedTimeRange === "monthly"
                  ? "week"
                  : "month",
          tooltipFormat: "PPpp",
        },
        grid: {
          display: true,
          drawOnChartArea: true,
          drawTicks: true,
        },
      },
      y: {
        ticks: {
          display: true,
        },
        border: {
          display: false,
        },
        grid: {
          display: false,
        },
        position: "right",
      },
    },
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            const label = context.dataset.label ?? "";
            const value = context.raw;
            const time = new Date(context.label).toLocaleString();
            return `${label}: ${value} (${time})`;
          },
        },
      },
    },

    elements: {
      line: {
        tension: 0.4, // Curved line
      },
    },
  };

  const getChartData = () => {
    if (!chartData) return null;

    const filteredData = filterDataByTimeRange(
      chartData,
      selectedTimeRange ?? "weekly"
    );

    const labels = filteredData.time.map((time) => new Date(time));
    const datasets = [
      {
        label: "Temperature 2M (°C)",
        data: filteredData.temperature_2m,
        backgroundColor: "transparent",
        borderColor: "rgba(255, 215, 0, 1)", // Golden border
        fill: true,
        pointRadius: selectedTimeRange === "monthly" ? 1 : 3,
        pointHoverRadius: selectedTimeRange === "monthly" ? 3 : 5,
      },
    ];

    return {
      labels,
      datasets,
    };
  };

  // Fetch current weather data on map click or search.
  useEffect(() => {
    // Default Location New York City
    const lat = 40.7128;
    const lng = -74.006;

    fetchCurrentWeather(lat, lng)
      // .then((data) => { console.log(data); })
      .catch((error) => {
        console.log(error);
      });

    fetchHistoricalTempData(lat, lng)
      .then((data) => {
        setChartData(data);
        // console.log(data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  // console.log(getChartData())
  return (
    <div className={classNames("content text-black dark:text-white flex flex-col")}>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 p-4 md:p-8 gap-6">
        {/* First Card - Temperature Graph */}
        <div className="shadow-lg rounded-lg p-0 md:p-6 border border-neutral-700" style={{
          background: 'linear-gradient(to top left, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0))'
        }}>

          <div className='mb-4 px-4 pt-4 md:p-0 flex justify-between'>
            <div>
              <h2 className="text-xl font-semibold mb-1">AoClimaOptions</h2>
              <h6 className='text-xs text-gray-700 dark:text-gray-400'>
                {"Temparature Overview"}
              </h6>
            </div>
            <div className='rounded-full p-3 bg-gradient-to-b from-neutral-700 to-transparent'>
              <CubeTransparentIcon className='size-6' />
            </div>
          </div>
          <div className='flex px-4 md:p-0 justify-between'>
            <div className='flex text-xs space-x-2 mb-5'>
              <button className={classNames('cursor-pointer rounded-lg text-sm p-1 text-center dark:text-text-white dark:hover:text-white dark:hover:bg-yellow-500 dark:focus:ring-yellow-900',
                { "bg-yellow-500": selectedTimeRange === "weekly" }
              )}
                onClick={() => setSelectedTimeRange("weekly")}>Weekly</button>
              <button className={classNames('cursor-pointer rounded-lg text-sm p-1 text-center dark:text-white dark:hover:text-white dark:hover:bg-yellow-500 dark:focus:ring-yellow-900',
                { "bg-yellow-500": selectedTimeRange === "monthly" }
              )}
                onClick={() => setSelectedTimeRange("monthly")}>Monthly</button>
            </div>
            <div className='text-xs mb-5 p-1'>
              {weatherData?.name}
            </div>
          </div>

          <div className="h-64 md:h-auto px-1 md:p-0 ">
            {chartData && <Line data={getChartData()!}
              options={chartOptions} />}
          </div>
          <div className="mt-4 px-4 pb-4 md:p-0 flex justify-between">
            <div>
              <span className="text-gray-600 dark:text-gray-400 text-sm">Current Temp</span>
              <h3 className="text-md font-bold">{weatherData?.main.temp ?? '...'} °C</h3>
            </div>
            <div className='flex flex-col justify-center'>
              <button type="button" className="text-yellow-400 hover:text-white border border-yellow-400 hover:bg-yellow-700 focus:ring-4 
                            focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-yellow-300 
                            dark:text-yellow-300 dark:hover:text-white dark:hover:bg-yellow-500 dark:focus:ring-yellow-900"
                onClick={() => navigate("/aoclimaoptions")}
              >
                Trade
              </button>
            </div>
          </div>
        </div>

        {/* Second Card - Rainfall Graph */}
        {/* <div className="shadow-lg rounded-lg p-6" style={{
                    background: 'linear-gradient(to top left, rgba(135, 206, 250, 0.2), rgba(135, 206, 250, 0))'
                }}>
                    <h2 className="text-xl font-semibold mb-4">Rainfall Overview</h2>
                    <div className="h-64 lg:h-auto md:h-auto">
                        <Line data={rainfallData} options={chartOptions} />
                    </div>
                    <div className="mt-4">
                        <span className="text-gray-600 dark:text-gray-400">Total Rainfall</span>
                        <h3 className="text-lg font-bold">150 mm</h3>
                    </div>
                </div> */}

        {/* Third Card */}
        <div
          className="rounded-lg p-6 border border-neutral-700 h-fit"
          style={{
            background:
              "linear-gradient(to top left, rgba(135, 206, 250, 0.2), rgba(135, 206, 250, 0))",
          }}
        >
          <div className="mb-4 flex justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-1">AoWeatherOptions</h2>
              <h6 className="text-xs text-gray-700 dark:text-gray-400">
                First Ever Intelligent Weather Dapp
              </h6>
            </div>
            <div className="rounded-full p-3 bg-gradient-to-b from-neutral-700 to-transparent">
              <FaRobot size="24" />
              {/* <CubeTransparentIcon className='size-6' /> */}
            </div>
          </div>

          <div>
            <p>
              Get The best Summarized weather intelligence on AO weather Dapp.
            </p>
          </div>

          <div className="mt-4 flex justify-center">
            <div className="flex flex-col justify-center">
              <button
                type="button"
                className="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 
                        focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-blue-500
                         dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800"
                onClick={() => navigate("/aoweatheragent")}
              >
                Use Agent
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppsPage;
