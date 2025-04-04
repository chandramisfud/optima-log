// components/auth-wrapper.tsx
"use client"

import { AuthProvider } from '@/context/auth-context';
import { ReactNode } from 'react';

export default function AuthWrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}