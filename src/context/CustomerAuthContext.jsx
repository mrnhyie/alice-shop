import { createContext, useContext, useState } from 'react';

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(() => {
    try {
      const stored = localStorage.getItem('alice_customer');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = ({ id, name, email, token, avatar }) => {
    const data = { id, name, email, token, avatar };
    localStorage.setItem('alice_customer', JSON.stringify(data));
    setCustomer(data);
  };

  const logout = () => {
    localStorage.removeItem('alice_customer');
    setCustomer(null);
  };

  const isAuthenticated = !!customer;

  return (
    <CustomerAuthContext.Provider
      value={{ customer, isAuthenticated, isLoggedIn: isAuthenticated, login, logout }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  return ctx;
}
