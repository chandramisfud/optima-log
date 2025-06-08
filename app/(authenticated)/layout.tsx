// app/(authenticated)/layout.tsx
import type React from "react"
import { Header } from "@/components/Header"
import SidebarWrapper from "./SidebarWrapper"

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard-container">
      <SidebarWrapper />
      <div className="main-content">
        <Header />
        <main className="main-area">{children}</main>
      </div>
    </div>
  )
}
