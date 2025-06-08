// components/ProfileModal.tsx
"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getUserProfile, changePassword, changeProfilePicture } from "@/lib/api"
import { useAuth } from "@/context/auth-context"
import type { User } from "@/types/user"
import { X, Camera, Eye, EyeOff, UserIcon } from "lucide-react"

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

// Default avatar placeholder as data URI
const DEFAULT_AVATAR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMzciIHI9IjE1IiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0yMCA4MEMyMCA2OS41MDY2IDI4LjUwNjYgNjEgMzkgNjFINjFDNzEuNDkzNCA2MSA4MCA2OS41MDY2IDgwIDgwVjEwMEgyMFY4MFoiIGZpbGw9IiM5QjlCQTAiLz4KPC9zdmc+"

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, setUser } = useAuth()
  const [profile, setProfile] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)

  // Password change states
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Profile picture states
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      fetchProfile()
      setImageError(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setPreviewUrl(null)
    }
  }, [selectedFile])

  const fetchProfile = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await getUserProfile()
      setProfile(response.data)
    } catch (error: any) {
      console.error("Error fetching profile:", error)
      setError("Failed to fetch profile information")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long")
      return
    }

    setIsLoading(true)
    try {
      await changePassword({
        oldPassword,
        newPassword,
      })
      setSuccess("Password changed successfully")
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      console.error("Error changing password:", error)
      if (error.response?.status === 400) {
        setError("Invalid old password")
      } else {
        setError("Failed to change password")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError("File size must be less than 5MB")
        return
      }
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file")
        return
      }
      setSelectedFile(file)
      setError(null)
    }
  }

  const handleProfilePictureUpload = async () => {
    if (!selectedFile) return

    setIsLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const response = await changeProfilePicture(selectedFile)
      setSuccess("Profile picture updated successfully")

      // Update the profile state and auth context
      if (profile) {
        const updatedProfile = { ...profile, profile_picture: response.data.path }
        setProfile(updatedProfile)
        setUser(updatedProfile)
      }

      setSelectedFile(null)
      setPreviewUrl(null)
      setImageError(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error: any) {
      console.error("Error uploading profile picture:", error)
      setError("Failed to upload profile picture")
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const handleClose = () => {
    setError(null)
    setSuccess(null)
    setOldPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setSelectedFile(null)
    setPreviewUrl(null)
    setImageError(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onClose()
  }

  const getProfileImageSrc = () => {
    if (previewUrl) return previewUrl
    if (profile?.profile_picture && !imageError) return profile.profile_picture
    return DEFAULT_AVATAR
  }

  if (!isOpen) return null

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal">
        <div className="profile-modal-header">
          <h2 className="profile-modal-title">Profile Settings</h2>
          <button onClick={handleClose} className="profile-modal-close">
            <X size={20} />
          </button>
        </div>

        <div className="profile-modal-content">
          {isLoading && <div className="loading-message">Loading...</div>}

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {profile && (
            <>
              {/* Profile Information */}
              <div className="profile-section">
                <h3 className="section-title">Profile Information</h3>
                <div className="profile-info-grid">
                  <div className="profile-picture-section">
                    <div className="profile-picture-container">
                      {imageError && !previewUrl ? (
                        <div className="profile-picture-fallback">
                          <UserIcon size={40} color="#9B9BA0" />
                        </div>
                      ) : (
                        <img
                          src={getProfileImageSrc() || "/placeholder.svg"}
                          alt="Profile"
                          className="profile-picture"
                          onError={handleImageError}
                        />
                      )}
                      <button onClick={() => fileInputRef.current?.click()} className="profile-picture-overlay">
                        <Camera size={20} />
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {selectedFile && (
                      <Button onClick={handleProfilePictureUpload} disabled={isLoading} className="upload-button">
                        Upload Picture
                      </Button>
                    )}
                  </div>

                  <div className="profile-details">
                    <div className="detail-item">
                      <Label>Username</Label>
                      <div className="detail-value">{profile.username}</div>
                    </div>
                    <div className="detail-item">
                      <Label>Email</Label>
                      <div className="detail-value">{profile.email}</div>
                    </div>
                    <div className="detail-item">
                      <Label>Role</Label>
                      <div className="detail-value">
                        <span className={profile.role.toLowerCase() === "admin" ? "role-admin" : "role-user"}>
                          {profile.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Change Password */}
              <div className="profile-section">
                <h3 className="section-title">Change Password</h3>
                <form onSubmit={handlePasswordChange} className="password-form">
                  <div className="form-group">
                    <Label htmlFor="oldPassword">Current Password</Label>
                    <div className="password-input-container">
                      <Input
                        id="oldPassword"
                        type={showOldPassword ? "text" : "password"}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="password-input"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="password-toggle"
                      >
                        {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="password-input-container">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="password-input"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="password-toggle"
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="password-input-container">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="password-input"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="password-toggle"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading} className="change-password-button">
                    Change Password
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
