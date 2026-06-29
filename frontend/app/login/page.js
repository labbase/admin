"use client";

import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [mode, setMode] = useState("login"); 

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api";

      // 비밀번호 정책
  const isStrongPassword = (password) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&  // 대문자
      /[a-z]/.test(password) &&  // 소문자
      /[0-9]/.test(password) &&  // 숫자
      /[^A-Za-z0-9]/.test(password) // 특수문자
    );
  };


  // ✅ 로그인 처리
  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include", // 🔥 쿠키를 포함하도록 설정
      });

      if (!res.ok) throw new Error();

      toast.success("Login success!");
      router.push("/"); // ✅ 로그인 성공하면 홈으로 이동

    } catch (err) {
      toast.error("Login failed");
    }
  };


const handleRegister = async () => {
    
    // 비밀번호 정책 체크
    if (!name || !email || !password) {
      toast.error("name, email and password required");
      return;
    }
    if (!isStrongPassword(password)) {
      toast.error("password must be at least 8 characters long and include uppercase, lowercase, number, special character and min length 8");
      return;
    }

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