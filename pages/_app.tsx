import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../components/AuthContext';
import Login from '../components/login';
import Dashboard from '../components/Dashboard';

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