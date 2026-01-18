-- Add comprehensive notification settings
INSERT INTO app_settings (key, value, description) VALUES
  ('notification_eligibility_end_enabled', 'true', 'إشعار عند انتهاء فترة عدم التبرع'),
  ('notification_eligibility_end_text', 'أهلاً {name}! لقد انتهت فترة الانتظار ويمكنك التبرع بالدم الآن. تبرعك ينقذ حياة! 💉❤️', 'نص إشعار انتهاء فترة التبرع'),
  ('notification_emergency_enabled', 'true', 'إشعار عند وجود حالة طارئة'),
  ('notification_emergency_text', 'حالة طارئة! يوجد طلب عاجل لفصيلة {blood_type} في {city}. ساعد في إنقاذ حياة! 🚨', 'نص إشعار الحالات الطارئة'),
  ('notification_periodic_enabled', 'false', 'إشعارات دورية للحالات العادية'),
  ('notification_periodic_text', 'هناك {count} طلبات تبرع بالدم تنتظر مساعدتك في {city}. كن بطلاً اليوم! 💪', 'نص الإشعارات الدورية'),
  ('notification_periodic_hours', '24', 'الفترة بالساعات بين الإشعارات الدورية'),
  ('notification_channels', 'in_app', 'قنوات الإشعارات: in_app, whatsapp, both')
ON CONFLICT (key) DO NOTHING;