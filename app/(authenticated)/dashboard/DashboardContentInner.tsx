// app/(authenticated)/dashboard/DashboardContentInner.tsx
"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import type { User } from "@/types/user"
import { escapeHtml } from "@/lib/utils"

export default function DashboardContentInner() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("No token found")
        }

        const response = await axios.get<User[]>("https://apioptima-log.xva-rnd.com/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setUsers(response.data)
      } catch (error) {
        console.error("Error fetching users:", error)
        setError("Failed to fetch users")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  return (
    <div>
      <div className="dashboard-section">
        <h2 className="dashboard-title">Online User</h2>
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Email</th>
                <th className="table-header-cell">Username</th>
                <th className="table-header-cell">Role</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="loading-message">
                    Loading users...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={3} className="error-message">
                    {escapeHtml(error)}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="table-cell"
                    style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}
                  >
                    No users online
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="table-row">
                    <td className="table-cell">{escapeHtml(user.email)}</td>
                    <td className="table-cell">{escapeHtml(user.username)}</td>
                    <td className="table-cell">
                      <span className={user.role.toLowerCase() === "admin" ? "role-admin" : "role-user"}>
                        {escapeHtml(user.role)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
