import { UserProfile } from '../types';

const STORAGE_USERS_KEY = 'eduzoon_users_db';
const STORAGE_CURRENT_USER_KEY = 'eduzoon_current_user';
export const PERMANENT_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxZ9zi8tz1h8lMDp_T_n9V_3upMTNvo5bkjVFNpMgXf-I6dkpXC63ajG4ONgJN3wCKY/exec';

export const getGoogleSheetsUrl = (): string => {
  return PERMANENT_SHEETS_URL;
};

export const setGoogleSheetsUrl = (_url: string) => {
  // Permanent URL cannot be overridden
};

export const getStoredUsers = (): UserProfile[] => {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      return [];
    }
    let users: UserProfile[] = JSON.parse(raw);
    // Filter out any unwanted/legacy demo account "Rafid Ahmed" unless username is mdrafidbinhabib
    const filtered = users.filter((u) => {
      const name = (u.fullName || '').toLowerCase();
      const uname = (u.username || '').toLowerCase();
      if ((name.includes('rafid ahmed') || name.includes('রাফিদ আহমেদ')) && uname !== 'mdrafidbinhabib') {
        return false;
      }
      return true;
    });

    if (filtered.length !== users.length) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(filtered));
    }
    return filtered;
  } catch {
    return [];
  }
};

export const getCurrentUser = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.isLoggedIn) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return null;
};

export const registerUser = async (data: {
  fullName: string;
  username: string;
  email: string;
  mobile: string;
  password: string;
}): Promise<{ success: boolean; message: string; user?: UserProfile }> => {
  const users = getStoredUsers();
  const lowerUsername = data.username.toLowerCase().trim();
  const lowerEmail = data.email.toLowerCase().trim();

  // Check unique username
  const existingUser = users.find(
    (u) => u.username.toLowerCase() === lowerUsername
  );
  if (existingUser) {
    return { success: false, message: 'এই Username টি ইতোমধ্যে ব্যবহার করা হয়েছে! দয়া করে অন্য Username দিন।' };
  }

  const existingEmail = users.find((u) => u.email.toLowerCase() === lowerEmail);
  if (existingEmail) {
    return { success: false, message: 'এই Email টি দিয়ে ইতোমধ্যে একাউন্ট খোলা হয়েছে।' };
  }

  const newUser: UserProfile = {
    fullName: data.fullName,
    username: data.username,
    email: data.email,
    mobile: data.mobile,
    isLoggedIn: true,
    registeredAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(newUser));

  // Sync with permanent Google Sheets Apps Script
  try {
    await fetch('/api/auth/sheets-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scriptUrl: PERMANENT_SHEETS_URL,
        action: 'REGISTER',
        data: { ...data, registeredAt: newUser.registeredAt },
      }),
    });
  } catch (e) {
    console.warn('Google Sheets sync warning:', e);
  }

  return { success: true, message: 'সফলভাবে রেজিস্ট্রেশন সম্পূর্ণ হয়েছে!', user: newUser };
};

export const loginUser = async (
  usernameOrEmail: string,
  password: string
): Promise<{ success: boolean; message: string; user?: UserProfile }> => {
  const users = getStoredUsers();
  const query = usernameOrEmail.toLowerCase().trim();

  let user = users.find(
    (u) =>
      u.username.toLowerCase() === query || u.email.toLowerCase() === query
  );

  if (!user) {
    // If user registration didn't exist locally, create a profile for this user upon valid login
    const isEmail = query.includes('@');
    user = {
      fullName: usernameOrEmail,
      username: isEmail ? usernameOrEmail.split('@')[0] : usernameOrEmail,
      email: isEmail ? usernameOrEmail : `${usernameOrEmail}@eduzoon.app`,
      mobile: '',
      isLoggedIn: true,
      registeredAt: new Date().toISOString(),
    };
    users.push(user);
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  }

  const loggedInUser: UserProfile = { ...user, isLoggedIn: true };
  localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(loggedInUser));

  // Sync login with permanent Google Sheets
  try {
    await fetch('/api/auth/sheets-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scriptUrl: PERMANENT_SHEETS_URL,
        action: 'LOGIN',
        data: { usernameOrEmail, password, loginTime: new Date().toISOString() },
      }),
    });
  } catch (e) {
    console.warn('Sheets login sync notice:', e);
  }

  return { success: true, message: 'সফলভাবে লগইন হয়েছে!', user: loggedInUser };
};

export const logoutUser = () => {
  localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
};

export const updateProfile = (updatedData: Partial<UserProfile>): UserProfile | null => {
  const current = getCurrentUser();
  if (!current) return null;
  const updated = { ...current, ...updatedData };
  localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(updated));

  const users = getStoredUsers().map((u) =>
    u.username === current.username ? updated : u
  );
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  return updated;
};


