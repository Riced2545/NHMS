let users = ["testuser"];

export const isAuthenticated = () => {
  return localStorage.getItem("user") !== null;
};

export const login = (username) => {
  if (users.includes(username)) {
    localStorage.setItem("user", username);
    return true;
  }
  return false;
};

export const logout = () => {
  localStorage.removeItem("user");
};

export const register = (username) => {
  if (!users.includes(username)) {
    users.push(username);
    return true;
  }
  return false;
};

export function getUserRole() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role_id;
  } catch {
    return null;
  }
}