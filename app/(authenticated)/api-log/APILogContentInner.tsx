// app/(authenticated)/api-log/APILogContentInner.tsx
"use client"

import { useSearchParams } from "next/navigation"
import { LogViewer } from "@/components/log-viewer"

export default function APILogContentInner() {
  const searchParams = useSearchParams()
  const env = searchParams.get("env") || "dev"
  const platform = searchParams.get("platform") || "XVA"

  return <LogViewer title="API LOG" server="api" env={env} platform={platform} />
}
