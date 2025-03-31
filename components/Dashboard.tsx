import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import DatabaseBackupsTab from './DatabaseBackupsTab';
import MandrillActivityTab from './MandrillActivityTab';
import UILogTab from './UILogTab';
import APILogTab from './APILogTab';

const Dashboard: React.FC = () => {
    const [activeMenu, setActiveMenu] = useState('XVA_DATABASE_BACKUP_DEVELOPMENT');

    return (
        <div className="flex">
            {/* Sidebar */}
            <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

            {/* Main Content */}
            <div className="flex-1 p-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <div className="flex items-center">
                        <span className="mr-2">HI ‘CHANDRA’ YOU ARE GREAT !!</span>
                        <span className="bg-blue-500 text-white px-2 py-1 rounded">ADMIN</span>
                        <span className="ml-2">⚙️</span>
                    </div>
                </div>

                <Routes>
                    {/* Database Backup Routes */}
                    <Route
                        path="database-backup/development"
                        element={<DatabaseBackupsTab env="dev" />}
                    />
                    <Route
                        path="database-backup/production"
                        element={<DatabaseBackupsTab env="prod" />}
                    />
                    <Route
                        path="database-backup/staging"
                        element={<DatabaseBackupsTab env="staging" />}
                    />
                    <Route
                        path="database-backup/production-danone"
                        element={<DatabaseBackupsTab env="prod-danone" />}
                    />

                    {/* UI Log Routes */}
                    <Route
                        path="ui-log/development"
                        element={<UILogTab server="ui" env="dev" />}
                    />
                    <Route
                        path="ui-log/production"
                        element={<UILogTab server="ui" env="prod" />}
                    />
                    <Route
                        path="ui-log/staging"
                        element={<UILogTab server="ui" env="staging" />}
                    />
                    <Route
                        path="ui-log/production-danone"
                        element={<UILogTab server="ui" env="prod-danone" />}
                    />

                    {/* API Log Routes */}
                    <Route
                        path="api-log/development"
                        element={<APILogTab server="api" env="dev" />}
                    />
                    <Route
                        path="api-log/production"
                        element={<APILogTab server="api" env="prod" />}
                    />
                    <Route
                        path="api-log/staging"
                        element={<APILogTab server="api" env="staging" />}
                    />
                    <Route
                        path="api-log/production-danone"
                        element={<APILogTab server="api" env="prod-danone" />}
                    />

                    {/* Mandrill Activity Route */}
                    <Route
                        path="mandrill-activity"
                        element={<MandrillActivityTab />}
                    />

                    {/* Default Route */}
                    <Route
                        path="/"
                        element={<div className="text-gray-500">Select a menu item to view content.</div>}
                    />
                </Routes>
            </div>
        </div>
    );
};

export default Dashboard;