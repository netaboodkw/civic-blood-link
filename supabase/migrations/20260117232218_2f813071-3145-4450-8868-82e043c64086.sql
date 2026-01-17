-- Add patient_name and file_number columns to blood_requests table
ALTER TABLE public.blood_requests 
ADD COLUMN patient_name TEXT,
ADD COLUMN file_number TEXT;