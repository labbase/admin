export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  // ✅ 핵심: 세션 만료 처리
  if (res.status === 401) {
    localStorage.removeItem("token");
    return null;
  }

  return res;
};
