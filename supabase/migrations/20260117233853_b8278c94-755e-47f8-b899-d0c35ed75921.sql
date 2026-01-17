-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Users can view open requests" ON public.blood_requests;

-- Create new policy that allows everyone to view open requests (for public page)
CREATE POLICY "Anyone can view open requests" 
ON public.blood_requests 
FOR SELECT 
USING (status = 'open' OR requester_id = auth.uid());