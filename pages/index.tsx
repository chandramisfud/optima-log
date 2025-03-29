// pages/index.tsx

import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuth } from "@/components/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  return <div>Redirecting...</div>;
}