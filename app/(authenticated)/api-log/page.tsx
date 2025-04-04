// app/(authenticated)/api-log/page.tsx
"use client"

import { useSearchParams } from "next/navigation";
import { LogViewer } from "@/components/log-viewer";
import { withAuth } from "@/lib/auth";

function APILogPage() {
  const searchParams = useSearchParams();
  const env = searchParams.get("env") || "dev";
  const platform = searchParams.get("platform") || "XVA";

  return <LogViewer title="API LOG" server="api" env={env} platform={platform} />;
}

export default withAuth(APILogPage);