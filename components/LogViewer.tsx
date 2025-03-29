// components/LogViewer.tsx

import React, { useState, useEffect } from "react";
import axios from "axios";

interface LogViewerProps {
  server: string;
  date: string;
  env: string;
  file: string;
}

const LogViewer: React.FC<LogViewerProps> = ({ server, date, env, file }) => {
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    const fetchLog = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/logs/get/${server}/${date}/${env}/${file}`,
          { responseType: "text" }
        );
        setContent(response.data);
      } catch (error) {
        console.error("Failed to fetch log:", error);
        setContent("Error loading log content");
      }
    };

    fetchLog();
  }, [server, date, env, file]);

  return (
    <div className="border p-4 rounded">
      <h2 className="text-lg font-bold mb-2">{file}</h2>
      <pre className="whitespace-pre-wrap">{content}</pre>
    </div>
  );
};

export default LogViewer;