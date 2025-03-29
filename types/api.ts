// types/api.ts

// User type (matches models.User in the Go API)
export interface User {
    id: number;
    username: string;
    email: string;
    password: string; // Empty in responses for security
    role: "admin" | "user";
    created_at: string;
    updated_at: string;
  }
  
  // Register request (matches RegisterRequest in the Go API)
  export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    role: "admin" | "user";
  }
  
  // Login request (matches models.UserLoginRequest in the Go API)
  export interface LoginRequest {
    email: string;
    password: string;
  }
  
  // Login response (matches models.UserLoginResponse in the Go API)
  export interface LoginResponse {
    token: string;
    user: User;
  }
  
  // Log file type (matches models.LogFile in the Go API)
  export interface LogFile {
    name: string;
    date: string;
    server: string;
    env: string;
    logType: string;
    size: number;
    lastModified: string;
  }
  
  // List logs response (matches models.ListLogsResponse in the Go API)
  export interface ListLogsResponse {
    files: LogFile[];
    totalCount: number;
    page: number;
    pageSize: number;
  }
  
  // Log entry type (matches models.LogEntry in the Go API)
  export interface LogEntry {
    fileName: string;
    server: string;
    env: string;
    content: string;
  }
  
  // Mandrill log type (matches models.MandrillLog in the Go API)
  export interface MandrillLog {
    timestamp: number;
    subject: string;
    email: string;
    sender: string;
    state: string;
    opens: number;
    clicks: number;
    smtpEvents: MandrillSmtpEvent[];
    bounce?: string;
  }
  
  // Mandrill SMTP event type (matches models.MandrillSmtpEvent in the Go API)
  export interface MandrillSmtpEvent {
    timestamp: number;
    type: string;
    diag: string;
  }