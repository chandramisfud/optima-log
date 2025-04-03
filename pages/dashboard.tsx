// pages/dashboard.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { withAuth } from '../lib/auth';

const Dashboard: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/online-users');
  }, [router]);

  return (
    <Layout>
      <div className="text-center text-gray-800">
        <h1 className="text-2xl font-bold">Redirecting to Online Users...</h1>
      </div>
    </Layout>
  );
};

export default withAuth(Dashboard);