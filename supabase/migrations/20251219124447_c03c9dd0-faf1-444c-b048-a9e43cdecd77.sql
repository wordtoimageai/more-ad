-- Add share_token column to ad_history for shareable links
ALTER TABLE public.ad_history 
ADD COLUMN share_token TEXT UNIQUE DEFAULT NULL;

-- Create index for faster lookups by share_token
CREATE INDEX idx_ad_history_share_token ON public.ad_history(share_token) WHERE share_token IS NOT NULL;

-- Create policy to allow anyone to view shared ads (public access)
CREATE POLICY "Anyone can view shared ads" 
ON public.ad_history 
FOR SELECT 
USING (share_token IS NOT NULL);