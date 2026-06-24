import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useSettings } from '@/features/settings/api/use-settings';
import { useTheme } from './theme-provider';
import { hexToHsl, getContrastHslForHex } from '@/lib/color-utils';
import { useAuth } from './auth-provider';

interface AppearanceContextData {
  logoUrl: string | null;
}

const AppearanceContext = createContext<AppearanceContextData>({
  logoUrl: null,
});

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  // We use useSettings, but only enable the query if the user is authenticated
  // to avoid 401 errors on the login screen for multi-tenant apps.
  const { data: settings } = useSettings(undefined, { enabled: isAuthenticated });
  
  const { setTheme } = useTheme();

  // Find individual settings (with fallback to localStorage for unauthenticated state)
  const themeSetting = settings?.find((s) => s.key === 'theme')?.value;
  
  const primaryColorSetting = settings?.find((s) => s.key === 'primary_color')?.value 
    || localStorage.getItem('leadforge-primary-color');
    
  const logoUrlSetting = settings?.find((s) => s.key === 'logo_url')?.value 
    || localStorage.getItem('leadforge-logo-url');

  // Cache settings to localStorage when loaded from API
  useEffect(() => {
    const apiPrimary = settings?.find((s) => s.key === 'primary_color')?.value;
    const apiLogo = settings?.find((s) => s.key === 'logo_url')?.value;
    
    if (apiPrimary) localStorage.setItem('leadforge-primary-color', apiPrimary);
    if (apiLogo) localStorage.setItem('leadforge-logo-url', apiLogo);
  }, [settings]);

  // 1. Sync Theme
  useEffect(() => {
    if (themeSetting && ['light', 'dark', 'system'].includes(themeSetting)) {
      setTheme(themeSetting as any);
    }
  }, [themeSetting, setTheme]);

  // 2. Inject Primary Color
  useEffect(() => {
    const root = document.documentElement;
    if (primaryColorSetting && /^#[0-9A-F]{6}$/i.test(primaryColorSetting)) {
      const hsl = hexToHsl(primaryColorSetting);
      const foregroundHsl = getContrastHslForHex(primaryColorSetting);
      
      root.style.setProperty('--primary', hsl);
      root.style.setProperty('--primary-foreground', foregroundHsl);
    } else {
      // Revert to defaults if setting goes missing (optional, but good practice)
      root.style.removeProperty('--primary');
      root.style.removeProperty('--primary-foreground');
    }
  }, [primaryColorSetting]);

  // 3. Expose Logo URL
  const value = useMemo(() => {
    return {
      logoUrl: logoUrlSetting || null,
    };
  }, [logoUrlSetting]);

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
}

export const useAppearance = () => {
  return useContext(AppearanceContext);
};
