import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('name');
    const username = localStorage.getItem('username');
    if (token && username) {
      setUser({ token, name, username });
    }
    setLoading(false);
  }, []);

  const login = (data) => {
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('name', data.name);
    localStorage.setItem('username', data.username);
    setUser({ token: data.access_token, name: data.name, username: data.username });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('username');
    setUser(null);
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
