"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function Home() {
  
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("")

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const [search, setSearch] = useState("");
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const [page, setPage] = useState(1);
  const limit = 10;
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * limit,
    page * limit
  );
  const totalPages = Math.ceil(filteredUsers.length / limit);


  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api";

  // ✅ 조회 함수
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    const interval = setInterval(fetchUsers, 60000);
    return () => clearInterval(interval);
  }, []);

  // ✅ POST (추가)
  const addUser = async () => {
    if (!name || !email) {
      toast.error("이름과 이메일 입력");
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
           Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, email }),
      });

      if (!res.ok) {
        throw new Error("Failed to add user");
      }
      setName("");
      setEmail("");
      toast.success("User added!"); 
      fetchUsers();
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setActionLoading(false);
    }
  };


  // ✅ DELETE (삭제) 
  const deleteUser = async (id) => {
    const ok = confirm("정말 삭제할까요?");
    if (!ok) return;
      const token = localStorage.getItem("token");
    await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    toast.success("User deleted!");
    fetchUsers();
  };


 // ✅ PUT (편집)
  const startEdit = (user) => {
    setEditingId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
  };

  const updateUser = async (id) => {
    const token = localStorage.getItem("token");
    
    await fetch(`${API_URL}/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: editName,
        email: editEmail,
      }),
    });
    toast.success("User updated!");
    setEditingId(null);
    fetchUsers();
  };

  // ✅ Login
  const handleLogin = async () => {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: loginEmail,
        password: loginPassword,
      }),
    });

  const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error);
      }

      // 토큰 저장
      localStorage.setItem("token", data.token);

      toast.success("Login success!");
    } catch (err) {
      toast.error("Login failed");
    }
  };

  return (
  
  <div className="p-6 max-w-2xl mx-auto">

    <div className="mb-6 border p-4 rounded">
      <h2 className="mb-2 font-bold">Login</h2>

      <input
        placeholder="Email"
        value={loginEmail}
        onChange={(e) => setLoginEmail(e.target.value)}
        className="border p-2 w-full mb-2"
      />

      <input
        placeholder="Password"
        type="password"
        value={loginPassword}
        onChange={(e) => setLoginPassword(e.target.value)}
        className="border p-2 w-full mb-2"
      />

      <button
        onClick={handleLogin}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Login
      </button>
    </div>

    <Toaster />
    <h1 className="text-2xl font-bold mb-6">🛠️ Admin Console</h1>

    {/* ✅ Search Bar and Form */}
    <input
      placeholder="Search users..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="border p-2 rounded w-full mb-4"
    />
    <div className="flex gap-2 mb-6">
      <input
        className="border p-2 rounded flex-1"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="border p-2 rounded flex-1"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        onClick={addUser}
        disabled={actionLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {actionLoading ? "..." : "Add"}
      </button>
    </div>

    {/* ✅ User Table */}
    {loading ? (
      <p className="text-gray-500">Loading...</p>
    ) : users.length === 0 ? (
      <p className="text-gray-400">No users found</p>
    ) : (
        <table className="w-full border rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-2">{user.id}</td>
                <td className="p-2">{user.name}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2 space-x-2">
                  <button onClick={() => startEdit(user)}>✏️</button>
                  <button onClick={() => deleteUser(user.id)}>❌</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
    )}

    {/* ✅ Pagination */}
    <div className="flex justify-center gap-2 mt-4">
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          onClick={() => setPage(i + 1)}
          className={`px-3 py-1 border rounded ${
            page === i + 1 ? "bg-blue-500 text-white" : ""
          }`}
        >
          {i + 1}
        </button>
      ))}
    </div>


    {/* ✅ Edit Users */}    
    {editingId && (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
        <div className="bg-white p-4 rounded w-80">
          <h2 className="text-lg mb-3">Edit User</h2>

          <input
            className="border p-2 w-full mb-2"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />

          <input
            className="border p-2 w-full mb-2"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
          />

          <div className="flex gap-2">
            <button
              onClick={() => updateUser(editingId)}
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              Save
            </button>

            <button
              onClick={() => setEditingId(null)}
              className="bg-gray-400 text-white px-3 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}