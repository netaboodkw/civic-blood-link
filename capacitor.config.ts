import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nabdatdam.app',
  appName: 'نبضة دم',
  webDir: 'dist',
  server: {
    url: 'https://d1a4b3ac-ab70-4986-9cbf-7e3557c7fe51.lovableproject.com?forceHideBadge=true',
    cleartext: true,
    allowNavigation: ['*.lovableproject.com', '*.lovable.app']
  },
  ios: {
    contentInset: 'automatic'
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
