// pages/dashboard.tsx

import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/components/AuthContext";
import Dashboard from "@/components/Dashboard";
import LogFilter from "@/components/LogFilter";
import LogList from "@/components/LogList";

const DashboardPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const handleFilter = (filters: {
    date: string;
    server: string;
    env: string;
    platform: string;
    logType: string;
  }) => {
    // Update the log list based on filters
    // This is passed to LogList to fetch filtered logs
  };

  if (!isAuthenticated()) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Dashboard />
      <LogFilter onFilter={handleFilter} />
      <LogList filters={{ date: "", server: "", env: "", platform: "", logType: "" }} />
    </div>
  );
};

export default DashboardPage;