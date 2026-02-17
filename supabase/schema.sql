-- RapidReach Supabase Schema
-- World-Class DevOps & Cloud Native Blog Platform
-- Created: February 8, 2026
-- Updated: February 8, 2026 - Added authentication, admin features, engagement metrics

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For password hashing

-- =====================================================
-- ENUMS
-- =====================================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('reader', 'contributor', 'editor', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE post_status AS ENUM ('draft', 'pending', 'published', 'archived', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE content_difficulty AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE news_category AS ENUM ('kubernetes', 'terraform', 'aws', 'azure', 'gcp', 'cicd', 'security', 'observability', 'platform-engineering', 'docker', 'monitoring');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE comment_status AS ENUM ('pending', 'approved', 'rejected', 'flagged');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('new_comment', 'new_post', 'post_approved', 'post_rejected', 'comment_approved', 'user_approved', 'new_follower');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- CORE TABLES
-- =====================================================

-- User Profiles (Enhanced with authentication and admin features)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT, -- For custom auth (optional if using Supabase Auth)
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    role user_role DEFAULT 'reader',
    
    -- Social Links
    github_handle TEXT,
    twitter_handle TEXT,
    linkedin_url TEXT,
    website_url TEXT,
    company TEXT,
    job_title TEXT,
    
    -- Personalization & Analytics
    preferred_topics TEXT[] DEFAULT '{}',
    skill_level content_difficulty DEFAULT 'beginner',
    learning_streak INTEGER DEFAULT 0,
    total_reading_time INTEGER DEFAULT 0, -- in minutes
    bookmarked_posts UUID[] DEFAULT '{}',
    completed_learning_paths UUID[] DEFAULT '{}',
    
    -- Gamification & Stats
    reputation_score INTEGER DEFAULT 0,
    badges JSONB DEFAULT '[]',
    posts_written INTEGER DEFAULT 0,
    comments_posted INTEGER DEFAULT 0,
    total_views_received INTEGER DEFAULT 0,
    total_likes_received INTEGER DEFAULT 0,
    
    -- Account Status
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    last_active_at TIMESTAMPTZ,
    
    -- Notification Preferences
    email_notifications BOOLEAN DEFAULT true,
    comment_notifications BOOLEAN DEFAULT true,
    newsletter_subscribed BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Posts (Enhanced with approval workflow and engagement)
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL, -- Markdown content
    cover_image_url TEXT,
    author_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    
    -- Content Classification
    category news_category NOT NULL,
    tags TEXT[] DEFAULT '{}',
    difficulty content_difficulty DEFAULT 'intermediate',
    estimated_read_time INTEGER, -- in minutes (calculated as: word_count / 200)
    word_count INTEGER DEFAULT 0,
    character_count INTEGER DEFAULT 0,
    
    -- SEO & Social
    meta_title TEXT,
    meta_description TEXT,
    og_image_url TEXT,
    canonical_url TEXT,
    
    -- Publishing & Approval Workflow
    status post_status DEFAULT 'draft',
    submitted_at TIMESTAMPTZ, -- When submitted for approval
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES user_profiles(id),
    rejected_at TIMESTAMPTZ,
    rejected_by UUID REFERENCES user_profiles(id),
    rejection_reason TEXT,
    published_at TIMESTAMPTZ,
    featured BOOLEAN DEFAULT FALSE,
    trending BOOLEAN DEFAULT FALSE,
    pinned BOOLEAN DEFAULT FALSE,
    
    -- Engagement Metrics
    view_count INTEGER DEFAULT 0,
    unique_view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    bookmark_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    avg_reading_time INTEGER DEFAULT 0, -- Average time users spend reading
    completion_rate DECIMAL DEFAULT 0, -- Percentage of users who read to the end
    
    -- Interactive Features
    code_snippets JSONB DEFAULT '[]', -- Array of {language, code, title}
    interactive_demos JSONB DEFAULT '[]', -- Links to sandboxes
    related_posts UUID[] DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_viewed_at TIMESTAMPTZ
);

-- Create indexes for posts
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_trending ON posts(trending) WHERE trending = true;
CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);

-- Live Infrastructure News Feed
CREATE TABLE IF NOT EXISTS news_feed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    url TEXT,
    source TEXT NOT NULL, -- e.g., 'kubernetes', 'terraform', 'aws'
    category news_category NOT NULL,
    
    -- Content
    release_version TEXT, -- e.g., 'K8s 1.30', 'Terraform 1.7.0'
    severity TEXT, -- 'info', 'important', 'critical'
    changelog_url TEXT,
    announcement_date TIMESTAMPTZ DEFAULT NOW(),
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    image_url TEXT,
    is_breaking BOOLEAN DEFAULT FALSE,
    
    -- Engagement
    upvote_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning Paths
CREATE TABLE IF NOT EXISTS learning_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    cover_image_url TEXT,
    
    -- Path Details
    difficulty content_difficulty NOT NULL,
    estimated_duration INTEGER, -- in hours
    category news_category NOT NULL,
    
    -- Curriculum
    modules JSONB NOT NULL, -- Array of {title, description, post_ids: [], order}
    prerequisites TEXT[] DEFAULT '{}',
    learning_outcomes TEXT[] DEFAULT '{}',
    
    -- Creator
    created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    
    -- Metrics
    enrollment_count INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    
    -- Status
    is_published BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Learning Path Progress
CREATE TABLE IF NOT EXISTS learning_path_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
    
    completed_modules INTEGER[] DEFAULT '{}', -- Array of module indices
    current_module INTEGER DEFAULT 0,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    UNIQUE(user_id, learning_path_id)
);

-- Comments (Enhanced with moderation and nested replies)
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    
    content TEXT NOT NULL,
    
    -- Moderation
    status comment_status DEFAULT 'pending',
    is_flagged BOOLEAN DEFAULT FALSE,
    flag_count INTEGER DEFAULT 0,
    flag_reasons TEXT[] DEFAULT '{}',
    moderated_at TIMESTAMPTZ,
    moderated_by UUID REFERENCES user_profiles(id),
    moderation_notes TEXT,
    
    -- Engagement
    like_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMPTZ,
    
    -- Spam Detection
    is_spam BOOLEAN DEFAULT FALSE,
    spam_score DECIMAL(3,2) DEFAULT 0.00,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for comments
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_flagged ON comments(is_flagged) WHERE is_flagged = true;
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- Post Reactions (Likes, Bookmarks)
CREATE TABLE IF NOT EXISTS post_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL, -- 'like', 'bookmark', 'share'
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, post_id, reaction_type)
);

-- Infrastructure Topology Data (Category-Defining Feature #1)
CREATE TABLE IF NOT EXISTS infrastructure_topologies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    
    -- Topology Data
    topology_data JSONB NOT NULL, -- Nodes, edges, clusters for visualization
    cloud_provider TEXT, -- 'aws', 'gcp', 'azure', 'multi-cloud'
    tools_used TEXT[] DEFAULT '{}', -- ['kubernetes', 'terraform', 'istio']
    
    -- Metadata
    is_interactive BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incident Timelines (Category-Defining Feature #3)
CREATE TABLE IF NOT EXISTS incident_timelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    
    -- Incident Details
    severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
    status TEXT DEFAULT 'ongoing', -- 'ongoing', 'resolved', 'postmortem'
    affected_services TEXT[] DEFAULT '{}',
    
    -- Timeline Events
    events JSONB NOT NULL, -- Array of {timestamp, title, description, author_id, event_type}
    
    -- Collaboration
    contributors UUID[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Resolution
    root_cause TEXT,
    resolution_summary TEXT,
    lessons_learned TEXT[] DEFAULT '{}',
    
    started_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter Subscriptions
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    is_active BOOLEAN DEFAULT TRUE,
    preferred_frequency TEXT DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly'
    topics TEXT[] DEFAULT '{}',
    
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ
);

-- User Activity Log (for analytics)
CREATE TABLE IF NOT EXISTS user_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'view', 'like', 'comment', 'share', 'bookmark'
    resource_type TEXT NOT NULL, -- 'post', 'comment', 'user'
    resource_id UUID NOT NULL,
    
    -- Additional context
    metadata JSONB DEFAULT '{}', -- reading_time, scroll_depth, etc.
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for user activity
CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_resource ON user_activity(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at DESC);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    
    -- Related entities
    related_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    related_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    related_user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Admin Activity Log
CREATE TABLE IF NOT EXISTS admin_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- 'approve_post', 'reject_post', 'ban_user', 'delete_comment', etc.
    
    resource_type TEXT NOT NULL, -- 'post', 'user', 'comment'
    resource_id UUID NOT NULL,
    
    details JSONB DEFAULT '{}',
    ip_address INET,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for admin activity
CREATE INDEX IF NOT EXISTS idx_admin_activity_admin ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_resource ON admin_activity_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_created_at ON admin_activity_log(created_at DESC);

-- Analytics Summary (for dashboard)
CREATE TABLE IF NOT EXISTS analytics_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    
    -- Daily metrics
    total_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    total_posts_published INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    total_signups INTEGER DEFAULT 0,
    
    -- Engagement
    total_likes INTEGER DEFAULT 0,
    total_shares INTEGER DEFAULT 0,
    total_bookmarks INTEGER DEFAULT 0,
    
    -- Top content
    top_posts JSONB DEFAULT '[]', -- Array of {post_id, views, engagement}
    top_authors JSONB DEFAULT '[]',
    
    -- Traffic sources
    traffic_sources JSONB DEFAULT '{}', -- {direct: 1000, google: 500, social: 300}
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for analytics
CREATE INDEX IF NOT EXISTS idx_analytics_summary_date ON analytics_summary(date DESC);

-- =====================================================
-- INDEXES FOR PERFORMANCE (Updated)
-- =====================================================

-- User Profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON user_profiles(is_active) WHERE is_active = true;

-- Posts (already created above, keeping for reference)
-- CREATE INDEX idx_posts_slug ON posts(slug);
-- CREATE INDEX idx_posts_author ON posts(author_id);
-- CREATE INDEX idx_posts_status ON posts(status);
-- CREATE INDEX idx_posts_category ON posts(category);
-- CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
-- CREATE INDEX idx_posts_trending ON posts(trending) WHERE trending = true;
-- CREATE INDEX idx_posts_featured ON posts(featured) WHERE featured = true;
-- CREATE INDEX idx_posts_tags ON posts USING gin(tags);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_posts_search ON posts USING GIN(to_tsvector('english', title || ' ' || excerpt || ' ' || content));

-- News Feed
CREATE INDEX IF NOT EXISTS idx_news_feed_category ON news_feed(category);
CREATE INDEX IF NOT EXISTS idx_news_feed_date ON news_feed(announcement_date DESC);
CREATE INDEX IF NOT EXISTS idx_news_feed_breaking ON news_feed(is_breaking) WHERE is_breaking = TRUE;
CREATE INDEX IF NOT EXISTS idx_news_feed_tags ON news_feed USING GIN(tags);

-- Learning Paths
CREATE INDEX IF NOT EXISTS idx_learning_paths_slug ON learning_paths(slug);
CREATE INDEX IF NOT EXISTS idx_learning_paths_category ON learning_paths(category);
CREATE INDEX IF NOT EXISTS idx_learning_paths_published ON learning_paths(is_published) WHERE is_published = TRUE;

-- User Profiles (additional indexes)
CREATE INDEX IF NOT EXISTS idx_user_profiles_topics ON user_profiles USING GIN(preferred_topics);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_path_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE infrastructure_topologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_summary ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
DO $$ BEGIN
    CREATE POLICY "Public profiles are viewable by everyone"
        ON user_profiles FOR SELECT
        USING (true);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert their own profile"
        ON user_profiles FOR INSERT
        WITH CHECK (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update their own profile"
        ON user_profiles FOR UPDATE
        USING (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Posts Policies
DO $$ BEGIN
    CREATE POLICY "Published posts are viewable by everyone"
        ON posts FOR SELECT
        USING (status = 'published' OR author_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Contributors can create posts"
        ON posts FOR INSERT
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM user_profiles
                WHERE id = auth.uid()
                AND role IN ('contributor', 'editor', 'admin')
            )
        );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Authors can update their own posts"
        ON posts FOR UPDATE
        USING (author_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can approve/reject posts"
        ON posts FOR UPDATE
        USING (
            EXISTS (
                SELECT 1 FROM user_profiles
                WHERE id = auth.uid()
                AND role = 'admin'
            )
        );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can view all posts"
        ON posts FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM user_profiles
                WHERE id = auth.uid()
                AND role IN ('admin', 'editor')
            )
        );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can delete posts"
        ON posts FOR DELETE
        USING (
            author_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM user_profiles
                WHERE id = auth.uid()
                AND role = 'admin'
            )
        );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Notifications Policies
DO $$ BEGIN
    CREATE POLICY "Users can view their own notifications"
        ON notifications FOR SELECT
        USING (user_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update their own notifications"
        ON notifications FOR UPDATE
        USING (user_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- User Activity Policies (Analytics)
DO $$ BEGIN
    CREATE POLICY "Users can insert their own activity"
        ON user_activity FOR INSERT
        WITH CHECK (user_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can view all activity"
        ON user_activity FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM user_profiles
                WHERE id = auth.uid()
                AND role = 'admin'
            )
        );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Admin Activity Log Policies
DO $$ BEGIN
    CREATE POLICY "Admins can view admin logs"
        ON admin_activity_log FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM user_profiles
                WHERE id = auth.uid()
                AND role = 'admin'
            )
        );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can insert admin logs"
        ON admin_activity_log FOR INSERT
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM user_profiles
                WHERE id = auth.uid()
                AND role = 'admin'
            )
        );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Analytics Summary Policies
DO $$ BEGIN
    CREATE POLICY "Admins can view analytics"
        ON analytics_summary FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM user_profiles
                WHERE id = auth.uid()
                AND role = 'admin'
            )
        );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- News Feed Policies
DO $$ BEGIN
    CREATE POLICY "News feed is viewable by everyone"
        ON news_feed FOR SELECT
        USING (true);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Editors can manage news feed"
        ON news_feed FOR ALL
        USING (
            EXISTS (
                SELECT 1 FROM user_profiles
                WHERE id = auth.uid()
                AND role IN ('editor', 'admin')
            )
        );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Learning Paths Policies
DO $$ BEGIN
    CREATE POLICY "Published learning paths are viewable by everyone"
        ON learning_paths FOR SELECT
        USING (is_published = TRUE OR created_by = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Contributors can create learning paths"
        ON learning_paths FOR INSERT
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM user_profiles
                WHERE id = auth.uid()
                AND role IN ('contributor', 'editor', 'admin')
            )
        );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Creators can update their own learning paths"
        ON learning_paths FOR UPDATE
        USING (created_by = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Learning Path Progress Policies
DO $$ BEGIN
    CREATE POLICY "Users can view their own progress"
        ON learning_path_progress FOR SELECT
        USING (user_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert their own progress"
        ON learning_path_progress FOR INSERT
        WITH CHECK (user_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update their own progress"
        ON learning_path_progress FOR UPDATE
        USING (user_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Comments Policies
DO $$ BEGIN
    CREATE POLICY "Comments are viewable by everyone"
        ON comments FOR SELECT
        USING (true);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Authenticated users can create comments"
        ON comments FOR INSERT
        WITH CHECK (auth.uid() = author_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update their own comments"
        ON comments FOR UPDATE
        USING (auth.uid() = author_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can delete their own comments"
        ON comments FOR DELETE
        USING (auth.uid() = author_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Post Reactions Policies
DO $$ BEGIN
    CREATE POLICY "Reactions are viewable by everyone"
        ON post_reactions FOR SELECT
        USING (true);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can manage their own reactions"
        ON post_reactions FOR ALL
        USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Infrastructure Topologies Policies
DO $$ BEGIN
    CREATE POLICY "Topologies are viewable by everyone"
        ON infrastructure_topologies FOR SELECT
        USING (true);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Incident Timelines Policies
DO $$ BEGIN
    CREATE POLICY "Public incident timelines are viewable by everyone"
        ON incident_timelines FOR SELECT
        USING (is_public = TRUE OR auth.uid() = ANY(contributors));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Contributors can update incident timelines"
        ON incident_timelines FOR UPDATE
        USING (auth.uid() = ANY(contributors));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_learning_paths_updated_at ON learning_paths;
CREATE TRIGGER update_learning_paths_updated_at BEFORE UPDATE ON learning_paths
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update post metrics
CREATE OR REPLACE FUNCTION update_post_metrics()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update comment count when new comment is added
        UPDATE posts
        SET comment_count = comment_count + 1
        WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update comment count when comment is deleted
        UPDATE posts
        SET comment_count = GREATEST(0, comment_count - 1)
        WHERE id = OLD.post_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_posts_comment_count ON comments;
CREATE TRIGGER update_posts_comment_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_post_metrics();
-- Auto-update user stats when they create content
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF TG_TABLE_NAME = 'posts' THEN
            UPDATE user_profiles
            SET posts_written = posts_written + 1
            WHERE id = NEW.author_id;
        ELSIF TG_TABLE_NAME = 'comments' THEN
            UPDATE user_profiles
            SET comments_posted = comments_posted + 1
            WHERE id = NEW.author_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_posts_count ON posts;
CREATE TRIGGER update_user_posts_count
AFTER INSERT ON posts
FOR EACH ROW EXECUTE FUNCTION update_user_stats();

DROP TRIGGER IF EXISTS update_user_comments_count ON comments;
CREATE TRIGGER update_user_comments_count
AFTER INSERT ON comments
FOR EACH ROW EXECUTE FUNCTION update_user_stats();
-- Auto-update comment reply count
CREATE OR REPLACE FUNCTION update_comment_reply_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.parent_comment_id IS NOT NULL THEN
        UPDATE comments
        SET reply_count = reply_count + 1
        WHERE id = NEW.parent_comment_id;
    ELSIF TG_OP = 'DELETE' AND OLD.parent_comment_id IS NOT NULL THEN
        UPDATE comments
        SET reply_count = GREATEST(0, reply_count - 1)
        WHERE id = OLD.parent_comment_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_comments_reply_count ON comments;
CREATE TRIGGER update_comments_reply_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_comment_reply_count();
-- Calculate reading time based on word count
CREATE OR REPLACE FUNCTION calculate_reading_time()
RETURNS TRIGGER AS $$
BEGIN
    -- Average reading speed: 200 words per minute
    NEW.estimated_read_time = CEIL(NEW.word_count::FLOAT / 200);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_posts_reading_time ON posts;
CREATE TRIGGER calculate_posts_reading_time
BEFORE INSERT OR UPDATE OF word_count ON posts
FOR EACH ROW EXECUTE FUNCTION calculate_reading_time();

-- Auto-create notification on new comment
CREATE OR REPLACE FUNCTION create_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
    post_author_id UUID;
    post_title TEXT;
    commenter_name TEXT;
BEGIN
    -- Get post author and title
    SELECT author_id, title INTO post_author_id, post_title
    FROM posts WHERE id = NEW.post_id;
    
    -- Get commenter name
    SELECT full_name INTO commenter_name
    FROM user_profiles WHERE id = NEW.author_id;
    
    -- Only notify if comment author is not the post author
    IF NEW.author_id != post_author_id THEN
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            link,
            related_post_id,
            related_comment_id,
            related_user_id
        ) VALUES (
            post_author_id,
            'new_comment',
            'New Comment',
            commenter_name || ' commented on your post "' || post_title || '"',
            '/blog/' || (SELECT slug FROM posts WHERE id = NEW.post_id),
            NEW.post_id,
            NEW.id,
            NEW.author_id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS create_new_comment_notification ON comments;
CREATE TRIGGER create_new_comment_notification
AFTER INSERT ON comments
FOR EACH ROW EXECUTE FUNCTION create_comment_notification();

-- Log admin actions
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
DECLARE
    action_name TEXT;
    admin_user_id UUID;
BEGIN
    -- Determine the action type
    IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
        action_name := 'approve_post';
    ELSIF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
        action_name := 'reject_post';
    ELSE
        RETURN NEW;
    END IF;
    
    -- Get the admin user ID (assuming it's stored in approved_by or rejected_by)
    IF NEW.approved_by IS NOT NULL THEN
        admin_user_id := NEW.approved_by;
    ELSIF NEW.rejected_by IS NOT NULL THEN
        admin_user_id := NEW.rejected_by;
    END IF;
    
    -- Log the action
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO admin_activity_log (
            admin_id,
            action,
            resource_type,
            resource_id,
            details
        ) VALUES (
            admin_user_id,
            action_name,
            'post',
            NEW.id,
            jsonb_build_object(
                'post_title', NEW.title,
                'author_id', NEW.author_id,
                'rejection_reason', NEW.rejection_reason
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS log_post_moderation ON posts;
CREATE TRIGGER log_post_moderation
AFTER UPDATE OF status ON posts
FOR EACH ROW EXECUTE FUNCTION log_admin_action();

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Note: Uncomment the following to populate with sample data
-- This is useful for development and testing

-- Admin user
INSERT INTO user_profiles (id, email, password_hash, full_name, username, role, bio, is_active, is_verified)
VALUES (
    uuid_generate_v4(),
    'savisaluwadana@gmail.com',
    crypt('Savisalu@123', gen_salt('bf')),
    'Savi Saluwadana',
    'savisaluwadana',
    'admin',
    'Platform Administrator',
    true,
    true
)
ON CONFLICT (email) DO NOTHING;

/*
-- Sample admin user (commented out)
INSERT INTO user_profiles (id, email, password_hash, full_name, username, role, bio, is_active, is_verified)
VALUES (
    uuid_generate_v4(),
    'admin@rapidreach.blog',
    crypt('admin123', gen_salt('bf')),
    'Admin User',
    'admin',
    'admin',
    'Platform Administrator',
    true,
    true
);

-- Sample editor user
INSERT INTO user_profiles (id, email, password_hash, full_name, username, role, bio, is_active, is_verified)
VALUES (
    uuid_generate_v4(),
    'editor@rapidreach.blog',
    crypt('editor123', gen_salt('bf')),
    'Editor User',
    'editor',
    'editor',
    'Content Editor',
    true,
    true
);

-- Sample contributor users
INSERT INTO user_profiles (id, email, password_hash, full_name, username, role, bio, is_active, is_verified)
VALUES 
(
    uuid_generate_v4(),
    'john@example.com',
    crypt('password123', gen_salt('bf')),
    'John Doe',
    'johndoe',
    'contributor',
    'Cloud Infrastructure Specialist',
    true,
    true
),
(
    uuid_generate_v4(),
    'jane@example.com',
    crypt('password123', gen_salt('bf')),
    'Jane Smith',
    'janesmith',
    'contributor',
    'DevOps Engineer',
    true,
    true
);

-- Note: To add sample posts, comments, etc., you would insert them here
-- Make sure to use appropriate foreign key references
*/

-- Auto-update post reaction metrics
CREATE OR REPLACE FUNCTION update_post_reaction_metrics()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.reaction_type = 'like' THEN
            UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
        ELSIF NEW.reaction_type = 'bookmark' THEN
            UPDATE posts SET bookmark_count = bookmark_count + 1 WHERE id = NEW.post_id;
        ELSIF NEW.reaction_type = 'share' THEN
            UPDATE posts SET share_count = share_count + 1 WHERE id = NEW.post_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.reaction_type = 'like' THEN
            UPDATE posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
        ELSIF OLD.reaction_type = 'bookmark' THEN
            UPDATE posts SET bookmark_count = bookmark_count - 1 WHERE id = OLD.post_id;
        ELSIF OLD.reaction_type = 'share' THEN
            UPDATE posts SET share_count = share_count - 1 WHERE id = OLD.post_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_post_reactions_metrics ON post_reactions;
CREATE TRIGGER update_post_reactions_metrics
    AFTER INSERT OR DELETE ON post_reactions
    FOR EACH ROW EXECUTE FUNCTION update_post_reaction_metrics();

-- Auto-update comment count
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.post_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_post_comment_count ON comments;
CREATE TRIGGER update_post_comment_count
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_comment_count();

-- =====================================================
-- REALTIME SUBSCRIPTIONS
-- =====================================================

-- Enable realtime for news feed (skip if already added)
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE news_feed;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE incident_timelines;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- LEARNING PATH HELPERS
-- =====================================================

-- Increment enrollment count when a user enrolls
CREATE OR REPLACE FUNCTION increment_enrollment_count(path_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE learning_paths
    SET enrollment_count = enrollment_count + 1
    WHERE id = path_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow admins/editors to delete learning paths
DO $$ BEGIN
    CREATE POLICY "Admins can delete learning paths"
        ON learning_paths FOR DELETE
        USING (
            EXISTS (
                SELECT 1 FROM user_profiles
                WHERE id = auth.uid()
                AND role IN ('editor', 'admin')
            )
        );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Allow admins/editors to update any learning path (not just their own)
DO $$ BEGIN
    CREATE POLICY "Admins can update any learning path"
        ON learning_paths FOR UPDATE
        USING (
            EXISTS (
                SELECT 1 FROM user_profiles
                WHERE id = auth.uid()
                AND role IN ('editor', 'admin')
            )
        );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- SEED DATA (Optional - for development)
-- =====================================================

-- Insert sample categories and tags
COMMENT ON TABLE posts IS 'Main blog posts for DevOps, Platform Engineering, and Cloud Native content';
COMMENT ON TABLE news_feed IS 'Live infrastructure news feed for real-time updates on K8s, Terraform, etc.';
COMMENT ON TABLE learning_paths IS 'Curated learning paths for Platform Engineering education';
COMMENT ON TABLE infrastructure_topologies IS 'Interactive infrastructure visualizations for blog posts';
COMMENT ON TABLE incident_timelines IS 'Collaborative incident response timelines';
