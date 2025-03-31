import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { NextRouter } from 'next/router';

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

    return null;
};

export default Home;