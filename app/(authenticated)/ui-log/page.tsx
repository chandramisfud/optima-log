"use client"

import { useSearchParams } from "next/navigation"
import { LogViewer } from "@/components/log-viewer"

export default function UILogPage() {
  const searchParams = useSearchParams()
  const env = searchParams.get("env") || "dev"
  const platform = searchParams.get("platform") || "XVA"

  return <LogViewer title="UI LOG" server="ui" env={env} platform={platform} />
}

