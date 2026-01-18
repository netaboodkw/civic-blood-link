import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Store token locally to persist across auth state changes
const PUSH_TOKEN_KEY = 'nabdat_push_token';

export function usePushNotifications() {
  const [token, setToken] = useState<string | null>(() => {
    // Try to get token from localStorage on init
    if (typeof window !== 'undefined') {
      return localStorage.getItem(PUSH_TOKEN_KEY);
    }
    return null;
  });
  const [isSupported, setIsSupported] = useState(false);

  // Save push token to user profile
  const savePushToken = useCallback(async (pushToken: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user logged in, token saved locally for later');
        return false;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ push_token: pushToken } as any)
        .eq('id', user.id);

      if (error) {
        console.error('Error saving push token:', error);
        return false;
      } else {
        console.log('Push token saved successfully for user:', user.id);
        return true;
      }
    } catch (error) {
      console.error('Error saving push token:', error);
      return false;
    }
  }, []);

  // Initialize push notifications
  useEffect(() => {
    const initPushNotifications = async () => {
      // Check if running on native platform
      if (!Capacitor.isNativePlatform()) {
        console.log('Push notifications only work on native platforms');
        return;
      }

      setIsSupported(true);

      // Request permission
      const permStatus = await PushNotifications.requestPermissions();
      
      if (permStatus.receive === 'granted') {
        // Register for push notifications
        await PushNotifications.register();
      } else {
        console.log('Push notification permission denied');
        return;
      }

      // Listen for registration success
      PushNotifications.addListener('registration', async (tokenData) => {
        console.log('Push registration success, token: ' + tokenData.value);
        setToken(tokenData.value);
        // Save token locally
        localStorage.setItem(PUSH_TOKEN_KEY, tokenData.value);
        // Try to save to database
        await savePushToken(tokenData.value);
      });

      // Listen for registration errors
      PushNotifications.addListener('registrationError', (error) => {
        console.error('Error on registration: ' + JSON.stringify(error));
      });

      // Listen for push notifications received
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received: ' + JSON.stringify(notification));
        toast(notification.title || 'إشعار جديد', {
          description: notification.body,
        });
      });

      // Listen for push notification action performed
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push action performed: ' + JSON.stringify(notification));
        // Handle notification tap - navigate to relevant screen
      });
    };

    initPushNotifications();

    return () => {
      if (Capacitor.isNativePlatform()) {
        PushNotifications.removeAllListeners();
      }
    };
  }, [savePushToken]);

  // Listen for auth state changes to save token when user logs in
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // When user signs in, save the push token if we have one
      if (event === 'SIGNED_IN' && session?.user) {
        const storedToken = localStorage.getItem(PUSH_TOKEN_KEY);
        if (storedToken) {
          console.log('User signed in, saving stored push token...');
          // Use setTimeout to avoid deadlock with Supabase auth
          setTimeout(() => {
            savePushToken(storedToken);
          }, 0);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [savePushToken]);

  return { token, isSupported, savePushToken };
}
