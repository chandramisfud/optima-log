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

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState<string>("2025-03-01");
  const [dateTo, setDateTo] = useState<string>("2025-03-31");
  const [status, setStatus] = useState<string>("delivered");
  const [limit, setLimit] = useState<number>(500);
  const [offset, setOffset] = useState<number>(0);
  const [activities, setActivities] = useState<MandrillActivity[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<MandrillStats>({
    delivered: 0,
    sent: 0,
    deliverability: "0%",
    quota: 225000, // Hardcoded as per mock data
    sends: 124778, // Hardcoded as per mock data
    resetDate: "APRIL 7, 2025", // Hardcoded as per mock data
  });

  const fetchActivities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getMandrillActivity(status, dateFrom, dateTo, limit, offset);
      const fetchedActivities = response.data;
      // Ensure fetchedActivities is an array
      if (Array.isArray(fetchedActivities)) {
        setActivities(fetchedActivities);
        setTotalCount(fetchedActivities.length); // Adjust if API provides total count

        // Calculate stats
        const delivered = fetchedActivities.filter((a: MandrillActivity) => a.status.toLowerCase() === "delivered").length;
        const sent = fetchedActivities.length;
        const deliverability = sent > 0 ? ((delivered / sent) * 100).toFixed(2) + "%" : "0%";
        setStats((prevStats) => ({
          ...prevStats,
          delivered,
          sent,
          deliverability,
        }));
      } else {
        console.error("Invalid Mandrill activity response:", fetchedActivities);
        setError("Invalid response format from server");
        setActivities([]);
        setTotalCount(0);
        setStats((prevStats) => ({
          ...prevStats,
          delivered: 0,
          sent: 0,
          deliverability: "0%",
        }));
      }
    } catch (error: any) {
      console.error("Error fetching email activity:", error);
      if (error.response?.status === 403) {
        setError("Unauthorized: Admin role required");
      } else {
        setError("Failed to fetch email activity");
      }
      setActivities([]);
      setTotalCount(0);
      setStats((prevStats) => ({
        ...prevStats,
        delivered: 0,
        sent: 0,
        deliverability: "0%",
      }));
    } finally {
      setIsLoading(false);
    }
  };

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

  useEffect(() => {
    fetchActivities();
  }, [status, dateFrom, dateTo, limit, offset]);

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

    if (activities.length === 0) {
      return (
        <tr>
          <td colSpan={5} className="table-cell">
            No email activity found
          </td>
        </tr>
      );
    }

    return activities.map((activity, index) => (
      <tr key={index} className="table-row">
        <td className="table-cell">{escapeHtml(activity.status)}</td>
        <td className="table-cell">{escapeHtml(activity.date)}</td>
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
              placeholder="SEARCH ACTIVITY"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              disabled // Placeholder as per requirements
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
              <span className="badge">{stats.delivered}</span>
            </div>
            <div
              className={`filter-badge ${status === "rejected" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"} cursor-pointer`}
              onClick={() => setStatus("rejected")}
            >
              <span>Rejected</span>
              <span className="badge">{activities.filter((a) => a.status.toLowerCase() === "rejected").length}</span>
            </div>
            <button className="control-button" onClick={fetchActivities}>
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
              <span>{stats.quota && stats.sends ? ((stats.sends / stats.quota) * 100).toFixed(2) + "%" : "N/A"}</span>
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