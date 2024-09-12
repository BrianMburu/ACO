import React, { useState, useEffect } from 'react';
import axios from "axios";

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, useMapEvents, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import classNames from 'classnames';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

import 'leaflet-control-geocoder/dist/Control.Geocoder.js';
import Select, { ActionMeta, MultiValue } from 'react-select';

import { message, createDataItemSigner, result } from "@permaweb/aoconnect";
import { PermissionType } from "arconnect";
import { FaWallet } from 'react-icons/fa';
import useCronTick from "../utils/useCronTick";

const OverviewSection: React.FC<{ aocBalance: number, wallet: string }> = ({ aocBalance, wallet }) => {
    return (
        <div className="w-full text-white p-6 mb-8 flex flex-wrap justify-between items-center shadow-lg border-b border-b-neutral-700">
            {/* Left Section - Wallet Info */}
            <div className="flex items-start space-x-4">
                <div className='p-2 bg-neutral-700 rounded-full'>
                    <FaWallet size="15" />
                </div>
                <div className='items-start'>
                    <p className="text-gray-400 text-sm">Your Wallet / Balance</p>
                    <div className="flex items-baseline space-x-2">
                        <h2 className="text-3xl font-semibold">{wallet != "" ? wallet : "0x760"}</h2>
                        <span className="text-green-400 text-3xl font-bold">/Aoc {aocBalance}</span>
                    </div>
                    {/* <p className="text-gray-400 text-sm">You Take 7.46% Less Than (Past 2 Months)</p> */}
                </div>
            </div>

            {/* Center Section - Market or Weather Info */}
            <div className="flex flex-col space-y-3 items-start">
                <div className='flex space-x-4'>
                    <div className="text-start text-sm">
                        <p className="text-gray-400">Location</p>
                        <h3 className="text-xs font-semibold ">New York</h3>
                    </div>
                    <div className="text-start text-sm">
                        <p className="text-gray-400">Market Cap</p>
                        <h3 className="text-xs font-semibold">$843,333,177,777</h3>
                    </div>
                    <div className="text-start text-sm">
                        <p className="text-gray-400">Volume (24h)</p>
                        <h3 className="text-xs font-semibold">$29,940,488,608</h3>
                    </div>
                </div>

                {/* Dropdown for selecting weather options */}
                {/* <div>
                    <select className="bg-neutral-800 text-white text-sm p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        onChange={(event) => { updateWeatherOption(event.target.value) }}
                    >
                        <option className='text-xs' value="temperature">Temperature (°C)</option>
                        <option className='text-xs' value="rainfall">Rainfall (mm)</option>
                    </select>
                </div> */}
            </div>
        </div>
    );
};

const AoClimaOptions: React.FC = () => {
    const AOC = "6XvODi4DHKQh1ebBugfyVIXuaHUE5SKEaK1-JbhkMfs";
    const USDA = "GcFxqTQnKHcr304qnOcq00ZqbaYGDn4Wbb0DHAM-wvU";

    const api_key = "a2f4db644e9107746535b0d2ca43b85d";
    const api_Endpoint = "https://api.openweathermap.org/data/2.5/";

    // State to store latitude, longitude, and location
    const [lat, setLat] = useState<number | null>(40.7128);
    const [lng, setLng] = useState<number | null>(-74.0060);
    const [mapLocation, setMapLocation] = useState<string | null>('New York, NY');


    const [weatherData, setWeatherData] = React.useState<WeatherDataProps | null>(
        null
    );
    const [isLoading, setIsLoading] = React.useState(false);
    const [address, setAddress] = useState("");
    const [aocBalance, setAocBalance] = useState(0);
    const [betAmount, setBetAmount] = useState("");
    const [isTradeLoading, setIsTradeLoading] = useState(false)
    // const [betAmountCall, setBetAmountCall] = useState("");
    //     const [betAmountPut, setBetAmountPut] = useState("");
    // const [isLoadingCall, setIsLoadingCall] = useState(false);
    // const [isLoadingPut, setIsLoadingPut] = useState(false);
    const [searchCity, setSearchCity] = React.useState("");

    // Save to localStorage
    // Store selected options for chart
    const [selectedOptions, setSelectedOptions] = useState<any[]>([{ value: 'temp', label: 'Temperature' }]);

    // Save to localStorage
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

    const permissions: PermissionType[] = [
        "ACCESS_ADDRESS",
        "SIGNATURE",
        "SIGN_TRANSACTION",
        "DISPATCH",
    ];

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setBetAmount(value)
    };

    const handleSelectChange = (newValue: MultiValue<any>, actionMeta: ActionMeta<any>) => {
        setSelectedOptions([...newValue]);
    };

    // const fetchCurrentWeather = React.useCallback(
    //     async (lat: number, long: number) => {
    //         const url = `${api_Endpoint}weather?lat=${lat}&lon=${long}&appid=${api_key}&units=metric`;
    //         const response = await axios.get(url);
    //         console.log(response.data)
    //         return response.data;
    //     },
    //     [api_Endpoint, api_key]
    // );

    const fetchCurrentWeather = async (lat: number, long: number) => {
        const url = `${api_Endpoint}weather?lat=${lat}&lon=${long}&appid=${api_key}&units=metric`;
        const searchResponse = await axios.get(url);

        const currentWeatherData: WeatherDataProps = searchResponse.data;

        setWeatherData(currentWeatherData);

        return { currentWeatherData };
    };

    const fetchWeatherData = async (city: string) => {
        const url = `${api_Endpoint}weather?q=${city}&appid=${api_key}&units=metric`;
        const searchResponse = await axios.get(url);

        const currentWeatherData: WeatherDataProps = searchResponse.data;

        setWeatherData(currentWeatherData);
    };

    // const handleSearch = async () => {
    //     if (searchCity.trim() === "") {
    //         return;
    //     }

    //     const { currentWeatherData } = await fetchWeatherData(searchCity);
    //     setWeatherData(currentWeatherData);
    // };

    function reloadPage(forceReload = false): void {
        if (forceReload) {
            // Force reload from the server
            location.href = location.href;
        } else {
            // Reload using the cache
            location.reload();
        }
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

    // Custom map handler to get clicked position
    const MapClickHandler: React.FC = () => {
        useMapEvents({
            click(e: L.LeafletMouseEvent) {
                setLat(e.latlng.lat);
                setLng(e.latlng.lng);
                setMapLocation(`Lat: ${e.latlng.lat}, Lng: ${e.latlng.lng}`);

                // Update the local storage
                localStorage.setItem('lat', e.latlng.lat.toString());
                localStorage.setItem('lng', e.latlng.lng.toString());
                localStorage.setItem('location', `Lat: ${e.latlng.lat}, Lng: ${e.latlng.lng}`);

                // Fly to the clicked coordinates
                e.target.flyTo([e.latlng.lat, e.latlng.lng], 5, {
                    animate: true,
                    duration: 1 // duration in seconds
                });
            },
        });
        return null;
    };

    // Multiselect options for the chart
    const weatherOptions = [
        { value: 'temp', label: 'Temperature' },
        { value: 'rainfall', label: 'Rainfall' },
        { value: 'max_temp', label: 'Max Temperature' },
        { value: 'low_temp', label: 'Low Temperature' },
        { value: 'wind', label: 'Wind' },
        { value: 'cloud_cover', label: 'Cloud Cover' },
    ];

    // Example data for the chart
    const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
        datasets: selectedOptions.map(option => {
            let data;
            let color;
            switch (option.value) {
                case 'temp':
                    data = [31, 35, 26, 33, 21, 37, 39, 40, 35];
                    color = 'rgba(255, 9, 32, 1)';
                    break;
                case 'rainfall':
                    data = [30, 20, 25, 15, 18, 22, 27, 21, 19];
                    color = 'rgba(54, 162, 235, 1)';
                    break;
                case 'max_temp':
                    data = [35, 38, 36, 33, 31, 37, 39, 40, 35];
                    color = 'rgba(255, 99, 132, 1)';
                    break;
                case 'low_temp':
                    data = [22, 20, 25, 24, 21, 19, 23, 26, 24];
                    color = 'rgba(75, 192, 192, 1)';
                    break;
                case 'wind':
                    data = [10, 12, 9, 8, 7, 6, 11, 13, 9];
                    color = 'rgba(153, 102, 255, 1)';
                    break;
                case 'cloud_cover':
                    data = [80, 75, 70, 65, 60, 85, 90, 72, 68];
                    color = 'rgba(255, 206, 86, 1)';
                    break;
                default:
                    data = [];
            }
            return {
                label: option.label,
                data: data,
                borderColor: color,
                fill: false,
                tension: 0.4,
            };
        }),
    };

    const chartOptions = {
        scales: {
            x: {
                grid: {
                    display: true,
                    drawOnChartArea: true,
                    drawTicks: true,
                },
            },
            y: {
                ticks: {
                    display: false
                },
                border: {
                    display: false
                },
                grid: {
                    display: true,
                },
            },
        },
        plugins: {
            tooltip: {
                enabled: true,
            },
            // zoom: {
            //     pan: {
            //         enabled: true,
            //         mode: 'x',
            //     },
            //     zoom: {
            //         enabled: true,
            //         mode: 'x',
            //     },
            // },
        },
    };

    useEffect(() => {
        fetchCurrentWeather(lat!, lng!);

    }, [fetchCurrentWeather, lat, lng]);

    const randomInt = (min: number, max: number): number => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const trade = async (contractType: string) => {
        setIsTradeLoading(true);
        // Function to handle the swap and set success state
        let value = parseInt(betAmount);
        let units = value * 1000000000000;
        let credUnits = units.toString();
        try {
            // Proceed with creating the trade only if send was successful
            const getPropMessage = await message(
                {
                    process: AOC,
                    tags: [
                        { name: "Action", value: "trade" },
                        { name: "TradeId", value: String(randomInt(1, 1000000000)) },
                        { name: "Country", value: String(weatherData?.sys.country!) },
                        { name: "City", value: String(weatherData?.name!) },
                        { name: "CountryId", value: String(weatherData?.id!) },
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
        fetchBalanceAoc(AOC);
    }, [address]);

    useCronTick(AOC);

    useEffect(() => {
        fetchCurrentWeather(lat, lng);
    }, []);

    return (
        <div className={classNames("content p-8 text-black dark:text-white")}>
            {/* Add the new Overview Section */}
            <OverviewSection wallet={address} aocBalance={aocBalance} />

            {/* Map and Call/Put buttons */}
            <div className="relative rounded-lg overflow-hidden">
                {/* Leaflet Map */}
                <MapContainer
                    style={{ height: '400px', width: '100%' }}
                    center={[lat!, lng!]}
                    zoom={1}
                    scrollWheelZoom={true}>
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"//url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'//attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[lat!, lng!]}>
                        <Popup>
                            Lat: {lat}, Lng: {lng}
                        </Popup>
                    </Marker>
                    <MapClickHandler />
                </MapContainer>
            </div>

            {/* Show clicked location */}
            {/* {location && (
                <div className="mt-4 text-gray-700 dark:text-white">
                    <FaHandPointUp className="inline mr-2" />
                    <span>Clicked Location: {location}</span>
                </div>
            )} */}

            {/* Multiselect Input for the Chart */}
            <div className="mt-8">
                <label className="block mb-2 font-semibold">Select Weather Data:</label>
                <Select
                    isMulti
                    options={weatherOptions}
                    defaultValue={selectedOptions}
                    onChange={handleSelectChange}
                    className="text-white bg-gray-900 dark:bg-black dark:text-white"
                    placeholder="Select weather metrics..."
                />
            </div>


            {/* Graph Section */}
            <div className="overflow-x-auto mt-8">
                <div className="min-w-full shadow-lg p-6 bg-gradient-to-tl rounded-lg"
                    style={{ background: 'linear-gradient(to top left, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0))' }}>
                    {/* <h2 className="text-xl font-semibold mb-4">Weather Analysis</h2> */}
                    {/* Call and Put buttons */}
                    <div className='trade-card flex flex-col space-y-4 sm:w-1/3 md:w-1/3 lg:w-1/5'>
                        <div className="relative rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input type="number" name="betAmount" id="amount" className="w-full block rounded-md border-0 py-1.5 pl-7 text-gray-900 ring-1 ring-inset ring-gray-300 
                                placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" placeholder="USDA Amount"
                                value={betAmount} onChange={handleInputChange}>
                            </input>
                        </div>
                        <div className='flex space-x-3 justify-center'>
                            <button className="top-3 w-1/2 left-3 bg-green-500 text-white px-3 py-2 rounded-md opacity-80 hover:opacity-100"
                                onClick={() => trade("Call")}>
                                Buy Higher
                            </button>
                            <button className="top-3 w-1/2 left-20 bg-red-500 text-white px-3 py-2 rounded-md opacity-80 hover:opacity-100"
                                onClick={() => trade("Put")}>
                                Buy Lower
                            </button>
                        </div>
                    </div>
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>
        </div>
    );
};

export default AoClimaOptions;