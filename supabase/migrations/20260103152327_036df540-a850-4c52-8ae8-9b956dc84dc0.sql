-- Professional Feed System for Wellness Genius

-- Enum for post types
CREATE TYPE public.feed_post_type AS ENUM ('user_post', 'shared_article', 'system_article', 'blog_post');

-- Enum for moderation status
CREATE TYPE public.moderation_status AS ENUM ('pending', 'approved', 'flagged', 'hidden', 'removed');

-- Professional scores table
CREATE TABLE public.professional_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  score integer NOT NULL DEFAULT 40 CHECK (score >= 0 AND score <= 100),
  profile_photo_added boolean NOT NULL DEFAULT false,
  linkedin_url_added boolean NOT NULL DEFAULT false,
  role text,
  organisation text,
  linkedin_url text,
  total_posts integer NOT NULL DEFAULT 0,
  total_comments integer NOT NULL DEFAULT 0,
  total_likes_received integer NOT NULL DEFAULT 0,
  total_helpful_marks integer NOT NULL DEFAULT 0,
  weeks_without_reports integer NOT NULL DEFAULT 0,
  last_activity_at timestamp with time zone,
  last_moderation_action_at timestamp with time zone,
  posting_suspended_until timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Feed posts table
CREATE TABLE public.feed_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid, -- NULL for system posts
  post_type feed_post_type NOT NULL DEFAULT 'user_post',
  content text NOT NULL,
  link_url text,
  link_summary text, -- Required for shared articles
  source_article_id uuid, -- Reference to articles table for system posts
  source_blog_id uuid, -- Reference to blog_posts for blog posts
  moderation_status moderation_status NOT NULL DEFAULT 'approved',
  is_featured boolean NOT NULL DEFAULT false,
  like_count integer NOT NULL DEFAULT 0,
  comment_count integer NOT NULL DEFAULT 0,
  quality_score integer NOT NULL DEFAULT 0,
  tags text[] DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Feed comments table
CREATE TABLE public.feed_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  parent_comment_id uuid REFERENCES public.feed_comments(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) <= 600),
  like_count integer NOT NULL DEFAULT 0,
  is_helpful boolean NOT NULL DEFAULT false,
  moderation_status moderation_status NOT NULL DEFAULT 'approved',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Feed likes table
CREATE TABLE public.feed_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  post_id uuid REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES public.feed_comments(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT like_target_check CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  ),
  UNIQUE (user_id, post_id),
  UNIQUE (user_id, comment_id)
);

-- Feed reports table
CREATE TABLE public.feed_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  post_id uuid REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES public.feed_comments(id) ON DELETE CASCADE,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'upheld', 'dismissed')),
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT report_target_check CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- Score change log for audit trail
CREATE TABLE public.professional_score_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  change_amount integer NOT NULL,
  reason text NOT NULL,
  related_post_id uuid,
  related_comment_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.professional_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_score_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for professional_scores
CREATE POLICY "Users can view their own score" ON public.professional_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile fields" ON public.professional_scores
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own score" ON public.professional_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all scores" ON public.professional_scores
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all scores" ON public.professional_scores
  FOR UPDATE USING (is_admin());

-- Public read for leaderboard data (limited fields)
CREATE POLICY "Public can view opted-in profile data" ON public.professional_scores
  FOR SELECT USING (true);

-- RLS Policies for feed_posts
CREATE POLICY "Anyone can view approved posts" ON public.feed_posts
  FOR SELECT USING (moderation_status = 'approved');

CREATE POLICY "Authors can view their own posts" ON public.feed_posts
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Users can create posts" ON public.feed_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own posts" ON public.feed_posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own posts" ON public.feed_posts
  FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all posts" ON public.feed_posts
  FOR ALL USING (is_admin());

-- RLS Policies for feed_comments
CREATE POLICY "Anyone can view approved comments" ON public.feed_comments
  FOR SELECT USING (moderation_status = 'approved');

CREATE POLICY "Authors can view their own comments" ON public.feed_comments
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Users can create comments" ON public.feed_comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own comments" ON public.feed_comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own comments" ON public.feed_comments
  FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all comments" ON public.feed_comments
  FOR ALL USING (is_admin());

-- RLS Policies for feed_likes
CREATE POLICY "Anyone can view likes" ON public.feed_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own likes" ON public.feed_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON public.feed_likes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for feed_reports
CREATE POLICY "Users can create reports" ON public.feed_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports" ON public.feed_reports
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can manage all reports" ON public.feed_reports
  FOR ALL USING (is_admin());

-- RLS Policies for professional_score_log
CREATE POLICY "Users can view their own score log" ON public.professional_score_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all score logs" ON public.professional_score_log
  FOR SELECT USING (is_admin());

CREATE POLICY "Service role can insert score logs" ON public.professional_score_log
  FOR INSERT WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_feed_posts_author ON public.feed_posts(author_id);
CREATE INDEX idx_feed_posts_created ON public.feed_posts(created_at DESC);
CREATE INDEX idx_feed_posts_quality ON public.feed_posts(quality_score DESC);
CREATE INDEX idx_feed_posts_type ON public.feed_posts(post_type);
CREATE INDEX idx_feed_comments_post ON public.feed_comments(post_id);
CREATE INDEX idx_feed_likes_post ON public.feed_likes(post_id);
CREATE INDEX idx_feed_likes_user ON public.feed_likes(user_id);
CREATE INDEX idx_professional_scores_score ON public.professional_scores(score DESC);

-- Function to get rate limits based on score
CREATE OR REPLACE FUNCTION public.get_user_rate_limits(p_user_id uuid)
RETURNS TABLE(posts_per_day integer, comments_per_day integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN ps.score >= 80 THEN 6
      WHEN ps.score >= 60 THEN 4
      WHEN ps.score >= 40 THEN 2
      ELSE 1
    END as posts_per_day,
    CASE 
      WHEN ps.score >= 80 THEN 30
      WHEN ps.score >= 60 THEN 15
      WHEN ps.score >= 40 THEN 6
      ELSE 3
    END as comments_per_day
  FROM public.professional_scores ps
  WHERE ps.user_id = p_user_id
  UNION ALL
  SELECT 1, 3 WHERE NOT EXISTS (
    SELECT 1 FROM public.professional_scores WHERE user_id = p_user_id
  )
$$;

-- Function to check if user can post
CREATE OR REPLACE FUNCTION public.can_user_post(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COALESCE(
      (
        SELECT 
          (SELECT COUNT(*) FROM public.feed_posts 
           WHERE author_id = p_user_id 
           AND created_at > now() - interval '24 hours'
          ) < (SELECT posts_per_day FROM public.get_user_rate_limits(p_user_id))
          AND (ps.posting_suspended_until IS NULL OR ps.posting_suspended_until < now())
        FROM public.professional_scores ps
        WHERE ps.user_id = p_user_id
      ),
      true
    )
$$;

-- Function to check if user can comment
CREATE OR REPLACE FUNCTION public.can_user_comment(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COALESCE(
      (
        SELECT 
          (SELECT COUNT(*) FROM public.feed_comments 
           WHERE author_id = p_user_id 
           AND created_at > now() - interval '24 hours'
          ) < (SELECT comments_per_day FROM public.get_user_rate_limits(p_user_id))
          AND (ps.posting_suspended_until IS NULL OR ps.posting_suspended_until < now())
        FROM public.professional_scores ps
        WHERE ps.user_id = p_user_id
      ),
      true
    )
$$;

-- Trigger to update post counts
CREATE OR REPLACE FUNCTION public.update_post_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update like count on post
    IF NEW.post_id IS NOT NULL THEN
      UPDATE public.feed_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    END IF;
    -- Update like count on comment
    IF NEW.comment_id IS NOT NULL THEN
      UPDATE public.feed_comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.post_id IS NOT NULL THEN
      UPDATE public.feed_posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
    END IF;
    IF OLD.comment_id IS NOT NULL THEN
      UPDATE public.feed_comments SET like_count = like_count - 1 WHERE id = OLD.comment_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_like_counts
AFTER INSERT OR DELETE ON public.feed_likes
FOR EACH ROW EXECUTE FUNCTION public.update_post_counts();

-- Trigger to update comment counts on posts
CREATE OR REPLACE FUNCTION public.update_comment_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.feed_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.feed_posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_comment_counts
AFTER INSERT OR DELETE ON public.feed_comments
FOR EACH ROW EXECUTE FUNCTION public.update_comment_counts();

-- Updated_at triggers
CREATE TRIGGER update_professional_scores_updated_at
BEFORE UPDATE ON public.professional_scores
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feed_posts_updated_at
BEFORE UPDATE ON public.feed_posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feed_comments_updated_at
BEFORE UPDATE ON public.feed_comments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();