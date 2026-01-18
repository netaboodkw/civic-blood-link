-- Add archive settings for each urgency level
INSERT INTO public.app_settings (key, value, description) VALUES
  ('archive_days_urgent', '3', 'عدد أيام أرشفة الطلبات العاجلة'),
  ('archive_days_high', '5', 'عدد أيام أرشفة الطلبات المستعجلة'),
  ('archive_days_normal', '7', 'عدد أيام أرشفة الطلبات العادية'),
  ('auto_archive_enabled', 'true', 'تفعيل الأرشفة التلقائية')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description;