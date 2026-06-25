export const authFetch = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
  });

  if (res.status === 401) {
    return null;
  }

  return res;
};
