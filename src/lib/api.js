const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export async function post(path, body, token) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  return res;
}

export async function get(path, token) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  return res;
}

export default { API_URL, post, get };
