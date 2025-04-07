// app/(authenticated)/mandrill-email/MandrillEmailContentInner.tsx
"use client"

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getMandrillActivity, exportMandrillActivity } from "@/lib/api";
import { MandrillActivity, MandrillStats } from "@/types/mandrill";
import { escapeHtml } from "@/lib/utils";

export default function MandrillEmailContentInner() {
  const searchParams = useSearchParams();
  const env = searchParams.get("env") || "dev";
  const platform = searchParams.get("platform") || "XVA";

  // Set default date to today (April 7, 2025)
  const today = new Date().toISOString().split('T')[0]; // "2025-04-07"

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState<string>(today);
  const [dateTo, setDateTo] = useState<string>(today);
  const [status, setStatus] = useState<string>(""); // Default to empty string to show all emails initially
  const [limit, setLimit] = useState<number>(500);
  const [offset, setOffset] = useState<number>(0);
  const [allActivities, setAllActivities] = useState<MandrillActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<MandrillActivity[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<MandrillStats>({
    delivered: 0,
    sent: 0,
    deliverability: "0%",
    quota: 225000,
    sends: 0,
    resetDate: "APRIL 7, 2025",
  });

  const fetchActivities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch all activities without filtering by status
      const response = await getMandrillActivity("", dateFrom, dateTo, limit, offset);
      const data = response.data;

      // Check if the response has the expected structure
      if (data && Array.isArray(data.messages)) {
        // Map the messages to the MandrillActivity format
        const mappedActivities: MandrillActivity[] = data.messages.map((msg: any) => ({
          email: msg.email,
          subject: msg.subject,
          status: msg.state,
          date: new Date(msg.ts * 1000).toISOString().split('T')[0],
          clock: msg.clock,
          content: msg.content,
          _id: msg._id,
          ts: msg.ts,
        }));

        setAllActivities(mappedActivities);
        setTotalCount(data.total_count);

        // Update stats using the metrics and quota from the response
        setStats({
          delivered: data.metrics.delivered,
          sent: data.metrics.sent,
          deliverability: data.metrics.deliverability.toFixed(2) + "%",
          quota: data.quota.monthly_limit,
          sends: data.quota.emails_sent,
          resetDate: data.quota.reset_date,
        });

        // Log the statuses of the fetched activities for debugging
        console.log("Fetched activities statuses:", mappedActivities.map((a) => a.status));
      } else {
        console.error("Invalid Mandrill activity response:", data);
        setError("Invalid response format from server");
        setAllActivities([]);
        setTotalCount(0);
        setStats({
          delivered: 0,
          sent: 0,
          deliverability: "0%",
          quota: 225000,
          sends: 0,
          resetDate: "APRIL 7, 2025",
        });
      }
    } catch (error: any) {
      console.error("Error fetching email activity:", error);
      if (error.response?.status === 403) {
        setError("Unauthorized: Admin role required");
      } else {
        setError("Failed to fetch email activity");
      }
      setAllActivities([]);
      setTotalCount(0);
      setStats({
        delivered: 0,
        sent: 0,
        deliverability: "0%",
        quota: 225000,
        sends: 0,
        resetDate: "APRIL 7, 2025",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter activities based on status and search term
  useEffect(() => {
    console.log("Current status filter:", status); // Debug the status state
    let filtered = allActivities;

    // Apply status filter
    if (status) {
      filtered = filtered.filter((activity) =>
        activity.status.toLowerCase() === status.toLowerCase()
      );
    }

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(
        (activity) =>
          activity.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    console.log("Filtered activities:", filtered); // Debug the filtered activities
    setFilteredActivities(filtered);
  }, [allActivities, status, searchTerm]);

  // Fetch activities when date range, limit, or offset changes
  useEffect(() => {
    fetchActivities();
  }, [dateFrom, dateTo, limit, offset]);

  const handleExport = async () => {
    setIsLoading(true);
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
    } catch (error) {
      console.error("Error exporting email activity:", error);
      setError("Failed to export email activity");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newOffset: number) => {
    setOffset(newOffset);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setOffset(0); // Reset offset when changing limit
  };

  const totalPages = Math.ceil(totalCount / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={5} className="table-cell">
            Loading...
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan={5} className="table-cell text-red-500">
            {escapeHtml(error)}
          </td>
        </tr>
      );
    }

    if (filteredActivities.length === 0) {
      return (
        <tr>
          <td colSpan={5} className="table-cell">
            No email activity found
          </td>
        </tr>
      );
    }

    return filteredActivities.map((activity, index) => (
      <tr key={index} className="table-row">
        <td className="table-cell">{escapeHtml(activity.status)}</td>
        <td className="table-cell">{escapeHtml(activity.clock)}</td>
        <td className="table-cell">{escapeHtml(activity.email)}</td>
        <td className="table-cell">{escapeHtml(activity.subject)}</td>
        <td className="table-cell">
          <button className="link-button" disabled>
            View Content (Coming Soon)
          </button>
        </td>
      </tr>
    ));
  };

  return (
    <div className="mandrill-page">
      <div className="mandrill-header">
        <h2 className="mandrill-title">MANDRILL EMAIL ACTIVITY</h2>
      </div>

      <div className="mandrill-content">
        <div className="mandrill-controls">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              placeholder="Search activity"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="date-container">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="date-input"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="date-input"
            />
            <span className="calendar-icon">📅</span>
          </div>
        </div>

        <div className="filter-section">
          <div className="filter-controls">
            <span className="filter-label">FILTER BY</span>
            <div
              className={`filter-badge ${status === "delivered" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"} cursor-pointer`}
              onClick={() => setStatus("delivered")}
            >
              <span>Delivered</span>
              <span className="badge">{allActivities.filter((a) => a.status.toLowerCase() === "delivered").length}</span>
            </div>
            <div
              className={`filter-badge ${status === "rejected" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"} cursor-pointer`}
              onClick={() => setStatus("rejected")}
            >
              <span>Rejected</span>
              <span className="badge">{allActivities.filter((a) => a.status.toLowerCase() === "rejected").length}</span>
            </div>
            <button className="control-button" onClick={() => setStatus("")}>
              OK
            </button>
          </div>
        </div>

        <div className="stats-section">
          <div className="stats-row">
            <div className="stat-box">
              <span className="stat-value">{stats.delivered}</span> DELIVERED
            </div>
            <div className="stat-box">
              <span className="stat-value">{stats.sent}</span> SENT
            </div>
            <div className="stat-box">
              <span className="stat-value">{stats.deliverability}</span> DELIVERABILITY
            </div>
          </div>

          <div className="quota-box">
            <h3 className="quota-title">MONTHLY QUOTA</h3>
            <div className="quota-row">
              <span>EMAIL QUOTA : {stats.quota}</span>
              <span>{stats.quota && stats.sends ? ((stats.sends / stats.quota) * 100).toFixed(3) + "%" : "N/A"}</span>
            </div>
            <div className="quota-row">EMAIL SENDS : {stats.sends}</div>
            <div className="quota-row">RESET ON {stats.resetDate}</div>
          </div>
        </div>

        <div className="download-section">
          <button className="control-button" onClick={handleExport} disabled={isLoading}>
            Download .json
          </button>
        </div>

        <div className="table-container">
          <table className="mandrill-table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">STATUS</th>
                <th className="table-header-cell">DATE</th>
                <th className="table-header-cell">Email</th>
                <th className="table-header-cell">Subject</th>
                <th className="table-header-cell">Content</th>
              </tr>
            </thead>
            <tbody>{renderTableContent()}</tbody>
          </table>
        </div>

        <div className="pagination-section">
          <div className="rows-selector">
            <span>View</span>
            <select
              className="rows-select"
              value={limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
            >
              <option value={100}>100 Row</option>
              <option value={500}>500 Row</option>
              <option value={1000}>1000 Row</option>
            </select>
          </div>
          <div className="pagination-controls">
            <span>
              {offset + 1}-{Math.min(offset + limit, totalCount)} of {totalCount}
            </span>
            <button
              className="pagination-button"
              onClick={() => handlePageChange(offset - limit)}
              disabled={offset === 0 || isLoading}
            >
              &lt;&lt;
            </button>
            <button
              className="pagination-button"
              onClick={() => handlePageChange(offset + limit)}
              disabled={offset + limit >= totalCount || isLoading}
            >
              &gt;&gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}