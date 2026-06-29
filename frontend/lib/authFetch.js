export const authFetch = async (url, options = {}) => {
  // ✅ 먼저 요청
  let res = await fetch(url, {
    ...options,
    credentials: "include",
  });

  // ✅ accessToken 만료됐을 때
  if (res.status === 401) {
    console.log("🔁 access expired → refreshing...");

    const refreshRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    // ✅ refresh 성공하면 다시 요청
    if (refreshRes.ok) {
      console.log("✅ refresh success → retry original request");
      await new Promise((resolve) => setTimeout(resolve, 200));
      res = await fetch(url, {
        ...options,
        credentials: "include",
      });
      return res;
    } else {
      console.log("❌ refresh failed");
      window.location.href = "/login";
      return null;
    }
  }

  return res;
};