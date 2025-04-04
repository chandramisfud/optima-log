// app/(authenticated)/dashboard/DashboardContent.tsx
"use client"

import { Suspense } from "react";
import { withAuth } from "@/lib/auth";
import DashboardContentInner from "./DashboardContentInner";

function DashboardContent() {
  return (
    <Suspense fallback={<div className="text-center p-6">Loading...</div>}>
      <DashboardContentInner />
    </Suspense>
  );
}

export default withAuth(DashboardContent);