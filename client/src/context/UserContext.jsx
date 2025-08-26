import { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for token and fetch user data
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:1085/api/users/me'|| import.meta.env.VITE_API_URL || 'https://thesisconnect-backend.onrender.com/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setUser(data))
        .catch(() => localStorage.removeItem('token'));
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};