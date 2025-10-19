import React, { createContext, useContext, useEffect, useState } from 'react';

type ProfileData = {
  name: string;
  email: string;
  phone: string;
  barNumber: string;
  firm: string;
  address: string;
  bio: string;
};

type Notifications = {
  emailAlerts: boolean;
  smsAlerts: boolean;
  pushNotifications: boolean;
  hearingReminders: boolean;
  clientUpdates: boolean;
  billingAlerts: boolean;
  weeklyReports: boolean;
};

type Preferences = {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  currency: 'INR' | 'USD';
};

type Security = {
  twoFactorEnabled: boolean;
  sessionTimeout: string;
  loginNotifications: boolean;
};

type SettingsContextType = {
  profileData: ProfileData;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>;
  notifications: Notifications;
  setNotifications: React.Dispatch<React.SetStateAction<Notifications>>;
  preferences: Preferences;
  setPreferences: React.Dispatch<React.SetStateAction<Preferences>>;
  security: Security;
  setSecurity: React.Dispatch<React.SetStateAction<Security>>;
};

const DEFAULTS = {
  profileData: {
    name: '',
    email: '',
    phone: '+91 98765 43210',
    barNumber: '',
    firm: '',
    address: '',
    bio: ''
  } as ProfileData,
  notifications: {
    emailAlerts: true,
    smsAlerts: true,
    pushNotifications: true,
    hearingReminders: true,
    clientUpdates: true,
    billingAlerts: false,
    weeklyReports: true
  } as Notifications,
  preferences: {
    theme: 'light',
    language: 'en-IN',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    currency: 'INR'
  } as Preferences,
  security: {
    twoFactorEnabled: false,
    sessionTimeout: '30',
    loginNotifications: true
  } as Security,
};

const STORAGE_KEY = 'legal_pro_settings_v1';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profileData, setProfileData] = useState<ProfileData>(DEFAULTS.profileData);
  const [notifications, setNotifications] = useState<Notifications>(DEFAULTS.notifications);
  const [preferences, setPreferences] = useState<Preferences>(DEFAULTS.preferences);
  const [security, setSecurity] = useState<Security>(DEFAULTS.security);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.profileData) setProfileData(parsed.profileData);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.preferences) setPreferences(parsed.preferences);
        if (parsed.security) setSecurity(parsed.security);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const payload = { profileData, notifications, preferences, security };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  }, [profileData, notifications, preferences, security]);

  return (
    <SettingsContext.Provider value={{ profileData, setProfileData, notifications, setNotifications, preferences, setPreferences, security, setSecurity }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};


