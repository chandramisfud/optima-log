"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { getMandrillActivity, exportMandrillActivity, resendMandrillEmail } from "@/lib/api"
import type { MandrillActivity, MandrillStats } from "@/types/mandrill"
import { escapeHtml } from "@/lib/utils"
import { debounce } from "lodash"

export default function MandrillEmailContentInner() {
  const searchParams = useSearchParams()
  const env = searchParams.get("env") || "dev"
  const platform = searchParams.get("platform") || "XVA"

  // Calculate the default date range (last 7 days)
  const today = new Date() // Current date: May 03, 2025
  const last7Days = new Date(today)
  last7Days.setDate(today.getDate() - 7) // 7 days ago: April 26, 2025

  // Format dates as YYYY-MM-DD
  const formatDate = (date: Date) => date.toISOString().split("T")[0]
  const defaultDateTo = formatDate(today) // "2025-05-03"
  const defaultDateFrom = formatDate(last7Days) // "2025-04-26"

  const [dateFrom, setDateFrom] = useState<string>(defaultDateFrom)
  const [dateTo, setDateTo] = useState<string>(defaultDateTo)
  const [dateError, setDateError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [status, setStatus] = useState<string>("") // Default to empty string to show all emails initially
  const [limit, setLimit] = useState<number>(500)
  const [offset, setOffset] = useState<number>(0)
  const [allActivities, setAllActivities] = useState<MandrillActivity[]>([])
  const [filteredActivities, setFilteredActivities] = useState<MandrillActivity[]>([])
  const [totalCount, setTotalCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<MandrillStats>({
    delivered: 0,
    sent: 0,
    deliverability: "0%",
    quota: 225000,
    sends: 0,
    resetDate: formatDate(today),
    rejected: 0,
    hardBounces: 0,
    softBounces: 0,
    unsubscribes: 0,
    spamComplaints: 0,
    percentageUsed: 0,
  })

  // Helper function to strip <mark> tags from a string
  const stripMarkTags = (text: string) => {
    return text.replace(/<mark>|<\/mark>/g, "")
  }

  const fetchActivities = async (keyword = "") => {
    setIsLoading(true)
    setError(null)
    setDateError(null)

    // Validate date range
    const fromDate = new Date(dateFrom)
    const toDate = new Date(dateTo)
    if (fromDate > toDate) {
      setDateError("Start date cannot be after end date")
      setIsLoading(false)
      return
    }

    try {
      // Pass the status filter as an array to the API
      const statusFilter = status ? [status] : []
      console.log("API Request Parameters:", {
        statusFilter,
        dateFrom,
        dateTo,
        limit,
        offset,
        keyword,
      })

      const response = await getMandrillActivity(statusFilter, dateFrom, dateTo, limit, offset, keyword)
      const data = response.data

      // Check if the response has the expected structure
      if (data && Array.isArray(data.messages)) {
        // Map the messages to the MandrillActivity format, keeping <mark> tags for highlighting
        const mappedActivities: MandrillActivity[] = data.messages.map((msg: any) => ({
          email: msg.email,
          subject: msg.subject,
          status: msg.state,
          date: new Date(msg.ts * 1000).toISOString().split("T")[0],
          clock: msg.clock,
          content: msg.content,
          _id: msg._id,
          ts: msg.ts,
          sender: msg.sender,
          opens: msg.opens,
          clicks: msg.clicks,
          resend_email: msg.resend_email,
        }))

        console.log("Raw API messages:", data.messages)
        console.log("Mapped activities:", mappedActivities)

        setAllActivities(mappedActivities)
        setFilteredActivities(mappedActivities)
        setTotalCount(data.total_count)

        // Update stats using the metrics and quota from the response
        setStats({
          delivered: data.metrics.delivered >= 0 ? data.metrics.delivered : 0,
          sent: data.metrics.sent,
          deliverability: data.metrics.deliverability.toFixed(2) + "%",
          quota: data.quota.monthly_limit,
          sends: data.quota.emails_sent,
          resetDate: data.quota.reset_date,
          rejected: data.metrics.rejected,
          hardBounces: data.metrics.hardBounces,
          softBounces: data.metrics.softBounces,
          unsubscribes: data.metrics.unsubscribes,
          spamComplaints: data.metrics.spamComplaints,
          percentageUsed: data.quota.percentage_used,
        })

        console.log("Fetched activities:", mappedActivities)
        console.log("Emails sent since reset:", data.quota.emails_sent)
        console.log("Next reset date:", data.quota.reset_date)
      } else {
        console.error("Invalid Mandrill activity response:", data)
        setError("Invalid response format from server")
        setAllActivities([])
        setFilteredActivities([])
        setTotalCount(0)
        setStats({
          delivered: 0,
          sent: 0,
          deliverability: "0%",
          quota: 225000,
          sends: 0,
          resetDate: formatDate(today),
          rejected: 0,
          hardBounces: 0,
          softBounces: 0,
          unsubscribes: 0,
          spamComplaints: 0,
          percentageUsed: 0,
        })
      }
    } catch (error: any) {
      console.error("Error fetching email activity:", error)
      let errorMessage = "Failed to fetch email activity"
      if (error.response) {
        console.log("Server response:", error.response.data)
        if (error.response.status === 400) {
          errorMessage = error.response.data.error || "Invalid request"
        } else if (error.response.status === 403) {
          errorMessage = "Unauthorized: Admin role required"
        } else if (error.response.status === 429) {
          errorMessage = "Rate limit exceeded: Please try again later"
        } else if (error.response.status === 500) {
          errorMessage = error.response.data.error || "Server error: Please try again later or contact support"
        }
      }
      setError(errorMessage)
      setAllActivities([])
      setFilteredActivities([])
      setTotalCount(0)
      setStats({
        delivered: 0,
        sent: 0,
        deliverability: "0%",
        quota: 225000,
        sends: 0,
        resetDate: formatDate(today),
        rejected: 0,
        hardBounces: 0,
        softBounces: 0,
        unsubscribes: 0,
        spamComplaints: 0,
        percentageUsed: 0,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Debounce the fetchActivities function to prevent multiple API calls on rapid input changes
  const debouncedFetchActivities = debounce(fetchActivities, 300)

  // Fetch activities when status, date range, limit, or offset changes
  useEffect(() => {
    debouncedFetchActivities() // Fetch without keyword initially
    return () => {
      debouncedFetchActivities.cancel()
    }
  }, [status, dateFrom, dateTo, limit, offset])

  // Handle "Enter" key press to trigger search with keyword
  const handleSearchKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      debouncedFetchActivities(searchTerm)
    }
  }

  const handleExport = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const statusFilter = status ? [status] : []
      const response = await exportMandrillActivity(statusFilter, dateFrom, dateTo, limit, offset, searchTerm)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "mandrill-activity.json")
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error: any) {
      console.error("Error exporting email activity:", error)
      let errorMessage = "Failed to export email activity"
      if (error.response) {
        console.log("Server response:", error.response.data)
        if (error.response.status === 400) {
          errorMessage = error.response.data.error || "Invalid request"
        } else if (error.response.status === 403) {
          errorMessage = "Unauthorized: Admin role required"
        } else if (error.response.status === 429) {
          errorMessage = "Rate limit exceeded: Please try again later"
        } else if (error.response.status === 500) {
          errorMessage = error.response.data.error || "Server error: Please try again later or contact support"
        }
      }
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewContent = (id: string) => {
    // Open the email content in a new tab using the new route
    const url = `/mandrill-email-content/${id}`
    window.open(url, "_blank")
  }

  const handleResend = async (id: string, email: string) => {
    // Show confirmation dialog
    const confirmed = window.confirm(`Are you sure you want to resend this email to ${email}?`)
    if (!confirmed) {
      return
    }

    try {
      // Call the resend endpoint using the helper function from api.ts
      const response = await resendMandrillEmail(id)
      if (response.status === 200) {
        alert(`Email resent successfully! New message ID: ${response.data.new_message_id}`)
      } else {
        alert("Failed to resend email. Please try again.")
      }
    } catch (error: any) {
      console.error("Error resending email:", error)
      console.log("Error details:", error.response?.data)
      console.log("Request URL:", error.config?.url)
      let errorMessage = "Failed to resend email"
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = "Resend endpoint not found or message not available. Please check the server configuration."
        } else if (error.response.status === 401) {
          errorMessage = "Unauthorized: Please log in again."
        } else {
          errorMessage = error.response.data.error || "Server error: Please try again later"
        }
      }
      alert(errorMessage)
    }
  }

  const handlePageChange = (newOffset: number) => {
    setOffset(newOffset)
  }

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit)
    setOffset(0) // Reset offset when changing limit
  }

  const totalPages = Math.ceil(totalCount / limit)
  const currentPage = Math.floor(offset / limit) + 1

  // Format the date and time to match the index.html format (e.g., "May 2, 2025 9:12 am")
  const formatDateTime = (ts: number) => {
    const date = new Date(ts * 1000)
    return date
      .toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .replace(",", ", ")
      .replace(/\s*at\s*/i, " ")
      .replace(/(AM|PM)/, (match) => match.toLowerCase())
  }

  // Map status to display text and classes for dot and text
  const getStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case "sent":
        return { text: "Delivered", dotClass: "status-dot-delivered", textClass: "delivered" }
      case "rejected":
        return { text: "Rejected", dotClass: "status-dot-rejected", textClass: "rejected" }
      case "bounced":
      case "soft-bounced":
      case "hard-bounced":
        return { text: "General Bounce", dotClass: "status-dot-bounce", textClass: "bounce" }
      default:
        return { text: status, dotClass: "", textClass: "" }
    }
  }

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <tbody>
          <tr>
            <td
              colSpan={8}
              className="px-[10px] py-[9px] text-[12px] leading-[1.5em] align-middle text-[#0066cc] first:text-[#333]"
            >
              Loading...
            </td>
          </tr>
        </tbody>
      )
    }

    if (dateError) {
      return (
        <tbody>
          <tr>
            <td
              colSpan={8}
              className="px-[10px] py-[9px] text-[12px] leading-[1.5em] align-middle text-red-500 first:text-[#333]"
            >
              {dateError}
            </td>
          </tr>
        </tbody>
      )
    }

    if (error) {
      return (
        <tbody>
          <tr>
            <td
              colSpan={8}
              className="px-[10px] py-[9px] text-[12px] leading-[1.5em] align-middle text-red-500 first:text-[#333]"
            >
              {error}
            </td>
          </tr>
        </tbody>
      )
    }

    if (filteredActivities.length === 0) {
      return (
        <tbody>
          <tr>
            <td
              colSpan={8}
              className="px-[10px] py-[9px] text-[12px] leading-[1.5em] align-middle text-[#0066cc] first:text-[#333]"
            >
              No email activity found
            </td>
          </tr>
        </tbody>
      )
    }

    // Group activities by date for daybreak rows
    const activitiesByDate = filteredActivities.reduce(
      (acc, activity) => {
        const date = new Date(activity.ts * 1000).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
        if (!acc[date]) {
          acc[date] = []
        }
        acc[date].push(activity)
        return acc
      },
      {} as { [key: string]: MandrillActivity[] },
    )

    const sortedDates = Object.keys(activitiesByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    return sortedDates.map((date, index) => (
      <tbody key={date}>
        <tr className="daybreak">
          <td colSpan={8}>{date}</td>
        </tr>
        {activitiesByDate[date].map((activity, idx) => {
          const statusDisplay = getStatusDisplay(activity.status)
          return (
            <tr key={`${date}-${idx}`}>
              <td>
                <span className={statusDisplay.dotClass}></span>
                <span className={statusDisplay.textClass}>{statusDisplay.text}</span>
                <br />
                <span className="date-display">{formatDateTime(activity.ts)}</span>
              </td>
              <td>{escapeHtml(activity.sender)}</td>
              <td dangerouslySetInnerHTML={{ __html: activity.email }} />
              <td dangerouslySetInnerHTML={{ __html: activity.subject }} />
              <td>
                <a
                  href="#"
                  className="view-content"
                  onClick={(e) => {
                    e.preventDefault()
                    handleViewContent(activity._id!)
                  }}
                >
                  View Content
                </a>
              </td>
              <td className="text-center">{activity.opens}</td>
              <td className="text-center">{activity.clicks}</td>
              <td>
                <button
                  className="resend-btn"
                  onClick={() => handleResend(activity._id!, stripMarkTags(activity.email))}
                >
                  Resend
                </button>
              </td>
            </tr>
          )
        })}
      </tbody>
    ))
  }

  return (
    <div
      className="mandrill-page leading-none text-[#333]"
      style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, Verdana, sans-serif' }}
    >
      <div className="mandrill-header">
        <h2 className="mandrill-title">MANDRILL EMAIL ACTIVITY</h2>
      </div>

      <div id="content">
        <div id="content-main">
          <div className="mandrill-controls">
            <div className="search-container">
              <input
                placeholder="Search activity (press Enter to search)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="search-input"
              />
              <button className="search-button" onClick={() => debouncedFetchActivities(searchTerm)}>
                Search
              </button>
            </div>

            <div className="date-range-container">
              <div className="date-field">
                <label>From:</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="date-input"
                />
              </div>
              <div className="date-field">
                <label>To:</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="date-input" />
              </div>
              <button className="date-apply-button" onClick={() => debouncedFetchActivities()}>
                Apply
              </button>
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
                <span className="badge">{stats.rejected}</span>
              </div>
              <div
                className={`filter-badge ${status === "" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"} cursor-pointer`}
                onClick={() => setStatus("")}
              >
                <span>All</span>
                <span className="badge">{stats.sent}</span>
              </div>
              <button className="control-button" onClick={() => setStatus("")}>
                Clear Filter
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
              <div className="stat-box">
                <span className="stat-value">{stats.rejected}</span> REJECTED
              </div>
            </div>

            <div className="quota-box">
              <h3 className="quota-title">MONTHLY QUOTA</h3>
              <div className="quota-row">
                <span>EMAIL QUOTA : {stats.quota}</span>
              </div>
              <div className="quota-row">
                <span>QUOTA USAGE (%) : {stats.percentageUsed ? stats.percentageUsed.toFixed(3) + "%" : "N/A"}</span>
              </div>
              <div className="quota-row">EMAIL SENDS : {stats.sends}</div>
              <div className="quota-row">
                RESET ON{" "}
                {new Date(stats.resetDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          <div className="download-section">
            <button className="control-button" onClick={handleExport} disabled={isLoading}>
              Download .json
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Sender</th>
                  <th>Email</th>
                  <th>Subject</th>
                  <th></th>
                  <th>Opens</th>
                  <th>Clicks</th>
                  <th></th>
                </tr>
              </thead>
              {renderTableContent()}
            </table>
          </div>

          <div className="pagination-section">
            <div className="rows-selector">
              <span>View</span>
              <select className="rows-select" value={limit} onChange={(e) => handleLimitChange(Number(e.target.value))}>
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
                {"<<"}
              </button>
              <button
                className="pagination-button"
                onClick={() => handlePageChange(offset + limit)}
                disabled={offset + limit >= totalCount || isLoading}
              >
                {">>"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
