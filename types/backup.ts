// types/backup.ts
export interface BackupFile {
    file_name: string;
    name: string; // Alias for file_name
    path: string; // Alias for file_name
    date: string;
    env: string;
    size: number;
    last_modified: string;
  }