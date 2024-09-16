import React, { useEffect, useState } from "react";
import L from 'leaflet';
import { MapContainer, TileLayer, useMapEvents, Marker, Popup } from 'react-leaflet';

import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

import { message, createDataItemSigner, result } from "@permaweb/aoconnect";
import { PermissionType } from "arconnect";
import axios from "axios";

import OverviewSection from "../walletOverview/WalletOverview"
import Map from "../../components/map/Map"

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

const AoWeatherAgent: React.FC = () => {
    const NOT = "kN2oP4VDhAVn-7ZuVBTvWvWfD4fLZ5OK_yLCnaFUBNY";
    const AOC = "6XvODi4DHKQh1ebBugfyVIXuaHUE5SKEaK1-JbhkMfs";

    const [lat, setLat] = useState<number | null>(40.7128);
    const [lng, setLng] = useState<number | null>(-74.0060);
    const [forecastData, setForecastData] = useState(null);
    const [historicalData, setHistoricalData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [address, setAddress] = useState("");
    const [aocBalance, setAocBalance] = useState(0);
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [activities, setActivities] = useState("");
    const [sendSuccess, setSuccess] = useState(false);


    // Custom map handler to get clicked position
    const MapClickHandler: React.FC = () => {
        useMapEvents({
            click(e: L.LeafletMouseEvent) {
                setLat(e.latlng.lat);
                setLng(e.latlng.lng);

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

    function reloadPage(forceReload = false): void {
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
        if (lat === null || lng === null) {
            alert("Please enter valid latitude and longitude values.");
            return;
        }

        // Function to handle the swap and set success state
        const send = async (): Promise<void> => {
            const units = 1 * 1000000000000;
            const credUnits = units.toString();
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
                alert("There was an error sending AOC: " + error);
                throw error;
            }
        };
        try {
            // Await the send function to ensure it completes before proceeding
            await send();
            // Fetch both forecast and historical data
            const forecast = await fetchForecastData(lat!, lng!,);
            const historical = await fetchHistoricalData(lat!, lng!);

            console.log(forecast);
            console.log(historical);
            setForecastData(forecast);
            setHistoricalData(historical);

            // Call message function with tags for forecast, historical, and activities
            const messageResponse = await message({
                process: NOT,
                tags: [
                    { name: "Action", value: "check" },
                    { name: "Forecast", value: JSON.stringify(forecast) },
                    { name: "Historical", value: JSON.stringify(historical) },
                    { name: "Activities", value: activities },
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

        fetchBalanceAoc(AOC)
            .catch((error) => { console.error(error); });
    }, []);

    return (
        <div className="content text-black dark:text-white">
            {/* Add the new Overview Section */}
            <OverviewSection wallet={address} aocBalance={aocBalance} />

            <div className="p-8">
                <div className="relative rounded-lg overflow-hidden">
                    {/* Leaflet Map */}
                    <Map lat={lat!} lng={lng!} setLat={setLat} setLng={setLng} />
                </div>

                <div className="mt-8 max-w-1/2">
                    <div className="p-5 border border-gray-700 flex justify-center mb-5">
                        <h1>Disclaimer!</h1>
                        <p>AO Weather Agent is still in development. Use with caution.</p>
                    </div>
                    <div className="mb-5 flex px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                        <textarea id="message" rows={4} className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 
                    focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 
                    dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Write your plans today ..."
                            value={activities}
                            onChange={(e) => setActivities(e.target.value)}></textarea>
                        <div className="flex ml-4 flex-col justify-end ">
                            <button type="submit" className="inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600"
                                onClick={handleCheck}>
                                <PaperAirplaneIcon className="w-8 h-8" />
                                <span className="sr-only">Send message</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

{/* <Container>
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
        </Container> */}
export default AoWeatherAgent;
