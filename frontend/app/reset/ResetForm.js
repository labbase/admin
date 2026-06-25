"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function ResetPage() {
  const params = useSearchParams();
  const token = params.get("token");
  const [password, setPassword] = useState("");  
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api";


    const handleReset = async () => {
    try {
        const res = await fetch(`${API_URL}/auth/reset`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            token,
            password,
        }),
        });
        if (!res.ok) throw new Error();

        toast.success("Password updated!");

        setTimeout(() => {
        window.location.href = "/login";
        }, 100);

    } catch {
        toast.error("Reset failed");
    }
    };
    
  return (
    <div className="p-6 max-w-sm mx-auto">
    <Toaster />
      <h1>Reset Password</h1>

      <input
        type="password"
        placeholder="New password"
        className="border p-2 w-full mb-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleReset}>
        Reset
      </button>
    </div>
  );
}