// app/(authenticated)/mandrill-email/MandrillEmailContentInner.tsx
"use client"

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getMandrillActivity, exportMandrillActivity, getMandrillContent } from "@/lib/api";
import { MandrillActivity, MandrillStats } from "@/types/mandrill";
import { escapeHtml } from "@/lib/utils";
import he from 'he';

export default function MandrillEmailContentInner() {
  const searchParams = useSearchParams();
  const env = searchParams.get("env") || "dev";
  const platform = searchParams.get("platform") || "XVA";

  // Calculate the default date range (last 7 days)
  const today = new Date(); // Current date: April 30, 2025
  const last7Days = new Date(today);
  last7Days.setDate(today.getDate() - 7); // 7 days ago: April 24, 2025

  // Format dates as YYYY-MM-DD
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  const defaultDateTo = formatDate(today); // "2025-04-30"
  const defaultDateFrom = formatDate(last7Days); // "2025-04-24"

  const [dateFrom, setDateFrom] = useState<string>(defaultDateFrom);
  const [dateTo, setDateTo] = useState<string>(defaultDateTo);
  const [dateError, setDateError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
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

  // State for email content modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<{
    content: string;
    subject: string;
    from_email: string;
    from_name: string;
    to: { email: string; name: string; type: string }[];
  } | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);

  const fetchActivities = async () => {
    setIsLoading(true);
    setError(null);
    setDateError(null);

    // Validate date range
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    if (fromDate > toDate) {
      setDateError("Start date cannot be after end date");
      setIsLoading(false);
      return;
    }

    try {
      // Pass the status filter as an array to the API
      let statusFilter = status ? [status] : [];
      // Remove status filter if search term contains an email address
      if (searchTerm.includes('@')) {
        statusFilter = [];
      }
      console.log("Fetching activities with status filter:", statusFilter, "keyword:", searchTerm);

      const response = await getMandrillActivity(statusFilter, dateFrom, dateTo, limit, offset, searchTerm);
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

        // Log the fetched activities for debugging
        console.log("Fetched activities:", mappedActivities);

        // Fallback client-side filtering if API does not filter correctly
        let filtered = mappedActivities;
        if (searchTerm) {
          const lowerSearchTerm = searchTerm.toLowerCase();
          filtered = mappedActivities.filter(
            (activity) =>
              activity.email.toLowerCase().includes(lowerSearchTerm) ||
              activity.subject.toLowerCase().includes(lowerSearchTerm) ||
              activity.status.toLowerCase().includes(lowerSearchTerm)
          );
        }
        console.log("Filtered activities (client-side fallback):", filtered);
        setFilteredActivities(filtered);
      } else {
        console.error("Invalid Mandrill activity response:", data);
        setError("Invalid response format from server");
        setAllActivities([]);
        setFilteredActivities([]);
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
      if (error.response?.status === 400) {
        setError(error.response.data.error || "Invalid request");
      } else if (error.response?.status === 403) {
        setError("Unauthorized: Admin role required");
      } else {
        setError("Failed to fetch email activity");
      }
      setAllActivities([]);
      setFilteredActivities([]);
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

  // Fetch activities when status, date range, limit, offset, or search term changes
  useEffect(() => {
    fetchActivities();
  }, [status, dateFrom, dateTo, limit, offset, searchTerm]);

  const handleExport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const statusFilter = status ? [status] : [];
      const response = await exportMandrillActivity(statusFilter, dateFrom, dateTo, limit, offset, searchTerm);
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

  const handleViewContent = async (id: string) => {
    setContentLoading(true);
    setContentError(null);
    try {
      const response = await getMandrillContent(id);
      const data = response.data;
      setSelectedEmail({
        content: he.decode(data.content),
        subject: data.subject,
        from_email: data.from_email,
        from_name: data.from_name,
        to: data.to,
      });
      setIsModalOpen(true);
    } catch (error: any) {
      console.error("Error fetching email content:", error);
      if (error.response?.status === 404) {
        setContentError("Message not found");
      } else if (error.response?.status === 401) {
        setContentError("Unauthorized");
      } else {
        setContentError("Failed to fetch email content");
      }
    } finally {
      setContentLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEmail(null);
    setContentError(null);
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

    if (dateError) {
      return (
        <tr>
          <td colSpan={5} className="table-cell text-red-500">
            {dateError}
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan={5} className="table-cell text-red-500">
            {error}
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
          <button
            className="link-button"
            onClick={() => handleViewContent(activity._id!)}
            disabled={contentLoading}
          >
            {contentLoading ? "Loading..." : "View Content"}
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
              <span className="badge">{stats.delivered}</span>
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

        {isModalOpen && selectedEmail && (
          <div className="modal" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="modal-content" style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '80%', maxHeight: '80%', overflowY: 'auto' }}>
              <h3>Email Content</h3>
              {contentError ? (
                <p className="text-red-500">{contentError}</p>
              ) : (
                <>
                  <p><strong>Subject:</strong> {selectedEmail.subject}</p>
                  <p><strong>From:</strong> {selectedEmail.from_name ? `${selectedEmail.from_name} <${selectedEmail.from_email}>` : selectedEmail.from_email}</p>
                  <p><strong>To:</strong> {selectedEmail.to.map(recipient => recipient.email).join(', ')}</p>
                  <hr />
                  <div
                    dangerouslySetInnerHTML={{ __html: selectedEmail.content }}
                    style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}
                  />
                </>
              )}
              <button onClick={closeModal} style={{ marginTop: '10px', padding: '5px 10px' }}>
                Close
              </button>
            </div>
          </div>
        )}

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