// components/Dashboard.tsx

import React from "react";
import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/router";
import { User } from "@/types/api";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        HALO {user.username.toUpperCase()}, YOU ARE GREAT !!
      </h1>
      <p className="mb-4">Role: {user.role}</p>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
      {/* Add log-related components here (LogFilter, LogList, etc.) */}
    </div>
  );
};

export default Dashboard;