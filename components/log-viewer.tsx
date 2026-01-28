// components/log-viewer.tsx
"use client"

import { useState, useEffect } from "react"
import DOMPurify from "dompurify"
import { getAgentLogFiles, getAgentLogContent, downloadAgentLog, downloadAgentLogsMultiple } from "@/lib/api"
import type { LogFile, LogPattern } from "@/types/log"

type LogViewerProps = {
  title: string
  server: "ui" | "api"
  env: string
  platform: string
}

export function LogViewer({ title, server, env, platform }: LogViewerProps) {
  const [date, setDate] = useState<string>(() => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  })
  const [pattern, setPattern] = useState<LogPattern | "">("")
  const [logFiles, setLogFiles] = useState<LogFile[]>([])
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [logContent, setLogContent] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [fontSize, setFontSize] = useState<string>("medium")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Pattern options for API logs
  const patternOptions: { value: LogPattern | ""; label: string }[] = [
    { value: "", label: "All Logs" },
    { value: "main", label: "Main" },
    { value: "background", label: "Background Jobs" },
    { value: "sso", label: "SSO" },
    { value: "stdout", label: "Stdout" },
  ]

  useEffect(() => {
    const fetchLogFiles = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await getAgentLogFiles(
          env as "dev" | "prod",
          platform as "XVA" | "DANONE",
          server,
          date,
          pattern || undefined,
        )
        const files = response.data.files || []
        setLogFiles(files)
        setSelectedFiles([])
        setLogContent("")
      } catch (error) {
        console.error("Error fetching log files:", error)
        setError("Failed to fetch log files")
        setLogFiles([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchLogFiles()
  }, [date, server, env, platform, pattern])

  const toggleFileSelection = (filename: string) => {
    setSelectedFiles((prev) => {
      if (prev.includes(filename)) {
        return prev.filter((f) => f !== filename)
      } else {
        return [...prev, filename]
      }
    })
  }

  const selectAllFiles = () => {
    setSelectedFiles(logFiles.map((f) => f.name))
  }

  const clearSelection = () => {
    setSelectedFiles([])
  }

  const handleFileView = async (filename: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await getAgentLogContent(
        env as "dev" | "prod",
        platform as "XVA" | "DANONE",
        server,
        filename,
      )
      setLogContent(response.data)
    } catch (error) {
      console.error("Error fetching log content:", error)
      setError("Failed to fetch log content")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    if (selectedFiles.length === 0) return

    setIsLoading(true)
    setError(null)
    try {
      if (selectedFiles.length === 1) {
        const response = await downloadAgentLog(
          env as "dev" | "prod",
          platform as "XVA" | "DANONE",
          server,
          selectedFiles[0],
        )
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", selectedFiles[0])
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      } else {
        const response = await downloadAgentLogsMultiple(
          env as "dev" | "prod",
          platform as "XVA" | "DANONE",
          server,
          selectedFiles,
        )
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", `logs-${date}.zip`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Error downloading logs:", error)
      setError("Failed to download logs")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkDownload = async () => {
    if (logFiles.length === 0) return

    setIsLoading(true)
    setError(null)
    try {
      const allFilenames = logFiles.map((f) => f.name)
      const response = await downloadAgentLogsMultiple(
        env as "dev" | "prod",
        platform as "XVA" | "DANONE",
        server,
        allFilenames,
      )
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `logs-${date}-all.zip`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading bulk logs:", error)
      setError("Failed to download bulk logs")
    } finally {
      setIsLoading(false)
    }
  }

  const getFontSizeClass = () => {
    switch (fontSize) {
      case "small":
        return "log-font-small"
      case "medium":
        return "log-font-medium"
      case "large":
        return "log-font-large"
      case "x-large":
        return "log-font-xlarge"
      default:
        return "log-font-medium"
    }
  }

  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  }

  const highlightSearchTerm = (content: string, term: string) => {
    if (!term) return content

    try {
      const escapedTerm = escapeRegExp(term)
      const regex = new RegExp(`(${escapedTerm})`, "gi")
      const highlightedText = content.replace(regex, '<span class="search-highlight">$1</span>')
      return <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(highlightedText) }} />
    } catch (err) {
      console.error("Error in highlightSearchTerm:", err)
      return content
    }
  }

  return (
    <div className="log-viewer">
      <div className="log-header">
        <h2 className="log-title">{title}</h2>
      </div>

      <div className="log-content">
        <div className="log-controls">
          <div className="date-selector">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="date-input" />
            <button className="control-button" onClick={() => console.log("Date selected:", date)}>
              OK
            </button>
          </div>

          {server === "api" && (
            <div className="flex items-center gap-2 px-2">
              <span className="text-sm font-medium">Log Type:</span>
              <select
                value={pattern}
                onChange={(e) => setPattern(e.target.value as LogPattern | "")}
                className="min-w-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {patternOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-2">
            <button
              className="control-button text-sm"
              onClick={selectAllFiles}
              disabled={logFiles.length === 0 || isLoading}
            >
              SELECT ALL
            </button>
            <button
              className="control-button text-sm"
              onClick={clearSelection}
              disabled={selectedFiles.length === 0 || isLoading}
            >
              CLEAR
            </button>
          </div>

          <div className="download-button-container flex gap-2">
            <button
              className="control-button"
              onClick={handleDownload}
              disabled={selectedFiles.length === 0 || isLoading}
            >
              DOWNLOAD ({selectedFiles.length})
            </button>

            <button
              className="control-button bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleBulkDownload}
              disabled={logFiles.length === 0 || isLoading}
            >
              BULK DOWNLOAD
            </button>
          </div>
        </div>

        <div className="log-files-container">
          {isLoading ? (
            <div className="loading-message">Loading log files...</div>
          ) : error ? (
            <div className="error-message text-red-500">{error}</div>
          ) : logFiles.length === 0 ? (
            <div className="no-files-message">No log files found for the selected date</div>
          ) : (
            <div className="log-files-grid">
              {logFiles.map((file, index) => (
                <div key={index} className="log-file-item flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`checkbox-${index}`}
                    checked={selectedFiles.includes(file.name)}
                    onChange={() => toggleFileSelection(file.name)}
                    className="w-4 h-4 cursor-pointer"
                  />

                  <label
                    htmlFor={`label-${index}`}
                    className="log-file-label flex-1 cursor-pointer hover:bg-gray-100 p-2 rounded"
                    onClick={() => handleFileView(file.name)}
                  >
                    {file.name}
                    {file.type && <span className="text-xs text-gray-500 ml-2">({file.type})</span>}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="search-controls">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              placeholder="SEARCH"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="font-size-selector">
            <span>FONT-SIZE</span>
            <select value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="font-size-select">
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="x-large">X-Large</option>
            </select>
          </div>
        </div>

        <div className={`log-display ${getFontSizeClass()}`}>
          {isLoading ? (
            <div className="loading-message">Loading log content...</div>
          ) : error ? (
            <div className="error-message text-red-500">{error}</div>
          ) : !logContent ? (
            <div className="select-file-message">Select a log file to view its content</div>
          ) : searchTerm ? (
            highlightSearchTerm(logContent, searchTerm)
          ) : (
            logContent
          )}
        </div>
      </div>
    </div>
  )
}