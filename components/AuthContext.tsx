// components/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { LoginRequest, LoginResponse, User } from "@/types/api";
import axios, { AxiosError } from "axios";
import logger from "@/utils/logger";

// Define the shape of the AuthContext
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

// Create the AuthContext with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props for the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider component to manage authentication state
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Load user and token from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      logger.debug("Loading user and token from localStorage", { storedUser, storedToken });
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    } else {
      logger.debug("No user or token found in localStorage");
    }
  }, []);

  // Login function
  const login = async (credentials: LoginRequest) => {
    logger.debug("Attempting login with credentials", credentials);
    try {
      const response = await axios.post<LoginResponse>("https://apioptima-log.xva-rnd.com/api/users/login", credentials);
      const { user, token } = response.data;
      logger.info("Login successful", { user, token });
      setUser(user);
      setToken(token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorMessage =
        "Login failed: " + (axiosError.response?.data?.message || axiosError.message || "Unknown error");
      logger.error(errorMessage, axiosError);
      throw new Error(errorMessage);
    }
  };

  // Logout function
  const logout = () => {
    logger.debug("Logging out user", user);
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    logger.info("Logout successful");
  };

  // Check if the user is authenticated
  const isAuthenticated = () => {
    const authenticated = !!token;
    logger.debug("Checking authentication status", { authenticated });
    return authenticated;
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};