// lib/auth.ts
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import React from 'react';

// Function to set the JWT token in localStorage
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// Function to get the JWT token from localStorage
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Function to remove the JWT token from localStorage
export const removeToken = (): void => {
  localStorage.removeItem('token');
};

// Higher-order component to protect routes
export function withAuth<P extends object>(Component: NextPage<P>) {
  const AuthenticatedComponent: NextPage<P> = (props: P) => {
    const router = useRouter();
    const token = getToken();

    useEffect(() => {
      if (!token) {
        router.push('/');
      }
    }, [token, router]);

    if (!token) {
      return null; // Or a loading spinner
    }

    // Use React.createElement instead of JSX
    return React.createElement(Component, props);
  };

  return AuthenticatedComponent;
}