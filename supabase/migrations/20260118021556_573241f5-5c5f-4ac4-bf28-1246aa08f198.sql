-- Add click_count to blood_requests for tracking statistics
ALTER TABLE public.blood_requests ADD COLUMN IF NOT EXISTS click_count INTEGER NOT NULL DEFAULT 0;

-- Add app_settings for WhatsApp notifications and logo
INSERT INTO public.app_settings (key, value, description) VALUES
  ('whatsapp_notifications_enabled', 'false', 'تفعيل إشعارات واتساب للمتبرعين'),
  ('whatsapp_urgency_filter', 'all', 'فلتر الاستعجال: all, high, urgent'),
  ('whatsapp_blood_type_filter', 'all', 'فلتر فصيلة الدم: all, rare'),
  ('app_logo_url', '', 'رابط شعار التطبيق')
ON CONFLICT (key) DO NOTHING;