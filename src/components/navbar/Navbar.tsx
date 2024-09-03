import React from 'react';
import { FaBell, FaAngleDoubleRight } from 'react-icons/fa';
import { Squares2X2Icon } from '@heroicons/react/24/solid';
import classNames from 'classnames';

const Navbar: React.FC<{ theme: string }> = ({ theme }) => {
    return (
        <nav className={classNames("flex items-center justify-between p-4 shadow-md border-b-2 border-b-neutral-700 transition-all duration-300", {
            'bg-black': theme == 'dark',
            'bg-gray-900': theme == 'light'
        })}>
            <div className="flex items-center space-x-2">
                <div className='activity-icon-container rounded-lg p-3 bg-emerald-600'>
                    <Squares2X2Icon className='size-5' />
                </div>
                <FaAngleDoubleRight className="size-3" />
                <div className="text-xl font-bold text-white">Overview</div>
            </div>
            <div className="flex items-center space-x-4">
                <div className="text-white">ArConnect</div>
                <label className="relative inline-flex cursor-pointer items-center">
                    <input id="switch-2" type="checkbox" className="peer sr-only" />
                    <label htmlFor="switch-2" className="hidden"></label>
                    <div className="peer h-4 w-11 rounded-full border bg-slate-200 after:absolute after:-top-1 after:left-0 after:h-6 after:w-6 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-focus:ring-emerald-600"></div>
                </label>
                {/* <label className="relative inline-flex cursor-pointer items-center">
                    <input id="switch" type="checkbox" className="peer sr-only" />
                    <label htmlFor="switch" className="hidden"></label>
                    <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full  after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-focus:ring-green-300"></div>
                </label> */}

                <FaBell className="text-white" />
            </div>
        </nav>
    );
};

export default Navbar;
