// types/log.ts
export interface LogFile {
  name: string
  path: string
  date?: string // Optional for S3-based logs
  server?: string // Optional for S3-based logs
  env?: string // Optional for S3-based logs
  size: number
  last_modified?: string // S3 format
  modified?: string // Agent format (ISO timestamp)
  type?: string // NEW: main, background, sso, stdout (for agent logs)
}

export interface LogListResponse {
  files: LogFile[]
  total_count?: number // S3 format
  count?: number // Agent format
  page?: number
  page_size?: number
}

export interface LogSearchResult {
  file_name?: string // S3 format
  FileName?: string // Agent format (keep both for compatibility)
  server?: string
  Server?: string
  env?: string
  Env?: string
  content?: string
  Content?: string
}

// NEW: Type for agent log patterns
export type LogPattern = "main" | "background" | "sso" | "stdout"