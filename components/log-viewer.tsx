// components/log-viewer.tsx
"use client"

import { useState, useEffect } from "react";
import DOMPurify from "dompurify";
import { getLogFiles, getLogContent, searchLogs, downloadLogs } from "@/lib/api";
import { LogFile, LogSearchResult } from "@/types/log";

type LogViewerProps = {
  title: string;
  server: "ui" | "api";
  env: string;
  platform: string;
};

export function LogViewer({ title, server, env, platform }: LogViewerProps) {
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [logFiles, setLogFiles] = useState<LogFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [logContent, setLogContent] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<LogSearchResult[]>([]);
  const [fontSize, setFontSize] = useState<string>("medium");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogFiles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getLogFiles(date, server, env as 'dev' | 'prod', platform as 'XVA' | 'DANONE');
        const files = response.data.files.map((file: LogFile) => ({
          ...file,
          path: file.name, // Map name to path for compatibility
        }));
        setLogFiles(files);
        setSelectedFile(null);
        setLogContent("");
        setSearchResults([]);
      } catch (error) {
        console.error("Error fetching log files:", error);
        setError("Failed to fetch log files");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogFiles();
  }, [date, server, env, platform]);

  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);

    const fetchLogContent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getLogContent(server, date, env as 'dev' | 'prod', filePath, platform as 'XVA' | 'DANONE');
        setLogContent(response.data);
        if (searchTerm) {
          await handleSearch();
        }
      } catch (error) {
        console.error("Error fetching log content:", error);
        setError("Failed to fetch log content");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogContent();
  };

  const handleSearch = async () => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await searchLogs(date, server, env as 'dev' | 'prod', platform as 'XVA' | 'DANONE', searchTerm);
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error searching logs:", error);
      setError("Failed to search logs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await downloadLogs(server, date, env as 'dev' | 'prod', platform as 'XVA' | 'DANONE', [selectedFile]);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'logs.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading logs:", error);
      setError("Failed to download logs");
    } finally {
      setIsLoading(false);
    }
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case "small":
        return "log-font-small";
      case "medium":
        return "log-font-medium";
      case "large":
        return "log-font-large";
      case "x-large":
        return "log-font-xlarge";
      default:
        return "log-font-medium";
    }
  };

  // Function to escape special regex characters
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // Function to highlight search terms in the log content
  const highlightSearchTerm = (content: string, term: string) => {
    if (!term || !searchResults.length) return content;

    let highlightedText = content;
    searchResults.forEach((result) => {
      try {
        const escapedTerm = escapeRegExp(term);
        const regex = new RegExp(`(${escapedTerm})`, 'gi');
        highlightedText = highlightedText.replace(regex, '<span class="search-highlight">$1</span>');
      } catch (err) {
        console.error('Error in highlightSearchTerm:', err);
        return content; // Fallback to original content if regex fails
      }
    });
    return <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(highlightedText) }} />;
  };

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

          <div className="download-button-container">
            <button className="control-button" onClick={handleDownload} disabled={!selectedFile || isLoading}>
              DOWNLOAD
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
                <div key={index} className="log-file-item">
                  <input
                    type="radio"
                    id={`file-${index}`}
                    name="logFile"
                    value={file.path}
                    checked={selectedFile === file.path}
                    onChange={() => handleFileSelect(file.path)}
                    className="log-file-radio"
                  />
                  <label htmlFor={`file-${index}`} className="log-file-label">
                    {file.name}
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
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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
          ) : !selectedFile ? (
            <div className="select-file-message">Select a log file to view its content</div>
          ) : searchTerm ? (
            highlightSearchTerm(logContent, searchTerm)
          ) : (
            logContent
          )}
        </div>
      </div>
    </div>
  );
}