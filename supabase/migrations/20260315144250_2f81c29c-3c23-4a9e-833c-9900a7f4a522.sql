
-- Fix intentional public INSERT policies to be more explicit
-- Comments: Only allow inserts with non-empty required fields
DROP POLICY IF EXISTS "Anyone can add comments" ON public.comments;
CREATE POLICY "Anyone can add comments" ON public.comments
  FOR INSERT WITH CHECK (
    length(trim(name)) > 0 AND
    length(trim(email)) > 0 AND
    length(trim(content)) > 0
  );

-- Contact messages: Only allow inserts with non-empty required fields
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages
  FOR INSERT WITH CHECK (
    length(trim(name)) > 0 AND
    length(trim(email)) > 0 AND
    length(trim(message)) > 0
  );
