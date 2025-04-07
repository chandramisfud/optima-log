// types/mandrill.ts
export interface MandrillActivity {
    email: string;
    subject: string;
    status: string;
    date: string;
    clock: string; // Add clock field for date and time
    content?: string;
    _id?: string;
    ts?: number;
  }
  
  export interface MandrillQuota {
    emails_sent: number;
    monthly_limit: number;
    emails_remaining: number;
    percentage_used: number;
    reset_date: string;
    hourly_quota: number;
    backlog: number;
  }
  
  export interface MandrillMetrics {
    sent: number;
    delivered: number;
    deliverability: number;
  }
  
  export interface MandrillActivityResponse {
    quota: MandrillQuota;
    metrics: MandrillMetrics;
    messages: MandrillActivity[];
    total_count: number;
    page: number;
    page_size: number;
  }
  
  export interface MandrillStats {
    delivered: number;
    sent: number;
    deliverability: string;
    quota: number;
    sends: number;
    resetDate: string;
  }