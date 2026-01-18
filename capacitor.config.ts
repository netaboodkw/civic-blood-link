import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nabdatdam.app',
  appName: 'نبضة دم',
  webDir: 'dist',
  server: {
    url: 'https://civic-blood-link.lovable.app',
    cleartext: true,
    allowNavigation: ['*.lovable.app', '*.supabase.co']
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#f5f7fa',
    scrollEnabled: true,
    allowsLinkPreview: false
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
