// lib/auth.ts
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import React from 'react';

// Function to check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Function to set the JWT token in localStorage
export const setToken = (token: string): void => {
  if (isBrowser) {
    localStorage.setItem('token', token);
  }
};

// Function to get the JWT token from localStorage
export const getToken = (): string | null => {
  if (!isBrowser) {
    return null; // Return null if not in a browser environment
  }
  return localStorage.getItem('token');
};

// Function to remove the JWT token from localStorage
export const removeToken = (): void => {
  if (isBrowser) {
    localStorage.removeItem('token');
  }
};

// Higher-order component to protect routes
export function withAuth<P extends object>(Component: NextPage<P>) {
  const AuthenticatedComponent: NextPage<P> = (props: P) => {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    // Ensure this logic only runs on the client
    useEffect(() => {
      setIsClient(true);
    }, []);

    // Check the token only on the client
    const token = isClient ? getToken() : null;

    useEffect(() => {
      if (isClient && !token) {
        router.push('/');
      }
    }, [token, router, isClient]);

    if (!isClient) {
      return null; // Render nothing on the server
    }

    if (!token) {
      return null; // Or a loading spinner
    }

    return React.createElement(Component, props);
  };

  // Set a display name for better debugging
  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;

  return AuthenticatedComponent;
}