// components/header.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { ProfileModal } from "./ProfileModal"
import { UserIcon } from "lucide-react"

// Default avatar placeholder as data URI
const DEFAULT_AVATAR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMTUiIHI9IjYiIGZpbGw9IiM5QjlCQTAiLz4KPHBhdGggZD0iTTggMzJDOCAyNy44MDI2IDExLjMwMjYgMjQuNSAxNS41IDI0LjVIMjQuNUMyOC42OTc0IDI0LjUgMzIgMjcuODAyNiAzMiAzMlY0MEg4VjMyWiIgZmlsbD0iIzlCOUJBMCIvPgo8L3N2Zz4="

export function Header() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Fallback user data if user is not yet loaded
  const displayUser = user || { username: "CHANDRA", role: "ADMIN" }

  const handleLogout = () => {
    logout() // Use the logout function from AuthContext
    router.push("/") // Redirect to login page
  }

  const handleProfileClick = () => {
    setIsProfileModalOpen(true)
    setIsDropdownOpen(false)
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const getAvatarContent = () => {
    if (user?.profile_picture && !imageError) {
      return (
        <img
          src={user.profile_picture || "/placeholder.svg"}
          alt="Profile"
          className="user-avatar-image"
          onError={handleImageError}
        />
      )
    } else {
      return <UserIcon size={24} color="white" />
    }
  }

  return (
    <>
      <div className="header">
        <div className="user-info">
          <p className="user-name">HI "{displayUser.username.toUpperCase()}" YOU ARE GREAT !!</p>
          <p className="user-role">{displayUser.role}</p>
        </div>
        <div className="user-dropdown" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <div className="user-avatar">{getAvatarContent()}</div>
          <span className="settings-icon">⚙️</span>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={handleProfileClick}>
                Profile Settings
              </div>
              <div className="dropdown-item" onClick={handleLogout}>
                Logout
              </div>
            </div>
          )}
        </div>
      </div>

      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </>
  )
}
