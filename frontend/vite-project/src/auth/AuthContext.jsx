import { createContext, useState, useEffect } from "react";
import api from "../api/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access");
    const storedUsername = localStorage.getItem("username");
    if (token) {
      setUser({ logged: true, username: storedUsername });
    }
    setLoading(false);
  }, []);

  const register = async (username, email, password) => {
    await api.post("accounts/register/", {
      username,
      email,
      password,
    });
  };

  const login = async (username, password) => {
    const response = await api.post("accounts/login/", {
      username,
      password,
    });

    localStorage.setItem("access", response.data.access);
    localStorage.setItem("refresh", response.data.refresh);
    localStorage.setItem("username", username);

    setUser({ username, logged: true });
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
