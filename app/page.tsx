// app/page.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/auth-context"
import { setToken } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

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
      // Make API call to login endpoint
      const response = await axios.post<{ token: string; user: { id: number; username: string; email: string; role: string } }>(
        "https://apioptima-log.xva-rnd.com/api/users/login",
        {
          email,
          password,
        }
      )

      // Store token and user in localStorage and AuthContext
      setToken(response.data.token)
      setUser(response.data.user)

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (err) {
      setError("Login failed. Please check your credentials.")
      console.error("Login error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-header">
        <h1 className="login-title">WELCOME TO </h1>
        <h1 className="login-title">XVA LOG MANAGEMENT SYSTEM</h1>
      </div>

      <div className="login-form-container">
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <Label htmlFor="email" className="form-label">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <Label htmlFor="password" className="form-label">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <Button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? "Signing in..." : "SIGN IN"}
          </Button>
        </form>
      </div>
    </div>
  )
}