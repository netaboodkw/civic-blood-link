import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function usePushNotifications() {
  const [token, setToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  // Save push token to user profile
  const savePushToken = async (pushToken: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user logged in, cannot save push token');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ push_token: pushToken } as any)
        .eq('id', user.id);

      if (error) {
        console.error('Error saving push token:', error);
      } else {
        console.log('Push token saved successfully');
      }
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  };

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
        // Save the token to the database
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
  }, []);

  return { token, isSupported };
}
