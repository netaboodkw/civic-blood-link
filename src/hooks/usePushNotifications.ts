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
  const [isRegistering, setIsRegistering] = useState(false);

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

  // Request and register for push notifications
  const requestPushPermission = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      toast.error('الإشعارات متاحة فقط على التطبيق');
      return false;
    }

    setIsRegistering(true);
    
    try {
      // Request permission
      const permStatus = await PushNotifications.requestPermissions();
      console.log('Permission status:', permStatus);
      
      if (permStatus.receive === 'granted') {
        // Register for push notifications
        await PushNotifications.register();
        toast.success('جاري تسجيل الإشعارات...');
        return true;
      } else {
        toast.error('يرجى السماح بالإشعارات من إعدادات الجهاز');
        return false;
      }
    } catch (error) {
      console.error('Error requesting push permission:', error);
      toast.error('حدث خطأ أثناء تفعيل الإشعارات');
      return false;
    } finally {
      setIsRegistering(false);
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

      // Set up listeners first
      PushNotifications.addListener('registration', async (tokenData) => {
        console.log('Push registration success, token: ' + tokenData.value);
        setToken(tokenData.value);
        // Save token locally
        localStorage.setItem(PUSH_TOKEN_KEY, tokenData.value);
        // Try to save to database
        const saved = await savePushToken(tokenData.value);
        if (saved) {
          toast.success('تم تفعيل الإشعارات بنجاح!');
        }
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Error on registration: ' + JSON.stringify(error));
        toast.error('فشل تسجيل الإشعارات: ' + JSON.stringify(error));
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received: ' + JSON.stringify(notification));
        toast(notification.title || 'إشعار جديد', {
          description: notification.body,
        });
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push action performed: ' + JSON.stringify(notification));
      });

      // Check current permission status
      const permStatus = await PushNotifications.checkPermissions();
      console.log('Current permission status:', permStatus);
      
      if (permStatus.receive === 'granted') {
        // Already have permission, register
        await PushNotifications.register();
      }
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
      if (event === 'SIGNED_IN' && session?.user) {
        const storedToken = localStorage.getItem(PUSH_TOKEN_KEY);
        if (storedToken) {
          console.log('User signed in, saving stored push token...');
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

  return { token, isSupported, isRegistering, savePushToken, requestPushPermission };
}
