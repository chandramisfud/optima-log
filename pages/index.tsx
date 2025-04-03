// pages/index.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { setToken } from '../lib/auth';
import { useAuth } from '../context/AuthContext';
import { User } from '../types/user';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post<{ token: string; user: User }>(
        'https://apioptima-log.xva-rnd.com/api/users/login',
        {
          email,
          password,
        }
      );
      setToken(response.data.token);
      setUser(response.data.user);
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-teal-500">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">WELCOME TO XVA LOG MANAGEMENT</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-2 border rounded ${error ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-2 border rounded ${error ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
          >
            SIGN IN
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;