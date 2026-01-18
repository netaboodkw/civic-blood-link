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
    console.log('🔔 [PUSH] requestPushPermission called');
    console.log('🔔 [PUSH] Is native:', Capacitor.isNativePlatform());
    
    if (!Capacitor.isNativePlatform()) {
      toast.error('الإشعارات متاحة فقط على التطبيق');
      return false;
    }

    setIsRegistering(true);
    
    try {
      // Request permission
      console.log('🔔 [PUSH] Requesting permissions...');
      const permStatus = await PushNotifications.requestPermissions();
      console.log('🔔 [PUSH] Permission result:', JSON.stringify(permStatus));
      
      if (permStatus.receive === 'granted') {
        // Register for push notifications
        console.log('🔔 [PUSH] Permission granted, calling register()...');
        await PushNotifications.register();
        console.log('🔔 [PUSH] register() called successfully');
        toast.success('جاري تسجيل الإشعارات...');
        return true;
      } else {
        console.log('🔔 [PUSH] Permission denied:', permStatus.receive);
        toast.error('يرجى السماح بالإشعارات من إعدادات الجهاز');
        return false;
      }
    } catch (error) {
      console.error('🔔 [PUSH] Error requesting permission:', error);
      toast.error('حدث خطأ أثناء تفعيل الإشعارات');
      return false;
    } finally {
      setIsRegistering(false);
    }
  }, []);

  // Initialize push notifications
  useEffect(() => {
    const initPushNotifications = async () => {
      console.log('🔔 [PUSH] Initializing push notifications...');
      console.log('🔔 [PUSH] Is native platform:', Capacitor.isNativePlatform());
      console.log('🔔 [PUSH] Platform:', Capacitor.getPlatform());
      
      // Check if running on native platform
      if (!Capacitor.isNativePlatform()) {
        console.log('🔔 [PUSH] Not on native platform, skipping');
        return;
      }

      setIsSupported(true);
      console.log('🔔 [PUSH] Push is supported, setting up listeners...');

      // Set up listeners first
      PushNotifications.addListener('registration', async (tokenData) => {
        console.log('🔔 [PUSH] ✅ Registration SUCCESS!');
        console.log('🔔 [PUSH] Token received:', tokenData.value);
        console.log('🔔 [PUSH] Token length:', tokenData.value?.length);
        
        setToken(tokenData.value);
        // Save token locally
        localStorage.setItem(PUSH_TOKEN_KEY, tokenData.value);
        console.log('🔔 [PUSH] Token saved to localStorage');
        
        // Try to save to database
        console.log('🔔 [PUSH] Attempting to save to database...');
        const saved = await savePushToken(tokenData.value);
        console.log('🔔 [PUSH] Save to database result:', saved);
        
        if (saved) {
          toast.success('تم تفعيل الإشعارات بنجاح!');
        } else {
          toast.info('تم الحصول على التوكن، سيتم حفظه عند تسجيل الدخول');
        }
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('🔔 [PUSH] ❌ Registration ERROR:', JSON.stringify(error));
        toast.error('فشل تسجيل الإشعارات: ' + (error.error || JSON.stringify(error)));
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('🔔 [PUSH] Notification received:', JSON.stringify(notification));
        toast(notification.title || 'إشعار جديد', {
          description: notification.body,
        });
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('🔔 [PUSH] Action performed:', JSON.stringify(notification));
      });

      // Check current permission status
      console.log('🔔 [PUSH] Checking current permissions...');
      const permStatus = await PushNotifications.checkPermissions();
      console.log('🔔 [PUSH] Permission status:', JSON.stringify(permStatus));
      
      if (permStatus.receive === 'granted') {
        console.log('🔔 [PUSH] Permission already granted, registering...');
        await PushNotifications.register();
        console.log('🔔 [PUSH] Register called');
      } else {
        console.log('🔔 [PUSH] Permission not granted yet');
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
