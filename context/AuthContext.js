import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    try {
      const stored = localStorage.getItem('aitoolshub_user');
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setLoading(false);
  }, []);

  const login = (userData) => {
    const u = { ...userData, loginAt: Date.now() };
    setUser(u);
    localStorage.setItem('aitoolshub_user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aitoolshub_user');
  };

  const updateUser = (data) => {
    const u = { ...user, ...data };
    setUser(u);
    localStorage.setItem('aitoolshub_user', JSON.stringify(u));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

// Simulate user database in localStorage
export const UserDB = {
  getAll: () => {
    try { return JSON.parse(localStorage.getItem('aitoolshub_users') || '[]'); } catch { return []; }
  },
  save: (users) => {
    localStorage.setItem('aitoolshub_users', JSON.stringify(users));
  },
  findByEmail: (email) => {
    return UserDB.getAll().find(u => u.email?.toLowerCase() === email?.toLowerCase());
  },
  findByPhone: (phone) => {
    return UserDB.getAll().find(u => u.phone === phone);
  },
  create: (userData) => {
    const users = UserDB.getAll();
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: Date.now(),
      savedPrompts: [],
    };
    users.push(newUser);
    UserDB.save(users);
    return newUser;
  },
  update: (id, data) => {
    const users = UserDB.getAll();
    const idx = users.findIndex(u => u.id === id);
    if (idx > -1) {
      users[idx] = { ...users[idx], ...data };
      UserDB.save(users);
      return users[idx];
    }
  },
};

// OTP simulation store
export const OTPStore = {
  generate: (key) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const data = { otp, expires: Date.now() + 10 * 60 * 1000 }; // 10 min
    localStorage.setItem(`otp_${key}`, JSON.stringify(data));
    return otp;
  },
  verify: (key, inputOtp) => {
    try {
      const stored = JSON.parse(localStorage.getItem(`otp_${key}`) || 'null');
      if (!stored) return false;
      if (Date.now() > stored.expires) { localStorage.removeItem(`otp_${key}`); return false; }
      if (stored.otp === inputOtp) { localStorage.removeItem(`otp_${key}`); return true; }
      return false;
    } catch { return false; }
  },
};
