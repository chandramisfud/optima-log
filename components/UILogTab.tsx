import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface LogFile {
    name: string;
    date: string;
    env: string;
}

interface UILogTabProps {
    server: string;
    env: string;
}

const UILogTab: React.FC<UILogTabProps> = ({ server, env }) => {
    const [date, setDate] = useState<string>('');
    const [logs, setLogs] = useState<LogFile[]>([]);
    const [selectedLog, setSelectedLog] = useState<LogFile | null>(null);
    const [logContent, setLogContent] = useState<string>('');
    const [fontSize, setFontSize] = useState<string>('text-base');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch logs when date changes
    const fetchLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('https://apioptima-log.xva-rnd.com/api/logs/list', {
                params: { date, server, env },
                headers: { Authorization: `Bearer ${token}` },
            });
            // Ensure logs is always an array, even if the response is invalid
            const fetchedLogs = Array.isArray(response.data.logs) ? response.data.logs : [];
            setLogs(fetchedLogs);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch logs');
            setLogs([]); // Reset logs to an empty array on error
        } finally {
            setLoading(false);
        }
    };

    // Fetch log content when a log is selected
    useEffect(() => {
        if (selectedLog) {
            const fetchLogContent = async () => {
                setLoading(true);
                setError(null);
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get(
                        `https://apioptima-log.xva-rnd.com/api/logs/get/${server}/${selectedLog.date}/${env}/${selectedLog.name}`,
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );
                    setLogContent(response.data || '');
                } catch (err: any) {
                    setError(err.response?.data?.error || 'Failed to fetch log content');
                } finally {
                    setLoading(false);
                }
            };

            fetchLogContent();
        }
    }, [selectedLog, server, env]);

    // Handle download of a log file
    const handleDownload = async () => {
        if (!selectedLog) {
            alert('Please select a log file to download');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('https://apioptima-log.xva-rnd.com/api/logs/download', {
                params: {
                    server,
                    date: selectedLog.date,
                    env,
                    files: [selectedLog.name],
                },
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'logs.zip');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            setError('Failed to download log file');
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">UI LOG</h2>

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
                    onClick={fetchLogs}
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

            {/* Logs Grid and Viewer */}
            {!loading && (
                <div className="flex flex-col">
                    {/* Logs Grid */}
                    <div className="flex flex-wrap gap-4 mb-4">
                        {logs.length === 0 ? (
                            <div className="text-gray-700">
                                No logs found for the selected date.
                            </div>
                        ) : (
                            logs.map((log) => (
                                <button
                                    key={log.name}
                                    onClick={() => setSelectedLog(log)}
                                    className={`w-32 h-32 flex items-center justify-center rounded-full border-2 ${
                                        selectedLog?.name === log.name
                                            ? 'border-blue-500 bg-blue-100'
                                            : 'border-gray-300 bg-gray-100'
                                    } text-center text-sm`}
                                >
                                    {log.name}
                                </button>
                            ))
                        )}
                        {logs.length > 0 && (
                            <button
                                onClick={handleDownload}
                                className="ml-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                DOWNLOAD
                            </button>
                        )}
                    </div>

                    {/* Log Viewer */}
                    {selectedLog && (
                        <div>
                            <div className="flex justify-between mb-2">
                                <input
                                    type="text"
                                    placeholder="SEARCH"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="p-2 border border-gray-300 rounded-md"
                                />
                                <select
                                    value={fontSize}
                                    onChange={(e) => setFontSize(e.target.value)}
                                    className="p-2 border border-gray-300 rounded-md"
                                >
                                    <option value="text-sm">Small</option>
                                    <option value="text-base">Medium</option>
                                    <option value="text-lg">Large</option>
                                </select>
                            </div>
                            <pre
                                className={`p-4 bg-gray-100 border border-gray-300 rounded-md h-96 overflow-auto ${fontSize}`}
                                dangerouslySetInnerHTML={{
                                    __html: logContent.replace(
                                        new RegExp(searchQuery, 'gi'),
                                        (match) => `<mark>${match}</mark>`
                                    ),
                                }}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UILogTab;