import React, { useState, useEffect } from 'react';
import axios from "axios";
import classNames from 'classnames';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, useMapEvents, Marker, Popup, useMap } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider, SearchControl } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartOptions, TimeScale } from 'chart.js';
import 'chart.js/auto';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);
import 'chartjs-adapter-date-fns';

import Select, { ActionMeta, MultiValue, SingleValue } from 'react-select';

import { message, createDataItemSigner, result } from "@permaweb/aoconnect";
import { PermissionType } from "arconnect";

import useCronTick from "../../utils/useCronTick";
import OverviewSection from "../walletOverview/WalletOverview"
import Map from "../../components/map/Map"

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
    { value: 'temperature_2m', label: 'Temperature (2m)' },
    { value: 'relative_humidity_2m', label: 'Relative Humidity (2m)' },
    { value: 'rain', label: 'Rain' },
    { value: 'showers', label: 'Showers' },
    { value: 'snowfall', label: 'Snowfall' },
    { value: 'cloud_cover', label: 'Cloud Cover' },
    { value: 'cloud_cover_low', label: 'Low Cloud Cover' },
    { value: 'cloud_cover_mid', label: 'Mid Cloud Cover' },
    { value: 'cloud_cover_high', label: 'High Cloud Cover' },
    { value: 'wind_speed_10m', label: 'Wind Speed (10m)' },
    { value: 'apparent_temperature', label: 'Apparent Temperature' }
];

const timeRanges = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
];

const ChartComponent: React.FC<{
    selectedOptions: MultiValue<OptionType>,
    timeRange: SingleValue<OptionType>,
    lat: number, lng: number
}> = ({ selectedOptions, timeRange, lat, lng }) => {
    const [chartData, setChartData] = useState<HistoricalData | null>(null);

    // Function to fetch Weather historical data
    const fetchHistoricalData = async (latitude: number, longitude: number): Promise<HistoricalData | null> => {
        const currentDate = new Date();

        // Subtract 6 hours from the current time
        currentDate.setHours(currentDate.getHours() - 6);

        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(currentDate.getDate()).padStart(2, '0');

        const formattedDate = `${year}-${month}-${day}`; // current day.

        const paramsHistorical = {
            latitude,
            longitude,
            start_date: "2024-01-01",
            end_date: formattedDate,
            hourly: ["temperature_2m", "relative_humidity_2m", "rain", "showers", "snowfall", "cloud_cover", "cloud_cover_low", "cloud_cover_mid", "cloud_cover_high", "wind_speed_10m", "apparent_temperature"]
        };

        const urlHistorical = "https://archive-api.open-meteo.com/v1/archive";
        try {
            const response = await axios.get(urlHistorical, { params: paramsHistorical });
            return response.data.hourly; // Return historical data
        } catch (error) {
            console.error("Error fetching historical data:", error);
            return null;
        }
    };

    // Fetch historical weather data on map click or search.
    useEffect(() => {
        fetchHistoricalData(lat, lng)
            .then((data) => {
                setChartData(data);
                // console.log(data);
            })
            .catch((error) => { console.log(error); });
    }, [lat, lng]);

    const filterDataByTimeRange = (data: HistoricalData, range: string) => {
        const now = new Date();
        let startDate: Date;

        switch (range) {
            case 'daily':
                startDate = new Date(now.getTime() - 48 * 60 * 60 * 1000);
                break;
            case 'weekly':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'monthly':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'yearly':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        const filteredData: HistoricalData = { time: [], ...Object.fromEntries(Object.keys(data).map(key => [key, []])) };

        data.time.forEach((time, index) => {
            const date = new Date(time);

            if (date >= startDate) {
                filteredData.time.push(time);
                Object.keys(data).forEach(key => {
                    if (key !== 'time') {
                        filteredData[key].push(data[key][index]);
                    }
                });
            }
        });

        return filteredData;
    }

    const getChartData = () => {
        if (!chartData) return null;

        const filteredData = filterDataByTimeRange(chartData, timeRange?.value ?? 'monthly');

        const labels = filteredData.time.map((time) => new Date(time));
        const datasets = selectedOptions.map((option) => ({
            label: option.label,
            data: filteredData[option.value],
            borderColor: getRandomColor(),
            fill: false
        }));

        return {
            labels,
            datasets
        };
    };

    const getRandomColor = (): string => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    const chartOptions: ChartOptions<'line'> = {
        responsive: true,
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: timeRange?.value === 'daily' ? 'hour' :
                        timeRange?.value === 'weekly' ? 'day' :
                            timeRange?.value === 'monthly' ? 'week' : 'month',
                    tooltipFormat: timeRange?.value === 'daily' ? 'PPpp' :
                        timeRange?.value === 'weekly' ? 'PP' :
                            timeRange?.value === 'monthly' ? 'MMM yyyy' : 'yyyy'
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
                    display: false
                },
                grid: {
                    display: true,
                },
                position: 'right',
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
                        const label = context.dataset.label ?? '';
                        const value = context.raw;
                        const time = new Date(context.label).toLocaleString();
                        return `${label}: ${value} (${time})`;
                    }
                }
            },
        },

        // elements: {
        //     line: {
        //         tension: 0.4, // Curved line
        //     },
        // },
    };

    return (
        <>
            {chartData && (
                <Line
                    data={getChartData()!}
                    options={chartOptions}
                />
            )}
        </>
    );
};

const AoClimaOptions: React.FC = () => {
    /* MAP START */
    // State to store latitude, longitude, and location
    const [lat, setLat] = useState<number | null>(40.7128);
    const [lng, setLng] = useState<number | null>(-74.0060);
    const [mapLocation, setMapLocation] = useState<string | null>('New York, NY');

    // Save Lat, Long to localStorage
    useEffect(() => {
        const storedLat = localStorage.getItem('lat');
        const storedLng = localStorage.getItem('lng');
        const storedMapLocation = localStorage.getItem('location');

        if (storedLat !== null && storedLng !== null && storedMapLocation !== null) {
            setLat(Number(storedLat));
            setLng(Number(storedLng));
            setMapLocation(storedMapLocation);
        }

    }, []);
    /* MAP END */


    /* WEATHER START */
    const api_key = import.meta.env.VITE_OPENWEATHER_API_KEY;

    if (!api_key) {
        throw new Error(`No OpenWeather API key Found in environment`)
    }

    const api_Endpoint = "https://api.openweathermap.org/data/2.5/";

    const [weatherData, setWeatherData] = React.useState<WeatherDataProps | null>(
        null
    );
    // Store selected options for chart
    const [selectedOptions, setSelectedOptions] = useState<MultiValue<OptionType>>([{ value: 'temperature_2m', label: 'Temperature (2m)' },]);

    // Handle weather options select change
    const handleSelectChange = (selected: MultiValue<OptionType>) => {
        setSelectedOptions(selected);
    };

    const [selectedTimeRange, setSelectedTimeRange] = useState<SingleValue<OptionType>>({ value: 'monthly', label: 'Monthly' });

    const handleTimeRangeChange = (selected: SingleValue<OptionType>) => {
        setSelectedTimeRange(selected);
    };

    const fetchCurrentWeather = async (lat: number, long: number) => {
        const url = `${api_Endpoint}weather?lat=${lat}&lon=${long}&appid=${api_key}&units=metric`;
        const searchResponse = await axios.get(url);

        const currentWeatherData: WeatherDataProps = searchResponse.data;

        setWeatherData(currentWeatherData);

        return { currentWeatherData };
    };

    // Fetch current weather data on map click or search.
    useEffect(() => {
        fetchCurrentWeather(lat!, lng!)
            .catch((error) => { console.log(error); });
    }, [lat, lng]);
    /* WEATHER END */


    /* TRADE START */
    const AOC = "6XvODi4DHKQh1ebBugfyVIXuaHUE5SKEaK1-JbhkMfs";
    const USDA = "GcFxqTQnKHcr304qnOcq00ZqbaYGDn4Wbb0DHAM-wvU";

    const [isLoading, setIsLoading] = React.useState(false);
    const [address, setAddress] = useState("");
    const [aocBalance, setAocBalance] = useState(0);
    const [betAmount, setBetAmount] = useState("");
    const [isTradeLoading, setIsTradeLoading] = useState(false)

    const permissions: PermissionType[] = [
        "ACCESS_ADDRESS",
        "SIGNATURE",
        "SIGN_TRANSACTION",
        "DISPATCH",
    ];

    // Handle betamount's input change
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setBetAmount(value)
    };

    const randomInt = (min: number, max: number): number => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const trade = async (contractType: string) => {
        setIsTradeLoading(true);
        // Function to handle the swap and set success state
        const value = parseInt(betAmount);
        const units = value * 1000000000000;
        const credUnits = units.toString();
        try {
            // Proceed with creating the trade only if send was successful
            const getPropMessage = await message(
                {
                    process: AOC,
                    tags: [
                        { name: "Action", value: "trade" },
                        { name: "TradeId", value: String(randomInt(1, 1000000000)) },
                        { name: "Country", value: String(weatherData?.sys.country) },
                        { name: "City", value: String(weatherData?.name) },
                        { name: "CountryId", value: String(weatherData?.id) },
                        { name: "CurrentTemp", value: String(weatherData?.main.temp) },
                        { name: "CreatedTime", value: String(weatherData?.dt) },
                        { name: "ContractType", value: contractType == "Call" ? "Call" : "Put" },
                        { name: "ContractStatus", value: "Open" },
                        {
                            name: "BetAmount",
                            value: credUnits,
                        },
                        { name: "Payout", value: String(1.5) },
                    ],
                    signer: createDataItemSigner(window.arweaveWallet),
                });

            let { Messages, Error } = await result({
                message: getPropMessage,
                process: AOC,
            });

            if (Error) {
                alert("Error trading : " + Error);
                return;
            }
            if (!Messages || Messages.length === 0) {
                alert("No messages were returned from ao. Please try later.");
                return;
            }
            alert(Messages[0].Data);
            setBetAmount("");
        } catch (error) {
            alert("There was an error in the trade process: " + error);
        }

        setIsTradeLoading(false);
        reloadPage(true);
    };

    // Fetch AOC balance from deposited amount.
    useEffect(() => {
        const fetchBalanceAoc = async (process: string) => {
            try {
                const messageResponse = await message({
                    process,
                    tags: [{ name: "Action", value: "Balance" }],
                    signer: createDataItemSigner(window.arweaveWallet),
                });
                const getBalanceMessage = messageResponse;
                try {
                    let { Messages, Error } = await result({
                        message: getBalanceMessage,
                        process,
                    });
                    if (Error) {
                        alert("Error fetching balances:" + Error);
                        return;
                    }
                    if (!Messages || Messages.length === 0) {
                        alert("No messages were returned from ao. Please try later.");
                        return;
                    }
                    const balanceTag = Messages[0].Tags.find(
                        (tag: Tag) => tag.name === "Balance"
                    );
                    const balance = balanceTag
                        ? parseFloat((balanceTag.value / 1000000000000).toFixed(4))
                        : 0;
                    if (process === AOC) {
                        setAocBalance(balance);
                    }
                } catch (error) {
                    alert("There was an error when loading balances: " + error);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchBalanceAoc(AOC)
            .catch((error) => { console.log(error); });;
    }, [address]);
    /* TRADE END */

    // Add cron tick functionality.
    useCronTick(AOC);

    // Function to reload the page.
    function reloadPage(forceReload = false): void {
        if (forceReload) {
            // Force reload from the server
            location.href = location.href;
        } else {
            // Reload using the cache
            location.reload();
        }
    }

    return (
        <div className={classNames("content text-black dark:text-white")}>
            {/* Add the new Overview Section */}
            <OverviewSection wallet={address} aocBalance={aocBalance} />

            <div className="p-8 pt-0">
                <div className="pb-4 text-xl font-semibold text-white">
                    <h2>Select Location to Predict from the Map:</h2>
                </div>
                {/* Map and Call/Put buttons */}
                <div className="relative rounded-lg overflow-hidden text-white dark:text-blue-700 font-semibold">
                    <Map lat={lat!} lng={lng!} setLat={setLat} setLng={setLng} />
                </div>

                {/* Multiselect Input for the Chart */}
                <div className="flex w-full justify-between flex-wrap-reverse lg:space-x-4 sm:space-x-0 mt-8 weather-options">
                    <div className="sm:w-100 lg:w-1/2 max-w-1/2">
                        <label className="block mb-2 text-xl text-white font-semibold">Select Weather Data:</label>
                        <Select
                            isMulti
                            options={weatherOptions}
                            defaultValue={selectedOptions}
                            onChange={handleSelectChange}
                            className="bg-gray-900 dark:bg-black text-black dark:text-white"
                            placeholder="Select weather metrics..."
                        />
                    </div>
                    <div className="sm:w-50 lg:w-1/3 max-w-1/2">
                        <label className="block mb-2 text-xl text-white font-semibold">Select Time Range:</label>
                        <Select
                            options={timeRanges}
                            defaultValue={selectedTimeRange}
                            onChange={handleTimeRangeChange}
                            className="bg-gray-900 dark:bg-black text-black dark:text-white"
                            placeholder="Select weather metrics..."
                        />
                    </div>

                </div>

                {/* Graph Section */}
                <div className="overflow-x-auto mt-8">
                    <div className="h-500px w-full shadow-lg p-6 bg-gradient-to-tl rounded-lg"
                        style={{ background: 'linear-gradient(to top left, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0))' }}>
                        {/* <h2 className="text-xl font-semibold mb-4">Weather Analysis</h2> */}
                        {/* Call and Put buttons */}
                        <div className='trade-card flex flex-col space-y-4 sm:w-1/3 md:w-1/3 lg:w-1/5'>
                            <div className="relative rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input type="number" name="betAmount" id="amount" className="w-full block rounded-md border-0 py-1.5 pl-7 text-white ring-1 ring-inset ring-gray-300 
                                placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" placeholder="USDA Amount"
                                    value={betAmount} onChange={handleInputChange}>
                                </input>
                            </div>
                            <div className='flex space-x-3 justify-center'>
                                <button className="top-3 w-1/2 left-3 bg-green-500 text-white lg:text-sm px-3 py-2 rounded-md opacity-80 hover:opacity-100"
                                    onClick={() => trade("Call")}>
                                    Buy Higher
                                </button>
                                <button className="top-3 w-1/2 left-20 bg-red-500 text-white lg:text-sm px-3 py-2 rounded-md opacity-80 hover:opacity-100"
                                    onClick={() => trade("Put")}>
                                    Buy Lower
                                </button>
                            </div>
                        </div>
                        <ChartComponent selectedOptions={selectedOptions} timeRange={selectedTimeRange} lat={lat!} lng={lng!} />
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AoClimaOptions;