// app/(authenticated)/database-backup/DatabaseBackupContent.tsx
"use client"

import { Suspense } from "react"
import { withAuth } from "@/lib/auth"
import DatabaseBackupContentInner from "./DatabaseBackupContentInner"

function DatabaseBackupContent() {
  return (
    <Suspense>
      <DatabaseBackupContentInner />
    </Suspense>
  )
}

export default withAuth(DatabaseBackupContent)
