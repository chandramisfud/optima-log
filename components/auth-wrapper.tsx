// components/auth-wrapper.tsx
"use client"

import { AuthProvider } from "@/context/auth-context"
import type { ReactNode } from "react"

export default function AuthWrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
