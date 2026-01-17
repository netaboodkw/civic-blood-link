-- Update default city to Kuwait City in handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, blood_type, city, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'مستخدم جديد'),
    COALESCE((NEW.raw_user_meta_data->>'blood_type')::blood_type, 'O+'),
    COALESCE(NEW.raw_user_meta_data->>'city', 'مدينة الكويت'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'donor')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;