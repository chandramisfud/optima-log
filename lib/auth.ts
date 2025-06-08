// lib/auth.ts
"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import React from "react"

// Function to set the JWT token in localStorage
export const setToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token)
  }
}

// Function to get the JWT token from localStorage
export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
  }
  return null
}

// Function to remove the JWT token from localStorage
export const removeToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token")
  }
}

// Higher-order component to protect routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  const AuthenticatedComponent = (props: P) => {
    const router = useRouter()
    const [token, setToken] = useState<string | null>(null)

    useEffect(() => {
      const tokenValue = getToken()
      setToken(tokenValue)

      if (!tokenValue) {
        router.push("/")
      }
    }, [router])

    if (token === null) {
      return null // Or a loading spinner
    }

    return React.createElement(Component, props)
  }

  return AuthenticatedComponent
}
