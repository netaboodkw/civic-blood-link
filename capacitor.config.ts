import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d1a4b3acab7049869cbf7e3557c7fe51',
  appName: 'نبضة دم',
  webDir: 'dist',
  server: {
    url: 'https://d1a4b3ac-ab70-4986-9cbf-7e3557c7fe51.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
