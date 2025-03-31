import React, { useState, FormEvent } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/components/AuthContext";
import { LoginRequest } from "@/types/api";
import LoginForm from "@/components/LoginForm";

const Login: React.FC = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const { login, isAuthenticated } = useAuth();
    const router = useRouter();

    if (isAuthenticated()) {
        router.push("/dashboard");
        return null;
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            const credentials: LoginRequest = { email, password };
            await login(credentials);
            router.push("/dashboard");
        } catch (err) {
            const error = err as Error;
            setError(error.message || "Login failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-teal-200">
            <LoginForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                error={error}
                handleSubmit={handleSubmit}
            />
        </div>
    );
};

export default Login;