// app/(authenticated)/database-backup/DatabaseBackupContentInner.tsx
"use client"

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getBackupFiles, downloadBackup } from "@/lib/api";
import { BackupFile } from "@/types/backup";
import { escapeHtml } from "@/lib/utils";

export default function DatabaseBackupContentInner() {
  const searchParams = useSearchParams();
  const env = searchParams.get("env") || "dev";
  const platform = searchParams.get("platform") || "XVA";

  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [backupFiles, setBackupFiles] = useState<BackupFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBackupFiles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getBackupFiles(env as 'dev' | 'prod', platform as 'XVA' | 'DANONE', date);
        const files = response.data.map((file: BackupFile) => ({
          ...file,
          name: file.file_name, // Map file_name to name
          path: file.file_name, // Map file_name to path
        }));
        setBackupFiles(files);
        setSelectedFile(null);
      } catch (error) {
        console.error("Error fetching backup files:", error);
        setError("Failed to fetch backup files");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBackupFiles();
  }, [date, env, platform]);

  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);
  };

  const handleDownload = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await downloadBackup(env as 'dev' | 'prod', platform as 'XVA' | 'DANONE', date, selectedFile);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', selectedFile);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading backup:", error);
      setError("Failed to download backup");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="log-viewer">
      <div className="log-header">
        <h2 className="log-title">DATABASE BACKUP</h2>
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
            <div className="loading-message">Loading backup files...</div>
          ) : error ? (
            <div className="error-message text-red-500">{escapeHtml(error)}</div>
          ) : backupFiles.length === 0 ? (
            <div className="no-files-message">No backup files found for the selected date</div>
          ) : (
            <div className="log-files-grid">
              {backupFiles.map((file, index) => (
                <div key={index} className="log-file-item">
                  <input
                    type="radio"
                    id={`file-${index}`}
                    name="backupFile"
                    value={file.path}
                    checked={selectedFile === file.path}
                    onChange={() => handleFileSelect(file.path)}
                    className="log-file-radio"
                  />
                  <label htmlFor={`file-${index}`} className="log-file-label">
                    {escapeHtml(file.name)}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}