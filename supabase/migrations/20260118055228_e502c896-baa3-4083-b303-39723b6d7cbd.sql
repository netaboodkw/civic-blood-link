-- Add push_token column to profiles table for iOS push notifications
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS push_token text;

-- Add index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_profiles_push_token ON public.profiles(push_token) WHERE push_token IS NOT NULL;