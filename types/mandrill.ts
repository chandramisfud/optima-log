// types/mandrill.ts
export interface MandrillActivity {
    status: string;
    date: string;
    email: string;
    subject: string;
  }
  
  export interface MandrillStats {
    delivered: number;
    sent: number;
    deliverability: string;
    quota?: number;
    sends?: number;
    resetDate?: string;
  }