// types/log.ts
export interface LogFile {
    name: string;
    path: string; // We'll use name as the path for simplicity
    date: string;
    server: string;
    env: string;
    size: number;
    last_modified: string;
  }
  
  export interface LogListResponse {
    files: LogFile[];
    total_count: number;
    page: number;
    page_size: number;
  }
  
  export interface LogSearchResult {
    file_name: string;
    server: string;
    env: string;
    content: string;
  }