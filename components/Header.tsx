// components/header.tsx
"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fallback user data if user is not yet loaded
  const displayUser = user || { username: "CHANDRA", role: "ADMIN" };

  const handleLogout = () => {
    logout(); // Use the logout function from AuthContext
    router.push("/"); // Redirect to login page
  };

  return (
    <div className="header">
      <div className="user-info">
        <p className="user-name">HI "{displayUser.username.toUpperCase()}" YOU ARE GREAT !!</p>
        <p className="user-role">{displayUser.role}</p>
      </div>
      <div className="user-dropdown" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
        <div className="user-avatar">
          <span className="user-avatar-icon">👤</span>
        </div>
        <span className="settings-icon">⚙️</span>
        {isDropdownOpen && (
          <div className="dropdown-menu">
            <div className="dropdown-item" onClick={handleLogout}>
              Logout
            </div>
            <div className="dropdown-item">Settings</div>
          </div>
        )}
      </div>
    </div>
  );
}