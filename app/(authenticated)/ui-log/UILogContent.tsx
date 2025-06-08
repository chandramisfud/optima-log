// app/(authenticated)/ui-log/UILogContent.tsx
"use client"

import { Suspense } from "react"
import { withAuth } from "@/lib/auth"
import UILogContentInner from "./UILogContentInner"

function UILogContent() {
  return (
    <Suspense>
      <UILogContentInner />
    </Suspense>
  )
}

export default withAuth(UILogContent)
