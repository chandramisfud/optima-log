import React from 'react';
import Dashboard from '../components/Dashboard';

const DashboardPage: React.FC = () => {
    return <Dashboard />;
};

// Disable SSR for this page since it uses client-side routing
export const getServerSideProps = () => {
    return {
        props: {},
    };
};

export default DashboardPage;
