// app/page.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/auth-context"
import { setToken } from "@/lib/auth"
import { LockKeyhole, Mail, LogIn } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isPreviewEnv, setIsPreviewEnv] = useState(false)

  // Check for preview environment after component mounts
  useEffect(() => {
    const checkPreviewEnv = () => {
      return (
        process.env.NODE_ENV === "development" ||
        window.location.hostname.includes("vercel.app") ||
        window.location.hostname === "localhost"
      )
    }
    setIsPreviewEnv(checkPreviewEnv())
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Validate inputs
    if (!email || !password) {
      setError("Email and password are required")
      setIsLoading(false)
      return
    }

    try {
      // Try to use the real API first
      const response = await axios.post<{
        token: string
        user: { id: number; username: string; email: string; role: string }
      }>("https://apioptima-log.xva-rnd.com/api/users/login", {
        email,
        password,
      })

      // Store token and user in localStorage and AuthContext
      setToken(response.data.token)
      setUser(response.data.user)

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Login error:", err)

      // If we're in preview environment and using the test credentials, provide a fallback
      if (isPreviewEnv && email === "admin@example.com" && password === "password") {
        console.log("API login failed, using mock login for preview")

        // Create mock user data
        const mockUserData = {
          id: 1,
          username: "Admin",
          email: "admin@example.com",
          role: "ADMIN",
        }

        // Store mock token and user
        const mockToken = "mock-jwt-token-for-preview"
        setToken(mockToken)
        setUser(mockUserData)

        // Redirect to dashboard
        router.push("/dashboard")
        return
      }

      // Provide more specific error messages based on the error type
      if (err.message === "Network Error") {
        setError(
          "Network error: Unable to connect to the server. Please check your internet connection or try again later.",
        )
      } else if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.status === 401) {
          setError("Invalid credentials. Please check your email and password.")
        } else if (err.response.status === 403) {
          setError("Access denied. You don't have permission to log in.")
        } else {
          setError(`Login failed: ${err.response.data.message || "Server error"}`)
        }
      } else {
        setError("Login failed. Please check your credentials.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-logo">
            <Image src="/images/logo_xva.png" alt="XVA Automation Logo" width={200} height={90} />
          </div>

          <h1 className="login-title">Log Management System</h1>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <Label htmlFor="email" className="form-label">
                Email
              </Label>
              <div className="input-with-icon">
                {/* <Mail className="input-icon" size={18} /> */}
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input pl-10"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <Label htmlFor="password" className="form-label">
                Password
              </Label>
              <div className="input-with-icon">
                {/* <LockKeyhole className="input-icon" size={18} /> */}
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pl-10"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {error && <p className="error-message">{error}</p>}

            <Button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sign In</span>
                </>
              )}
            </Button>

          </form>
        </div>
      </div>
      <div className="login-background"></div>
    </div>
  )
}
