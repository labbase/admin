"use client";
import { authFetch } from "../lib/authFetch";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function Home() {

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

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [editPassword, setEditPassword] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const [search, setSearch] = useState("");
  
  const filteredUsers = Array.isArray(users)
    ? users.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase())
      )
    : []; // users가 배열인지 확인 후 필터링

  const [page, setPage] = useState(1);
  const limit = 10;
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * limit,
    page * limit
  );
  const totalPages = Math.ceil(filteredUsers.length / limit);


  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api";


  // ✅ 사용자 조회 (맨 아래)
  useEffect(() => {
    fetchUsers();
  }, []);

 

  // ✅ 조회 함수
  const fetchUsers = async () => {
    try {
      const res = await authFetch(`${API_URL}/users`);
      
      if (!res) {
        console.log("res 없음 (authFetch 문제)");
        window.location.href = "/login";
        return;
      }

      if(!res.ok) {
        throw new Error("Fetch failed");
      }

      const data = await res.json();

      setUsers(Array.isArray(data) ? data : []); // API가 배열을 반환하는지 확인
      setLoading(false);
    } catch (err) {
      console.error("fetch error:", err);
      toast.error("Something went wrong");
      setUsers([]); // 에러 시 빈 배열로 초기화
      setLoading(false);
    }
  };



  // ✅ 로그아웃 함수
  const handleLogout = () => {
    document.cookie = "token=; path=/; max-age=0";
    window.location.href = "/login";
  };



  // ✅ POST (추가)
  const addUser = async () => {
  
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
      setActionLoading(true);
      const res = await authFetch(`${API_URL}/users`, {
        method: "POST",
        body: JSON.stringify({ name, email, password, }),
      });
      if(!res) return; // 세션 만료 시 return

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

    try {
      const res = await authFetch(`${API_URL}/users/${id}`, {
          method: "DELETE",
        });
      if(!res) return; // 세션 만료 시 return
      
      if (!res.ok) {
        throw new Error("Failed to delete user");
      }

      toast.success("User deleted!");
      fetchUsers();
    } catch (err) {
      toast.error("Something went wrong");
    }
  };



 // ✅ PUT (편집)
  const startEdit = (user) => {
    setEditingId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPassword("");
  };

// ✅ PUT (편집)
  const updateUser = async (id) => {

    // 비밀번호 정책 체크
    if (editPassword && !isStrongPassword(editPassword)) {
      toast.error("password must be at least 8 characters long and include uppercase, lowercase, number, and special character");
      return;
    }

    try {
      const res = await authFetch(`${API_URL}/users/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          password: editPassword,
        }),
      });

      if (!res) return;

      if (!res.ok) {
        throw new Error("Update failed");
      }

      toast.success("User updated!");
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  // ✅ 렌더링
  return (
    <div className="p-6 max-w-2xl mx-auto">

      <Toaster />

      <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">🛠️ Admin Console</h1>    
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-3 py-1 rounded"
      >
        Logout
      </button>
      </div>



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
        <input
          type="password"
          className="border p-2 rounded flex-1"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={addUser}
          disabled={actionLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {actionLoading ? "..." : "Add"}
        </button>
      </div>


      {/* ✅ User Table 항상 유지 */}
      {users.length === 0 ? (
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
      {/* ✅ loading은 따로 표시 */}
      {loading && <p className="text-gray-500 mt-2">Updating...</p>}


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
            <input
              type="password"
              className="border p-2 w-full mb-2"
              placeholder="New password"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
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