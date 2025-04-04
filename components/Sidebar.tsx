// "use client"

// import type React from "react"

// import { useState } from "react"
// import Link from "next/link"
// import { usePathname, useSearchParams } from "next/navigation"

// type MenuItem = {
//   label: string
//   href?: string
//   icon?: React.ReactNode
//   children?: MenuItem[]
//   query?: Record<string, string>
// }

// export function Sidebar() {
//   const pathname = usePathname()
//   const searchParams = useSearchParams()

//   const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
//     XVA: true,
//     DANONE: false,
//   })

//   const menuItems: MenuItem[] = [
//     {
//       label: "DASHBOARD",
//       href: "/dashboard",
//     },
//     {
//       label: "XVA",
//       children: [
//         {
//           label: "DEVELOPMENT",
//           children: [
//             {
//               label: "UI LOG",
//               href: "/ui-log",
//               query: { env: "dev", platform: "XVA" },
//             },
//             {
//               label: "API LOG",
//               href: "/api-log",
//               query: { env: "dev", platform: "XVA" },
//             },
//             {
//               label: "DATABASE BACKUP",
//               href: "/database-backup",
//               query: { env: "dev", platform: "XVA" },
//             },
//           ],
//         },
//         {
//           label: "PRODUCTION",
//           children: [
//             {
//               label: "UI LOG",
//               href: "/ui-log",
//               query: { env: "prod", platform: "XVA" },
//             },
//             {
//               label: "API LOG",
//               href: "/api-log",
//               query: { env: "prod", platform: "XVA" },
//             },
//             {
//               label: "DATABASE BACKUP",
//               href: "/database-backup",
//               query: { env: "prod", platform: "XVA" },
//             },
//           ],
//         },
//         {
//           label: "GO DADDY EMAIL",
//           href: "/go-daddy-email",
//           query: { platform: "XVA" },
//         },
//       ],
//     },
//     {
//       label: "DANONE",
//       children: [
//         {
//           label: "STAGING",
//           children: [
//             {
//               label: "UI LOG",
//               href: "/ui-log",
//               query: { env: "staging", platform: "DANONE" },
//             },
//             {
//               label: "API LOG",
//               href: "/api-log",
//               query: { env: "staging", platform: "DANONE" },
//             },
//             {
//               label: "DATABASE BACKUP",
//               href: "/database-backup",
//               query: { env: "staging", platform: "DANONE" },
//             },
//           ],
//         },
//         {
//           label: "PRODUCTION",
//           children: [
//             {
//               label: "UI LOG",
//               href: "/ui-log",
//               query: { env: "prod", platform: "DANONE" },
//             },
//             {
//               label: "API LOG",
//               href: "/api-log",
//               query: { env: "prod", platform: "DANONE" },
//             },
//             {
//               label: "DATABASE BACKUP",
//               href: "/database-backup",
//               query: { env: "prod", platform: "DANONE" },
//             },
//           ],
//         },
//         {
//           label: "MANDRILL EMAIL",
//           href: "/mandrill-email",
//         }
//       ],
//     },
//   ]

//   const toggleExpand = (label: string) => {
//     setExpandedItems((prev) => ({
//       ...prev,
//       [label]: !prev[label],
//     }))
//   }

//   const isActive = (item: MenuItem) => {
//     if (!item.href) return false

//     if (item.query) {
//       const currentEnv = searchParams.get("env")
//       const currentPlatform = searchParams.get("platform")
//       return pathname === item.href && currentEnv === item.query.env && currentPlatform === item.query.platform
//     }

//     return pathname === item.href
//   }

//   const renderMenuItem = (item: MenuItem, level = 0, parentExpanded = true) => {
//     const hasChildren = item.children && item.children.length > 0
//     const isExpanded = expandedItems[item.label]
//     const active = isActive(item)

//     const buildQueryString = (query?: Record<string, string>) => {
//       if (!query) return ""
//       return (
//         "?" +
//         Object.entries(query)
//           .map(([key, value]) => `${key}=${value}`)
//           .join("&")
//       )
//     }

//     return (
//       <div key={item.label} style={{ display: parentExpanded ? "block" : "none" }}>
//         {item.href ? (
//           <Link
//             href={`${item.href}${buildQueryString(item.query)}`}
//             className={`sidebar-item ${active ? "active" : ""}`}
//             style={{ paddingLeft: `${level * 20 + 16}px` }}
//           >
//             {item.icon && <span className="sidebar-icon">{item.icon}</span>}
//             <span className={active ? "font-bold" : ""}>{item.label}</span>
//           </Link>
//         ) : (
//           <div
//             className="sidebar-item"
//             style={{ paddingLeft: `${level * 20 + 16}px` }}
//             onClick={() => toggleExpand(item.label)}
//           >
//             <div className="flex items-center">
//               {item.icon && <span className="sidebar-icon">{item.icon}</span>}
//               <span>{item.label}</span>
//             </div>
//             {hasChildren && <span className={`sidebar-chevron ${isExpanded ? "expanded" : ""}`}>▶</span>}
//           </div>
//         )}

//         {hasChildren && (
//           <div className="sidebar-children">
//             {item.children?.map((child) => renderMenuItem(child, level + 1, isExpanded))}
//           </div>
//         )}
//       </div>
//     )
//   }

//   return (
//     <div className="sidebar">
//       <div className="sidebar-header">
//         <div className="sidebar-logo">XVA LOGO</div>
//         <div className="sidebar-menu">MENU</div>
//       </div>
//       <nav className="sidebar-nav">{menuItems.map((item) => renderMenuItem(item))}</nav>
//     </div>
//   )
// }

// components/sidebar.tsx
"use client"

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export function Sidebar() {
  const searchParams = useSearchParams();
  const env = searchParams.get("env") || "dev";
  const platform = searchParams.get("platform") || "XVA";

  return (
    <div className="sidebar">
      <nav>
        <Link href="/dashboard">Dashboard</Link>
        <Link href={`/ui-log?env=${env}&platform=${platform}`}>UI Log</Link>
        <Link href={`/api-log?env=${env}&platform=${platform}`}>API Log</Link>
        <Link href={`/database-backup?env=${env}&platform=${platform}`}>Database Backup</Link>
        <Link href={`/mandrill-email?env=${env}&platform=${platform}`}>Mandrill Email</Link>
        <Link href={`/go-daddy-email?env=${env}&platform=${platform}`}>Go Daddy Email</Link>
      </nav>
    </div>
  );
}