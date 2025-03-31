import React from 'react';
import { Routes, Route } from 'react-router-dom';
import dynamic from 'next/dynamic';
import { AuthProvider } from '../components/AuthContext';
import Login from '../components/Login';
import Dashboard from '../components/Dashboard';

// Dynamically import BrowserRouter to ensure it only runs on the client side
const Router = dynamic(() => import('react-router-dom').then(mod => mod.BrowserRouter), {
    ssr: false, // Disable server-side rendering for this component
});

const MyApp: React.FC<{ Component: React.FC; pageProps: any }> = ({ Component, pageProps }) => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard/*" element={<Dashboard />} />
                    <Route path="/" element={<Login />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default MyApp;