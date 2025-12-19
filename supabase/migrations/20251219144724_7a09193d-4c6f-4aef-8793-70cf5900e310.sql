-- Add UPDATE policy for ad_history table so users can update their own ads (e.g., to add share_token)
CREATE POLICY "Users can update their own ads" 
ON public.ad_history 
FOR UPDATE 
USING (auth.uid() = user_id);