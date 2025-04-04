// app/(authenticated)/SidebarWrapper.tsx
"use client"

import { Suspense } from "react";
import { Sidebar } from "@/components/sidebar";

export default function SidebarWrapper() {
  return (
    <Suspense fallback={<div className="sidebar-loading">Loading sidebar...</div>}>
      <Sidebar />
    </Suspense>
  );
}