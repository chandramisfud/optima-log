// components/LogList.tsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { LogFile, ListLogsResponse } from "@/types/api";

interface LogListProps {
  filters: {
    date: string;
    server: string;
    env: string;
    platform: string;
    logType: string;
  };
}

const LogList: React.FC<LogListProps> = ({ filters }) => {
  const [logs, setLogs] = useState<LogFile[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(50);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const params = new URLSearchParams({
          date: filters.date,
          server: filters.server,
          env: filters.env,
          platform: filters.platform,
          logType: filters.logType,
          page: page.toString(),
          pageSize: pageSize.toString(),
        });
        console.log("Fetching logs with params:", params.toString());
        const response = await axios.get<ListLogsResponse>(
          `http://localhost:8080/api/logs/list?${params.toString()}`
        );
        console.log("Logs fetched successfully:", response.data);
        setLogs(response.data.files);
        setTotalCount(response.data.totalCount);
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      }
    };

    fetchLogs();
  }, [filters, page, pageSize]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Logs</h2>
      <ul className="mb-4">
        {logs.map((log) => (
          <li key={`${log.name}-${log.date}-${log.server}-${log.env}`} className="border-b py-2">
            {log.name} - {log.date} - {log.server} - {log.env} - {log.logType} - {log.size} bytes
          </li>
        ))}
      </ul>
      <div className="flex justify-between">
        <button
          onClick={() => {
            console.log("Navigating to previous page:", page - 1);
            setPage((p) => Math.max(p - 1, 1));
          }}
          disabled={page === 1}
          className="bg-gray-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => {
            console.log("Navigating to next page:", page + 1);
            setPage((p) => Math.min(p + 1, totalPages));
          }}
          disabled={page === totalPages}
          className="bg-gray-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default LogList;