// context/auth-context.tsx
"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: number
  username: string
  email: string
  role: string
  created_at: string
  updated_at: string
  profile_picture?: string
}

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // On page load, check if there's a user in localStorage
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user")
      const token = localStorage.getItem("token")
      if (storedUser && token) {
        setUser(JSON.parse(storedUser))
      }
    }
  }, [])

  const handleSetUser = (newUser: User | null) => {
    setUser(newUser)
    if (typeof window !== "undefined") {
      if (newUser) {
        localStorage.setItem("user", JSON.stringify(newUser))
      } else {
        localStorage.removeItem("user")
      }
    }
  }

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    }
    setUser(null)
    window.location.href = "/"
  }

  return <AuthContext.Provider value={{ user, setUser: handleSetUser, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
