import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MandrillActivityTab: React.FC = () => {
    const [dateFrom, setDateFrom] = useState<string>('2025-03-07'); // Default to start of the month
    const [dateTo, setDateTo] = useState<string>('2025-03-30'); // Default to today
    const [status, setStatus] = useState<string>('sent'); // Default to "sent" since that's the state we found
    const [page, setPage] = useState<number>(1);
    const [pageSize] = useState<number>(500);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch Mandrill activity data
    const fetchActivity = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'https://apioptima-log.xva-rnd.com/api/mandrill/activity',
                {
                    date_from: dateFrom,
                    date_to: dateTo,
                    status: status,
                    page: page,
                    pageSize: pageSize,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            console.log('Mandrill Activity Response:', response.data); // Debug log
            setData(response.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch Mandrill activity');
        } finally {
            setLoading(false);
        }
    };

    // Fetch data on mount and when filters change
    useEffect(() => {
        fetchActivity();
    }, [dateFrom, dateTo, status, page]);

    // Handle page change
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Mandrill Email Activity</h2>

            {/* Filters */}
            <div className="mb-4 flex space-x-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Date From</label>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Date To</label>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    >
                        <option value="">All</option>
                        <option value="sent">Sent</option>
                        <option value="delivered">Delivered</option>
                        <option value="rejected">Rejected</option>
                        <option value="bounced">Bounced</option>
                    </select>
                </div>
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

            {/* Quota and Metrics */}
            {!loading && data && (
                <>
                    {/* Monthly Quota */}
                    <div className="mb-4 p-4 bg-gray-100 rounded">
                        <h3 className="text-xl font-semibold mb-2">Monthly Quota</h3>
                        <p><strong>Email Quota:</strong> {data.quota.monthly_limit}</p>
                        <p><strong>Email Sends:</strong> {data.quota.emails_sent}</p>
                        <p><strong>Emails Remaining:</strong> {data.quota.emails_remaining}</p>
                        <p><strong>Percentage Used:</strong> {data.quota.percentage_used.toFixed(2)}%</p>
                        <p><strong>Reset On:</strong> {data.quota.reset_date}</p>
                    </div>

                    {/* Activity Metrics */}
                    <div className="mb-4 p-4 bg-gray-100 rounded flex space-x-4">
                        <div>
                            <p><strong>Delivered:</strong> {data.metrics.delivered}</p>
                        </div>
                        <div>
                            <p><strong>Sent:</strong> {data.metrics.sent}</p>
                        </div>
                        <div>
                            <p><strong>Deliverability:</strong> {data.metrics.deliverability.toFixed(2)}%</p>
                        </div>
                    </div>

                    {/* Activity Table */}
                    <div className="overflow-x-auto">
                        {data.messages.length === 0 ? (
                            <div className="mb-4 p-2 text-gray-700">
                                No email activity found for the selected date range and status. Try broadening the date range or changing the status filter.
                            </div>
                        ) : (
                            <>
                                <table className="min-w-full bg-white border border-gray-300">
                                    <thead>
                                        <tr>
                                            <th className="py-2 px-4 border-b">Status</th>
                                            <th className="py-2 px-4 border-b">Date</th>
                                            <th className="py-2 px-4 border-b">Email</th>
                                            <th className="py-2 px-4 border-b">Subject</th>
                                            <th className="py-2 px-4 border-b">Content</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.messages.map((msg: any) => (
                                            <tr key={msg._id}>
                                                <td className="py-2 px-4 border-b">{msg.state}</td>
                                                <td className="py-2 px-4 border-b">
                                                    {new Date(msg.ts * 1000).toLocaleString()}
                                                </td>
                                                <td className="py-2 px-4 border-b">{msg.email}</td>
                                                <td className="py-2 px-4 border-b">{msg.subject}</td>
                                                <td className="py-2 px-4 border-b">
                                                    <button
                                                        onClick={() => alert('Content fetching not implemented yet')}
                                                        className="text-blue-500 hover:underline"
                                                    >
                                                        View Content
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Pagination */}
                                <div className="mt-4 flex justify-between">
                                    <button
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page === 1}
                                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <span>
                                        {data.total_count > 0
                                            ? `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, data.total_count)} of ${data.total_count}`
                                            : '0-0 of 0'}
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page * pageSize >= data.total_count}
                                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default MandrillActivityTab;