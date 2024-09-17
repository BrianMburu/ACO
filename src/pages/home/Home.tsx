import classNames from "classnames";
import React from "react";
import { FaGithub, FaTwitter } from 'react-icons/fa';

function Home() {

    return (
        <div className={classNames("content text-black dark:text-white flex flex-col")}>
            <div className="w-full px-6 py-8 mb-8 border-b border-neutral-700">
                <h1 className='text-4xl font-extrabold text-center'>Tackling Climate Change with</h1>
                <h2 className="text-3xl text-green-400 text-center font-extrabold">Decentralized Intelligence</h2>
            </div>
            <div className="flex h-full flex-col justify-between">
                <div className="w-full grid grid-cols-1 p-8 pt-0 lg:grid-cols-2 md:grid-cols-2 gap-6">
                    <div className="shadow-lg rounded-lg p-6 border border-neutral-700" style={{
                        background: 'linear-gradient(to top left, rgba(250, 133, 146, 0.2), rgba(135, 206, 250, 0))'
                    }}>
                        <div className='mb-4 flex justify-center'>
                            <div>
                                <h2 className="text-2xl font-bold mb-1">The Problem</h2>
                            </div>
                        </div>
                        <div className="text-center">
                            <p>Centralized weather markets and privacy-invading weather apps are
                                exploiting user data while overlooking the true potential of climate
                                data to help mitigate climate change. Over $12 trillion dollars in
                                climate losses are estimated in the next 26 years.</p>
                        </div>
                    </div>
                    <div className="shadow-lg rounded-lg p-6 border border-neutral-700" style={{
                        background: 'linear-gradient(to top left, rgba(146, 250, 133, 0.2), rgba(255, 215, 0, 0))'
                    }}>
                        <div className='mb-4 flex justify-center'>
                            <div>
                                <h2 className="text-2xl font-bold mb-1">The Solution</h2>
                            </div>
                        </div>
                        <div className="text-center">
                            <p>AoClimOptions is a decentralized weather market that allows you to
                                trade temperature-based binary options. With the AO Weather Agent,
                                powered by AI, we provide climate insights while keeping your data
                                private.</p>
                        </div>

                    </div>
                </div>
                <div className="flex items-center justify-center space-x-5 p-6">
                    <div>
                        <a type="button" className="text-white bg-[#1da1f2] hover:bg-[#1da1f2]/90 focus:ring-4 
                        focus:outline-none focus:ring-[#1da1f2]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center 
                        inline-flex items-center dark:focus:ring-[#1da1f2]/55" href="https://x.com/NotusOptions" target="_blank" rel="noopener noreferrer">
                            Twitter
                            <FaTwitter className="w-3.5 h-3.5 text-white ml-2" />
                        </a>
                    </div>
                    <div className="text-xl font-bold text-center flex flex-col justify-center py-2.5">
                        <a href="https://ao.arweave.dev/" target="_blank" rel="noopener noreferrer">
                            <img className="h-12 w-12" src='AO.svg' alt='ACO logo' />
                        </a>
                    </div>

                    <div>
                        <a type="button" className="text-white bg-[#24292F] hover:bg-[#24292F]/90 focus:ring-4 
                        focus:outline-none focus:ring-[#24292F]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center 
                        inline-flex items-center dark:focus:ring-gray-500 dark:hover:bg-[#050708]/30"
                            href="https://github.com/BrianMburu/ACO" target="_blank" rel="noopener noreferrer">
                            <FaGithub className="w-3.5 h-3.5 text-white me-2" />
                            Github
                        </a>
                    </div>

                </div>
            </div>
        </div>
    )

}

export default Home