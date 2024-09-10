import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ChartOptions,
    ChartData
} from 'chart.js';
import classNames from 'classnames';
import { FaWallet, FaRobot } from 'react-icons/fa';
import { CubeTransparentIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';


ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Sample data for the charts
const sampleData = [
    { month: 'Jan', temperature: 4, rainfall: 20 },
    { month: 'Feb', temperature: 5, rainfall: 18 },
    { month: 'Mar', temperature: 9, rainfall: 15 },
    { month: 'Apr', temperature: 12, rainfall: 12 },
    { month: 'May', temperature: 16, rainfall: 8 },
    { month: 'Jun', temperature: 18, rainfall: 5 },
    { month: 'Jul', temperature: 22, rainfall: 3 },
    { month: 'Aug', temperature: 24, rainfall: 4 },
    { month: 'Sep', temperature: 20, rainfall: 6 },
    { month: 'Oct', temperature: 15, rainfall: 10 },
    { month: 'Nov', temperature: 10, rainfall: 16 },
    { month: 'Dec', temperature: 5, rainfall: 20 }
];

// Chart configuration
const chartOptions: ChartOptions<'line'> = {
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
                display: false,
            },
        },
    },
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            enabled: true,
        },
    },
    elements: {
        line: {
            tension: 0.4, // Curved line
        },
    },
};

// Chart data for temperature
const temperatureData: ChartData<'line'> = {
    labels: sampleData.map(data => data.month),
    datasets: [{
        label: 'Temperature (°C)',
        data: sampleData.map(data => data.temperature),
        backgroundColor: 'transparent',//'rgba(255, 215, 0, 0.2)', // Light golden fill
        borderColor: 'rgba(255, 215, 0, 1)', // Golden border
        fill: true,
    }],
};

// Chart data for rainfall
const rainfallData: ChartData<'line'> = {
    labels: sampleData.map(data => data.month),
    datasets: [{
        label: 'Rainfall (mm)',
        data: sampleData.map(data => data.rainfall),
        backgroundColor: 'transparent',//'rgba(135, 206, 250, 0.2)', // Light sky blue fill
        borderColor: 'rgba(135, 206, 250, 1)', // Sky blue border
        fill: true,
    }],
};


const OverviewSection: React.FC<{ updateWeatherOption: (option: string) => void }> = ({ updateWeatherOption }) => {
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
                        <h2 className="text-3xl font-semibold">0x760</h2>
                        <span className="text-green-400 text-3xl font-bold">/$47.590</span>
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

const AppsPage: React.FC = () => {
    const [weatherElement, setWeatherElement] = useState("temperature")
    const navigate = useNavigate();

    return (
        <div className={classNames("content text-black dark:text-white flex flex-col")}>
            {/* Add the new Overview Section */}
            <OverviewSection updateWeatherOption={setWeatherElement} />

            <div className="grid grid-cols-1 p-8 pt-0 lg:grid-cols-3 md:grid-cols-2 gap-6">
                {/* First Card - Temperature Graph */}
                <div className="shadow-lg rounded-lg p-6 border border-neutral-700" style={{
                    background: weatherElement == "temperature" ?
                        'linear-gradient(to top left, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0))' :
                        'linear-gradient(to top left, rgba(135, 206, 250, 0.2), rgba(135, 206, 250, 0))'
                }}>

                    <div className='mb-4 flex justify-between'>
                        <div>
                            <h2 className="text-xl font-semibold mb-1">AoClimaOptions</h2>
                            <h6 className='text-xs text-gray-700 dark:text-gray-400'>
                                {weatherElement == "temperature" ? "Temparature Overview" : "Rainfall Overview"}
                            </h6>
                        </div>
                        <div className='rounded-full p-3 bg-gradient-to-b from-neutral-700 to-transparent'>
                            <CubeTransparentIcon className='size-6' />
                        </div>
                    </div>
                    <div className='flex text-xs space-x-3 mb-5'>
                        <div className='cursor-pointer '>Daily</div>
                        <div className='cursor-pointer '>Monthly</div>
                        <div className='cursor-pointer '>Yearly</div>
                    </div>
                    <div className="h-64 lg:h-auto md:h-auto">
                        <Line data={weatherElement == "temperature" ? temperatureData : rainfallData}
                            options={chartOptions} />
                    </div>
                    <div className="mt-4 flex justify-between">
                        <div>
                            <span className="text-gray-600 dark:text-gray-400 text-sm">Current Temp</span>
                            <h3 className="text-md font-bold">12.6 °C</h3>
                        </div>
                        <div className='flex flex-col justify-center'>
                            <button type="button" className="text-yellow-400 hover:text-white border border-yellow-400 hover:bg-yellow-700 focus:ring-4 
                            focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-yellow-300 
                            dark:text-yellow-300 dark:hover:text-white dark:hover:bg-yellow-500 dark:focus:ring-yellow-900"
                                onClick={() => navigate("/aoclimaoptions")}>
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
                <div className="rounded-lg p-6 border border-neutral-700 h-fit" style={{
                    background: 'linear-gradient(to top left, rgba(135, 206, 250, 0.2), rgba(135, 206, 250, 0))'
                }}>
                    <div className='mb-4 flex justify-between'>
                        <div>
                            <h2 className="text-xl font-semibold mb-1">AoWeatherOptions</h2>
                            <h6 className='text-xs text-gray-700 dark:text-gray-400'>First Ever Intelligent Weather Dapp</h6>
                        </div>
                        <div className='rounded-full p-3 bg-gradient-to-b from-neutral-700 to-transparent'>
                            <FaRobot size="24" />
                            {/* <CubeTransparentIcon className='size-6' /> */}
                        </div>
                    </div>

                    <div>
                        <p>Get The best Summarized weather intelligence on AO weather Dapp.</p>
                    </div>

                    <div className="mt-4 flex justify-center">
                        <div className='flex flex-col justify-center'>
                            <button type="button" className="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 
                        focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-blue-500
                         dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800"
                                onClick={() => navigate("/aoweatheragent")}>
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
