// pages/mandrill-email.tsx
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { withAuth } from '../lib/auth';
import { NextPage } from 'next';
import { getMandrillActivity, exportMandrillActivity } from '../lib/api';
import { MandrillActivity } from '../types/mandrill';

const MandrillEmail: NextPage = () => {
  const [status, setStatus] = useState<string>('delivered');
  const [dateFrom, setDateFrom] = useState<string>('2025-03-01');
  const [dateTo, setDateTo] = useState<string>('2025-03-31');
  const [limit] = useState<number>(500);
  const [offset, setOffset] = useState<number>(0);
  const [activities, setActivities] = useState<MandrillActivity[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMandrillActivity(status, dateFrom, dateTo, limit, offset);
      setActivities(response.data);
      setTotalCount(response.data.length); // Adjust based on API response if total count is provided
    } catch (err) {
      setError('Failed to fetch email activity');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await exportMandrillActivity(status, dateFrom, dateTo, limit, offset);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'mandrill-activity.json');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to export email activity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [status, dateFrom, dateTo, offset]);

  const handlePageChange = (newOffset: number) => {
    setOffset(newOffset);
  };

  const totalPages = Math.ceil(totalCount / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Mandrill Email Activity</h1>
        <div className="mb-4 flex flex-col md:flex-row md:space-x-4">
          <div className="mb-4 md:mb-0">
            <label className="block mb-2 text-gray-700">Search Activity</label>
            <input
              type="text"
              className="p-2 border rounded"
              placeholder="Search activity (not implemented)"
              disabled
            />
          </div>
          <div className="mb-4 md:mb-0">
            <label className="block mb-2 text-gray-700">Date Range</label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="p-2 border rounded"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="p-2 border rounded"
              />
            </div>
          </div>
          <div>
            <label className="block mb-2 text-gray-700">Filter By</label>
            <div className="flex space-x-2">
              <button
                onClick={() => setStatus('delivered')}
                className={`p-2 rounded ${status === 'delivered' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-600 hover:text-white`}
              >
                Delivered ({activities.filter((a) => a.status === 'delivered').length})
              </button>
              <button
                onClick={() => setStatus('rejected')}
                className={`p-2 rounded ${status === 'rejected' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-600 hover:text-white`}
              >
                Rejected ({activities.filter((a) => a.status === 'rejected').length})
              </button>
            </div>
          </div>
        </div>
        <div className="mb-4 flex space-x-4">
          <div className="p-4 bg-gray-100 rounded">
            <p className="text-gray-700">
              <span className="font-semibold">{activities.filter((a) => a.status === 'delivered').length}</span> Delivered
            </p>
          </div>
          <div className="p-4 bg-gray-100 rounded">
            <p className="text-gray-700">
              <span className="font-semibold">{activities.length}</span> Sent
            </p>
          </div>
          <div className="p-4 bg-gray-100 rounded">
            <p className="text-gray-700">
              <span className="font-semibold">
                {activities.length > 0 ? Math.round((activities.filter((a) => a.status === 'delivered').length / activities.length) * 100) : 0}%
              </span> Deliverability
            </p>
          </div>
        </div>
        {loading && (
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        )}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {!loading && !error && (
          <>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b text-left text-gray-600">Status</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Date</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Email</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Subject</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Content</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 px-4 text-center text-gray-500">
                        No email activity found
                      </td>
                    </tr>
                  ) : (
                    activities.map((activity, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">{activity.status}</td>
                        <td className="py-2 px-4 border-b">{activity.date}</td>
                        <td className="py-2 px-4 border-b">{activity.email}</td>
                        <td className="py-2 px-4 border-b">{activity.subject}</td>
                        <td className="py-2 px-4 border-b">
                          <button className="text-blue-500 hover:underline" disabled>
                            View Content (Coming Soon)
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <button
                  onClick={handleExport}
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                  disabled={loading}
                >
                  Download JSON
                </button>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(offset - limit)}
                  disabled={offset === 0 || loading}
                  className="p-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="p-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(offset + limit)}
                  disabled={offset + limit >= totalCount || loading}
                  className="p-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default withAuth(MandrillEmail);