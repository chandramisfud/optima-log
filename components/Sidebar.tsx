// components/sidebar.tsx
"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useSearchParams } from "next/navigation"
import {
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  FileText,
  Database,
  Mail,
  Code,
  MonitorSmartphone,
  ServerCog,
  Rocket,
  Building2,
  TestTube,
} from "lucide-react"

type MenuItem = {
  label: string
  href?: string
  icon?: React.ReactNode
  children?: MenuItem[]
  query?: Record<string, string>
}

export function Sidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    XVA: true,
    DANONE: false,
  })

  const menuItems: MenuItem[] = [
    {
      label: "DASHBOARD",
      href: "/dashboard",
      icon: <LayoutDashboard size={12} />,
    },
    {
      label: "XVA",
      icon: <FileText size={12} />,
      children: [
        {
          label: "DEVELOPMENT",
          icon: <Code size={12} />,
          children: [
            {
              label: "UI LOG",
              href: "/ui-log",
              query: { env: "dev", platform: "XVA" },
              icon: <MonitorSmartphone size={12} />,
            },
            {
              label: "API LOG",
              href: "/api-log",
              query: { env: "dev", platform: "XVA" },
              icon: <ServerCog size={12} />,
            },
            {
              label: "DATABASE BACKUP",
              href: "/database-backup",
              query: { env: "dev", platform: "XVA" },
              icon: <Database size={12} />,
            },
          ],
        },
        {
          label: "PRODUCTION",
          icon: <Rocket size={12} />,
          children: [
            {
              label: "UI LOG",
              href: "/ui-log",
              query: { env: "prod", platform: "XVA" },
              icon: <MonitorSmartphone size={12} />,
            },
            {
              label: "API LOG",
              href: "/api-log",
              query: { env: "prod", platform: "XVA" },
              icon: <ServerCog size={12} />,
            },
            {
              label: "DATABASE BACKUP",
              href: "/database-backup",
              query: { env: "prod", platform: "XVA" },
              icon: <Database size={12} />,
            },
          ],
        },
        {
          label: "GO DADDY EMAIL",
          href: "/go-daddy-email",
          query: { platform: "XVA" },
          icon: <Mail size={12} />,
        },
      ],
    },
    {
      label: "DANONE",
      icon: <Building2 size={12} />,
      children: [
        {
          label: "STAGING",
          icon: <TestTube size={12} />,
          children: [
            {
              label: "UI LOG",
              href: "/ui-log",
              query: { env: "staging", platform: "DANONE" },
              icon: <MonitorSmartphone size={12} />,
            },
            {
              label: "API LOG",
              href: "/api-log",
              query: { env: "staging", platform: "DANONE" },
              icon: <ServerCog size={12} />,
            },
            {
              label: "DATABASE BACKUP",
              href: "/database-backup",
              query: { env: "staging", platform: "DANONE" },
              icon: <Database size={12} />,
            },
          ],
        },
        {
          label: "PRODUCTION",
          icon: <Rocket size={18} />,
          children: [
            {
              label: "UI LOG",
              href: "/ui-log",
              query: { env: "prod", platform: "DANONE" },
              icon: <MonitorSmartphone size={12} />,
            },
            {
              label: "API LOG",
              href: "/api-log",
              query: { env: "prod", platform: "DANONE" },
              icon: <ServerCog size={12} />,
            },
            {
              label: "DATABASE BACKUP",
              href: "/database-backup",
              query: { env: "prod", platform: "DANONE" },
              icon: <Database size={12} />,
            },
          ],
        },
        {
          label: "MANDRILL EMAIL",
          href: "/mandrill-email",
          icon: <Mail size={12} />,
        },
      ],
    },
  ]

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [label]: !prev[label],
    }))
  }

  const isActive = (item: MenuItem) => {
    if (!item.href) return false

    if (item.query) {
      const currentEnv = searchParams.get("env")
      const currentPlatform = searchParams.get("platform")
      return pathname === item.href && currentEnv === item.query.env && currentPlatform === item.query.platform
    }

    return pathname === item.href
  }

  const renderMenuItem = (item: MenuItem, level = 0, parentExpanded = true) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems[item.label]
    const active = isActive(item)

    const buildQueryString = (query?: Record<string, string>) => {
      if (!query) return ""
      return (
        "?" +
        Object.entries(query)
          .map(([key, value]) => `${key}=${value}`)
          .join("&")
      )
    }

    return (
      <div key={item.label} style={{ display: parentExpanded ? "block" : "none" }}>
        {item.href ? (
          <Link
            href={`${item.href}${buildQueryString(item.query)}`}
            className={`sidebar-item ${active ? "active" : ""}`}
            style={{ paddingLeft: `${level * 16 + 16}px` }}
          >
            {item.icon && <span className="sidebar-icon flex items-center justify-center">{item.icon}</span>}
            <span className={active ? "font-bold" : ""}>{item.label}</span>
          </Link>
        ) : (
          <div
            className="sidebar-item"
            style={{ paddingLeft: `${level * 16 + 16}px` }}
            onClick={() => toggleExpand(item.label)}
          >
            <div className="flex items-center">
              {item.icon && <span className="sidebar-icon flex items-center justify-center">{item.icon}</span>}
              <span>{item.label}</span>
            </div>
            {hasChildren && (
              <span className="sidebar-chevron">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </span>
            )}
          </div>
        )}

        {hasChildren && (
          <div className="sidebar-children">
            {item.children?.map((child) => renderMenuItem(child, level + 1, isExpanded))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Image src="/images/logo_xva.png" alt="XVA Automation Logo" width={180} height={80} className="mx-auto" />
        </div>
        <div className="sidebar-menu">MENU</div>
      </div>
      <nav className="sidebar-nav">{menuItems.map((item) => renderMenuItem(item))}</nav>
    </div>
  )
}
