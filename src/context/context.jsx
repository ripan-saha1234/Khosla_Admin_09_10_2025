import { useEffect } from "react";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";


export const Context = createContext(null);

export function GlobalState({ children }) {
  // Check if user is already logged in from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const savedAuth = localStorage.getItem('isAuthenticated');
    return savedAuth === 'true';
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const navigate = useNavigate();

  // Login function - will be used with API in future
  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify(userData));
    navigate("/admin-panel/dashboard");
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate("/login");
  };

  useEffect(() => {
    // Redirect to appropriate page on mount
    if (isAuthenticated && user) {
      navigate("/admin-panel/dashboard");
    } else {
      navigate("/login");
    }
  }, []);

  return (
    <Context.Provider value={{
      user,
      isAuthenticated,
      login,
      logout,
    }}>
      {children}
    </Context.Provider>
  )

}