-- Create a policy that allows anyone to update only the click_count field
CREATE POLICY "Anyone can increment click count"
ON public.blood_requests
FOR UPDATE
USING (status = 'open'::request_status)
WITH CHECK (status = 'open'::request_status);

-- Create a function to safely increment click count
CREATE OR REPLACE FUNCTION public.increment_click_count(request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE blood_requests 
  SET click_count = click_count + 1 
  WHERE id = request_id AND status = 'open';
END;
$$;