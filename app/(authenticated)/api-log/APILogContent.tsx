// app/(authenticated)/api-log/APILogContent.tsx
"use client"

import { Suspense } from "react"
import { withAuth } from "@/lib/auth"
import APILogContentInner from "./APILogContentInner"

function APILogContent() {
  return (
    <Suspense>
      <APILogContentInner />
    </Suspense>
  )
}

export default withAuth(APILogContent)
