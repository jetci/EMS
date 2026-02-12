import React, { useState } from 'react';

const DesignSystemPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('buttons');

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12 bg-gray-50 min-h-screen">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">🎨 WeCare UX/UI Design System</h1>
                <p className="text-lg text-gray-600">Standardized components and style guidelines for the EMS WeCare platform.</p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 mb-8">
                {['buttons', 'typography', 'colors', 'alerts', 'forms', 'cards'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm transition-colors capitalize ${activeTab === tab
                            ? 'border-[var(--wecare-blue)] text-[var(--wecare-blue)]'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Buttons Section */}
            {activeTab === 'buttons' && (
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Buttons</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700">Primary Actions</h3>
                            <div className="flex flex-wrap gap-4 items-center">
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Primary Button</button>
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors opacity-50 cursor-not-allowed">Disabled</button>
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-all transform hover:-translate-y-1">With Shadow</button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700">Secondary Actions</h3>
                            <div className="flex flex-wrap gap-4 items-center">
                                <button className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">Secondary Button</button>
                                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">Neutral Button</button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700">Semantic Actions</h3>
                            <div className="flex flex-wrap gap-4 items-center">
                                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">Success</button>
                                <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Danger / Delete</button>
                                <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">Warning</button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700">Sizes</h3>
                            <div className="flex flex-wrap gap-4 items-end">
                                <button className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">Tiny</button>
                                <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Small</button>
                                <button className="px-4 py-2 text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700">Medium (Default)</button>
                                <button className="px-6 py-3 text-lg bg-blue-600 text-white rounded-xl hover:bg-blue-700">Large</button>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Typography Section */}
            {activeTab === 'typography' && (
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Typography</h2>
                    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">Heading 1 (4xl) - The quick brown fox</h1>
                            <p className="text-sm text-gray-500 mt-1">Used for main page titles</p>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Heading 2 (3xl) - The quick brown fox</h2>
                            <p className="text-sm text-gray-500 mt-1">Used for major section headers</p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold text-gray-900">Heading 3 (2xl) - The quick brown fox</h3>
                            <p className="text-sm text-gray-500 mt-1">Used for card titles and subsections</p>
                        </div>
                        <div>
                            <h4 className="text-xl font-semibold text-gray-900">Heading 4 (xl) - The quick brown fox</h4>
                            <p className="text-sm text-gray-500 mt-1">Used for component titles</p>
                        </div>
                        <hr className="my-4" />
                        <div className="space-y-4">
                            <p className="text-base text-gray-700 leading-relaxed">
                                <strong>Body Text:</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                            </p>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                <strong>Small Text:</strong> Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.
                            </p>
                            <p className="text-xs text-gray-500">
                                <strong>Tiny / Caption:</strong> Copyright © 2026 EMS WeCare. All rights reserved.
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* Colors Section */}
            {activeTab === 'colors' && (
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Color Palette</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-gray-700">Primary (Blue)</h3>
                            <div className="h-16 w-full bg-blue-50 rounded-lg flex items-center justify-center text-xs text-blue-900">50</div>
                            <div className="h-16 w-full bg-blue-100 rounded-lg flex items-center justify-center text-xs text-blue-900">100</div>
                            <div className="h-16 w-full bg-blue-500 rounded-lg flex items-center justify-center text-xs text-white">500 (Brand)</div>
                            <div className="h-16 w-full bg-blue-600 rounded-lg flex items-center justify-center text-xs text-white">600 (Hover)</div>
                            <div className="h-16 w-full bg-blue-900 rounded-lg flex items-center justify-center text-xs text-white">900</div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-gray-700">Status - Success</h3>
                            <div className="h-16 w-full bg-green-50 rounded-lg flex items-center justify-center text-xs text-green-900">50</div>
                            <div className="h-16 w-full bg-green-100 rounded-lg flex items-center justify-center text-xs text-green-900">100</div>
                            <div className="h-16 w-full bg-green-500 rounded-lg flex items-center justify-center text-xs text-white">500</div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-gray-700">Status - Warning</h3>
                            <div className="h-16 w-full bg-yellow-50 rounded-lg flex items-center justify-center text-xs text-yellow-900">50</div>
                            <div className="h-16 w-full bg-yellow-100 rounded-lg flex items-center justify-center text-xs text-yellow-900">100</div>
                            <div className="h-16 w-full bg-yellow-500 rounded-lg flex items-center justify-center text-xs text-white">500</div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-gray-700">Status - Error</h3>
                            <div className="h-16 w-full bg-red-50 rounded-lg flex items-center justify-center text-xs text-red-900">50</div>
                            <div className="h-16 w-full bg-red-100 rounded-lg flex items-center justify-center text-xs text-red-900">100</div>
                            <div className="h-16 w-full bg-red-500 rounded-lg flex items-center justify-center text-xs text-white">500</div>
                        </div>
                    </div>
                </section>
            )}

            {/* Alerts & Badges Section */}
            {activeTab === 'alerts' && (
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Alerts & Badges</h2>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700">Badges / Status Indicators</h3>
                        <div className="flex gap-4">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Inactive</span>
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Processing</span>
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Draft</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700">Alert Boxes</h3>
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4" role="alert">
                            <p className="font-bold text-blue-700">Info</p>
                            <p className="text-blue-600">This is an informational message regarding the system status.</p>
                        </div>
                        <div className="bg-green-50 border-l-4 border-green-500 p-4" role="alert">
                            <p className="font-bold text-green-700">Success</p>
                            <p className="text-green-600">Operation completed successfully. Data has been saved.</p>
                        </div>
                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4" role="alert">
                            <p className="font-bold text-yellow-700">Warning</p>
                            <p className="text-yellow-600">Please be careful when updating sensitive information.</p>
                        </div>
                        <div className="bg-red-50 border-l-4 border-red-500 p-4" role="alert">
                            <p className="font-bold text-red-700">Error</p>
                            <p className="text-red-600">Failed to connect to the server. Please try again later.</p>
                        </div>
                    </div>
                </section>
            )}

            {/* Forms Section */}
            {activeTab === 'forms' && (
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Form Elements</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Text Input</label>
                                <input type="text" placeholder="Enter full name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Input (with Icon)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-400">✉️</span>
                                    <input type="email" placeholder="user@example.com" className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Text Area</label>
                                <textarea placeholder="Enter detailed description..." rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"></textarea>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select / Dropdown</label>
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white">
                                    <option>Option 1</option>
                                    <option>Option 2</option>
                                    <option>Option 3</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Checkboxes & Radios</label>
                                <div className="space-y-2 mt-2">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300" />
                                        <span className="text-gray-700">I agree to terms</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300" />
                                        <span className="text-gray-700">Subscribe to newsletter</span>
                                    </label>
                                    <div className="pt-2 flex gap-4">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input type="radio" name="radio-group" className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                                            <span className="text-gray-700">Yes</span>
                                        </label>
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input type="radio" name="radio-group" className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                                            <span className="text-gray-700">No</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Cards Section */}
            {activeTab === 'cards' && (
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Card Layouts</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Standard Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="h-40 bg-gray-200 flex items-center justify-center text-gray-400">Image / Map Placeholder</div>
                            <div className="p-5">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Standard Card</h3>
                                <p className="text-gray-600 mb-4 text-sm">Use this for displaying items in a grid, such as news articles or profiles.</p>
                                <button className="text-blue-600 font-medium hover:underline">Read more &rarr;</button>
                            </div>
                        </div>

                        {/* Stats Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center space-x-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                                <span className="text-2xl">📊</span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Patients</p>
                                <p className="text-2xl font-bold text-gray-900">1,234</p>
                            </div>
                        </div>

                        {/* Interactive Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:border-blue-500 hover:ring-1 hover:ring-blue-500 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">🚀</div>
                                <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">New</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Interactive Feature</h3>
                            <p className="text-gray-600 mt-2 text-sm">Clickable card with hover states used for navigation items.</p>
                        </div>
                    </div>
                </section>
            )}

        </div>
    );
};

export default DesignSystemPage;
