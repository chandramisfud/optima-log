import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { NextRouter } from 'next/router';

// Define the type for the AuthContext
interface AuthContextType {
    isAuthenticated: () => boolean;
}

const Home: React.FC = () => {
    const { isAuthenticated } = useAuth() as AuthContextType;
    const router: NextRouter = useRouter();

    useEffect(() => {
        if (isAuthenticated()) {
            router.push('/dashboard');
        } else {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-lg text-gray-700">Redirecting...</p>
            </div>
        </div>
    );
};

export default Home;