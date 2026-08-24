import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  getCurrentUser, setCurrentUser, getUserByEmail, saveUser
} from '@/lib/storage';

const AuthContext = createContext(undefined);

const PASSWORDS_KEY = 'medibook_passwords';
function getPasswords() {
  try { return JSON.parse(localStorage.getItem(PASSWORDS_KEY) || '{}'); } catch { return {}; }
}
function setPassword(email, password) {
  const p = getPasswords(); p[email.toLowerCase()] = password;
  localStorage.setItem(PASSWORDS_KEY, JSON.stringify(p));
}
function checkPassword(email, password) {
  const p = getPasswords();
  return p[email.toLowerCase()] === password;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());

  const login = useCallback(async (email, password) => {
    const found = getUserByEmail(email);
    if (!found) return { success: false, error: 'No account found with this email.' };

    const seedEmails = [
      'admin@medibook.com',
      'sarah.chen@medibook.com',
      'james.okafor@medibook.com',
      'priya.sharma@medibook.com',
      'alex@example.com',
    ];
    const isSeed = seedEmails.includes(email.toLowerCase());
    const validPass = isSeed ? password === 'medibook123' : checkPassword(email, password);
    if (!validPass) return { success: false, error: 'Incorrect password.' };

    setCurrentUser(found);
    setUser(found);
    return { success: true };
  }, []);

  const register = useCallback(async (name, email, password, phone) => {
    const existing = getUserByEmail(email);
    if (existing) return { success: false, error: 'An account with this email already exists.' };

    const newUser = {
      id: `patient-${Date.now()}`,
      name,
      email,
      role: 'patient',
      phone,
      createdAt: new Date().toISOString(),
    };
    saveUser(newUser);
    setPassword(email, password);
    setCurrentUser(newUser);
    setUser(newUser);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
