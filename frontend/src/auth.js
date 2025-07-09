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