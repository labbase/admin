"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const [message, setMessage] = useState("");
  



  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api";

  // ✅ 조회 함수
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`);
      const data = await res.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      console.error("ERROR:", err);
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
      alert("이름과 이메일 입력");
      return;
    }

    try {
      setActionLoading(true);

      const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
      });

      if (!res.ok) {
        throw new Error("Failed to add user");
      }

      setName("");
      setEmail("");
      setMessage("User added!");
      setTimeout(() => setMessage(""), 2000);

      fetchUsers();
    } catch (err) {
      alert("에러 발생: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };


  // ✅ DELETE (삭제) 
  const deleteUser = async (id) => {
    const ok = confirm("정말 삭제할까요?");
    if (!ok) return;

    await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
    });

    fetchUsers();
  };


 // ✅ PUT (편집)
  const startEdit = (user) => {
    setEditingId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
  };

  const updateUser = async (id) => {
    await fetch(`${API_URL}/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: editName,
        email: editEmail,
      }),
    });

    setEditingId(null);
    fetchUsers();
  };


  return (
  <div className="p-6 max-w-2xl mx-auto">
    <h1 className="text-2xl font-bold mb-6">🛠️ Admin Console</h1>

    {/* ✅ Message */}
    {message && (
      <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
        {message}
      </div>
    )}

    {/* ✅ Form */}
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

    {/* ✅ 리스트 */}
    {loading ? (
      <p className="text-gray-500">Loading...</p>
    ) : users.length === 0 ? (
      <p className="text-gray-400">No users found</p>
    ) : (
      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="border p-3 rounded flex justify-between items-center"
          >
            {editingId === user.id ? (
              <div className="flex gap-2 flex-1">
                <input
                  className="border p-1 rounded"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <input
                  className="border p-1 rounded"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />

                <button
                  onClick={() => updateUser(user.id)}
                  className="bg-green-500 text-white px-2 rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="bg-gray-400 text-white px-2 rounded"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(user)}
                    className="bg-yellow-400 px-2 py-1 rounded"
                  >
                    ✏️
                  </button>

                  <button
                    onClick={() => deleteUser(user.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    ❌
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);
}