// app/(authenticated)/dashboard/DashboardContentInner.tsx
"use client"

import { useState, useEffect } from "react";
import axios from "axios";
import { User } from "@/types/user";
import { escapeHtml } from "@/lib/utils";

export default function DashboardContentInner() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found");
        }

        const response = await axios.get<User[]>("https://apioptima-log.xva-rnd.com/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to fetch users");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <div className="dashboard-section">
        <h2 className="dashboard-title">ONLINE USER</h2>
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">EMAIL</th>
                <th className="table-header-cell">USERNAME</th>
                <th className="table-header-cell">ROLE</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="table-cell">
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={3} className="table-cell text-red-500">
                    {escapeHtml(error)}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={3} className="table-cell">
                    No users online
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="table-row">
                    <td className="table-cell">{escapeHtml(user.email)}</td>
                    <td className="table-cell">{escapeHtml(user.username)}</td>
                    <td className="table-cell">{escapeHtml(user.role)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}