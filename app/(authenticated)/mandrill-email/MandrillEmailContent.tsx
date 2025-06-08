// app/(authenticated)/mandrill-email/MandrillEmailContent.tsx
"use client"

import { Suspense } from "react"
import { withAuth } from "@/lib/auth"
import MandrillEmailContentInner from "./MandrillEmailContentInner"

function MandrillEmailContent() {
  return (
    <Suspense>
      <MandrillEmailContentInner />
    </Suspense>
  )
}

export default withAuth(MandrillEmailContent)
