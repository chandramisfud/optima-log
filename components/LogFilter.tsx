// components/LogFilter.tsx

import React, { useState, ChangeEvent, FormEvent } from "react";

interface LogFilterProps {
  onFilter: (filters: {
    date: string;
    server: string;
    env: string;
    platform: string;
    logType: string;
  }) => void;
}

const LogFilter: React.FC<LogFilterProps> = ({ onFilter }) => {
  const [date, setDate] = useState<string>("");
  const [server, setServer] = useState<string>("");
  const [env, setEnv] = useState<string>("");
  const [platform, setPlatform] = useState<string>("");
  const [logType, setLogType] = useState<string>("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onFilter({ date, server, env, platform, logType });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <input
          type="date"
          value={date}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
          className="border p-2 rounded"
          placeholder="Date"
        />
        <select
          value={server}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setServer(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Servers</option>
          <option value="api">API</option>
          <option value="ui">UI</option>
          <option value="email">Email</option>
        </select>
        <select
          value={env}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setEnv(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Environments</option>
          <option value="dev">Dev</option>
          <option value="staging">Staging</option>
          <option value="prod">Prod</option>
        </select>
        <select
          value={platform}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setPlatform(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Platforms</option>
          <option value="XVA">XVA</option>
          <option value="Danone">Danone</option>
        </select>
        <select
          value={logType}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setLogType(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Log Types</option>
          <option value=".log">.log</option>
          <option value=".txt">.txt</option>
        </select>
      </div>
      <button type="submit" className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Filter
      </button>
    </form>
  );
};

export default LogFilter;