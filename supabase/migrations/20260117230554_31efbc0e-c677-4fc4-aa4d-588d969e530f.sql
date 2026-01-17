-- Create blood type enum
CREATE TYPE public.blood_type AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');

-- Create user role enum
CREATE TYPE public.user_role AS ENUM ('donor', 'requester', 'both');

-- Create request status enum
CREATE TYPE public.request_status AS ENUM ('open', 'fulfilled', 'cancelled', 'expired');

-- Create profiles table for users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  blood_type blood_type NOT NULL,
  city TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'donor',
  last_donation_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create blood requests table
CREATE TABLE public.blood_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blood_type blood_type NOT NULL,
  city TEXT NOT NULL,
  hospital_name TEXT NOT NULL,
  units_needed INTEGER NOT NULL DEFAULT 1,
  urgency_level TEXT DEFAULT 'normal',
  notes TEXT,
  status request_status NOT NULL DEFAULT 'open',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create donation logs table
CREATE TABLE public.donation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_id UUID REFERENCES public.blood_requests(id) ON DELETE SET NULL,
  donation_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  related_request_id UUID REFERENCES public.blood_requests(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Blood requests policies (open requests visible to all authenticated users)
CREATE POLICY "Users can view open requests"
  ON public.blood_requests FOR SELECT
  TO authenticated
  USING (status = 'open' OR requester_id = auth.uid());

CREATE POLICY "Requesters can create requests"
  ON public.blood_requests FOR INSERT
  TO authenticated
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Requesters can update their own requests"
  ON public.blood_requests FOR UPDATE
  TO authenticated
  USING (requester_id = auth.uid());

-- Donation logs policies
CREATE POLICY "Users can view their own donations"
  ON public.donation_logs FOR SELECT
  TO authenticated
  USING (donor_id = auth.uid());

CREATE POLICY "Users can create their own donations"
  ON public.donation_logs FOR INSERT
  TO authenticated
  WITH CHECK (donor_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Function to update profile's updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blood_requests_updated_at
  BEFORE UPDATE ON public.blood_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update last_donation_date when donation is logged
CREATE OR REPLACE FUNCTION public.update_last_donation_date()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET last_donation_date = NEW.donation_date
  WHERE id = NEW.donor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_donor_last_donation
  AFTER INSERT ON public.donation_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_last_donation_date();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, blood_type, city, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'مستخدم جديد'),
    COALESCE((NEW.raw_user_meta_data->>'blood_type')::blood_type, 'O+'),
    COALESCE(NEW.raw_user_meta_data->>'city', 'الرياض'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'donor')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();