import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Backup {
    file_name: string;
    date: string;
    env: string;
}

interface DatabaseBackupsTabProps {
    env: string;
}

const DatabaseBackupsTab: React.FC<DatabaseBackupsTabProps> = ({ env }) => {
    const [date, setDate] = useState<string>('');
    const [backups, setBackups] = useState<Backup[]>([]);
    const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch backups when date changes
    const fetchBackups = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('https://apioptima-log.xva-rnd.com/api/db-backups/list', {
                params: { env, date },
                headers: { Authorization: `Bearer ${token}` },
            });
            setBackups(response.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch backups');
        } finally {
            setLoading(false);
        }
    };

    // Handle download of a backup file
    const handleDownload = async () => {
        if (!selectedBackup) {
            alert('Please select a backup file to download');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('https://apioptima-log.xva-rnd.com/api/db-backups/download', {
                params: {
                    env: selectedBackup.env,
                    date: selectedBackup.date,
                    file_name: selectedBackup.file_name,
                },
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', selectedBackup.file_name);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            setError('Failed to download backup file');
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">DATABASE BACKUP</h2>

            {/* Filter */}
            <div className="mb-4 flex space-x-4 items-center">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Choose Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>
                <button
                    onClick={fetchBackups}
                    className="mt-6 bg-gray-300 text-gray-700 px-4 py-2 rounded"
                >
                    OK
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="mb-4 p-2 text-gray-700">
                    Loading...
                </div>
            )}

            {/* Backups Grid */}
            {!loading && (
                <div className="flex flex-wrap gap-4">
                    {backups.length === 0 ? (
                        <div className="text-gray-700">
                            No backups found for the selected date.
                        </div>
                    ) : (
                        backups.map((backup) => (
                            <button
                                key={backup.file_name}
                                onClick={() => setSelectedBackup(backup)}
                                className={`w-32 h-32 flex items-center justify-center rounded-full border-2 ${
                                    selectedBackup?.file_name === backup.file_name
                                        ? 'border-blue-500 bg-blue-100'
                                        : 'border-gray-300 bg-gray-100'
                                } text-center text-sm`}
                            >
                                {backup.file_name}
                            </button>
                        ))
                    )}
                    {backups.length > 0 && (
                        <button
                            onClick={handleDownload}
                            className="ml-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            DOWNLOAD
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default DatabaseBackupsTab;