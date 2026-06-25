"use client";

import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [mode, setMode] = useState("login"); 

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api";



  // ✅ 로그인 처리
  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error();
      // Save the token in a cookie
      document.cookie = `token=${data.token}; path=/`;

      toast.success("Login success!");

      // Redirect to home page after a short delay
      setTimeout(() => {
        window.location.href = "/";
    }, 100);

    } catch (err) {
      toast.error("Login failed");
    }
  };


const handleRegister = async () => {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    toast.success("User created!");
    setMode("login");

  } catch {
    toast.error("Register failed");
  }
};


const handleForgot = async () => {
  try {
    const res = await fetch(`${API_URL}/auth/forgot`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    });

    if (!res.ok) throw new Error();

    toast.success("Reset email sent!");

  } catch {
    toast.error("Failed to send email");
  }
};

const handleLogout = () => {
  document.cookie = "token=; path=/; max-age=0";
  window.location.href = "/login";
};


return (
  <div className="p-6 max-w-sm mx-auto">
    <Toaster />

    {/* ✅ 제목 */}
    <h1 className="text-xl font-bold mb-4">
      {mode === "login" && "Login"}
      {mode === "register" && "Create Account"}
      {mode === "forgot" && "Reset Password"}
    </h1>

    {/* ✅ register에서만 name */}
    {mode === "register" && (
      <input
        placeholder="Name"
        className="border p-2 w-full mb-2"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    )}

    {/* ✅ email은 모든 모드에서 사용 */}
    <input
      placeholder="Email"
      className="border p-2 w-full mb-2"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />

    {/* ✅ password는 login + register에서만 */}
    {(mode === "login" || mode === "register") && (
      <input
        placeholder="Password"
        type="password"
        className="border p-2 w-full mb-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
    )}

    {/* ✅ 버튼 */}
    <button
      onClick={
        mode === "login"
          ? handleLogin
          : mode === "register"
          ? handleRegister
          : handleForgot
      }
      className="bg-black text-white px-4 py-2 rounded w-full"
    >
      {mode === "login" && "Login"}
      {mode === "register" && "Register"}
      {mode === "forgot" && "Send Reset Email"}
    </button>

    {/* ✅ 하단 전환 */}
    <div className="flex justify-between mt-3 text-sm text-blue-500">

      {mode !== "login" && (
        <button onClick={() => setMode("login")}>
          Login
        </button>
      )}

      {mode !== "register" && (
        <button onClick={() => setMode("register")}>
          Create Account
        </button>
      )}

      {mode !== "forgot" && (
        <button onClick={() => setMode("forgot")}>
          Forgot Password
        </button>
      )}

    </div>
  </div>
);

}