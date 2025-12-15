-- Allow anyone to update their own subscription status (for unsubscribe)
CREATE POLICY "Anyone can unsubscribe" 
ON public.newsletter_subscribers 
FOR UPDATE 
USING (true)
WITH CHECK (true);