-- RapidReach Supabase Schema
-- World-Class DevOps & Cloud Native Blog Platform
-- Created: February 8, 2026

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE user_role AS ENUM ('reader', 'contributor', 'editor', 'admin');
CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE content_difficulty AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
CREATE TYPE news_category AS ENUM ('kubernetes', 'terraform', 'aws', 'azure', 'gcp', 'cicd', 'security', 'observability', 'platform-engineering');

-- =====================================================
-- CORE TABLES
-- =====================================================

-- User Profiles
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    role user_role DEFAULT 'reader',
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
    
    -- Gamification
    reputation_score INTEGER DEFAULT 0,
    badges JSONB DEFAULT '[]',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Posts
CREATE TABLE posts (
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
    estimated_read_time INTEGER, -- in minutes
    
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    og_image_url TEXT,
    
    -- Publishing
    status post_status DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    featured BOOLEAN DEFAULT FALSE,
    pinned BOOLEAN DEFAULT FALSE,
    
    -- Engagement Metrics
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    bookmark_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    
    -- Interactive Features
    code_snippets JSONB DEFAULT '[]', -- Array of {language, code, title}
    interactive_demos JSONB DEFAULT '[]', -- Links to sandboxes
    related_posts UUID[] DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Live Infrastructure News Feed
CREATE TABLE news_feed (
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
CREATE TABLE learning_paths (
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
CREATE TABLE learning_path_progress (
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

-- Comments
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    
    content TEXT NOT NULL,
    
    -- Engagement
    like_count INTEGER DEFAULT 0,
    is_edited BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post Reactions (Likes, Bookmarks)
CREATE TABLE post_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL, -- 'like', 'bookmark', 'share'
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, post_id, reaction_type)
);

-- Infrastructure Topology Data (Category-Defining Feature #1)
CREATE TABLE infrastructure_topologies (
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
CREATE TABLE incident_timelines (
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
CREATE TABLE newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    is_active BOOLEAN DEFAULT TRUE,
    preferred_frequency TEXT DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly'
    topics TEXT[] DEFAULT '{}',
    
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Posts
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_published ON posts(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_posts_featured ON posts(featured) WHERE featured = TRUE;
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);
CREATE INDEX idx_posts_search ON posts USING GIN(to_tsvector('english', title || ' ' || excerpt || ' ' || content));

-- News Feed
CREATE INDEX idx_news_feed_category ON news_feed(category);
CREATE INDEX idx_news_feed_date ON news_feed(announcement_date DESC);
CREATE INDEX idx_news_feed_breaking ON news_feed(is_breaking) WHERE is_breaking = TRUE;
CREATE INDEX idx_news_feed_tags ON news_feed USING GIN(tags);

-- Learning Paths
CREATE INDEX idx_learning_paths_slug ON learning_paths(slug);
CREATE INDEX idx_learning_paths_category ON learning_paths(category);
CREATE INDEX idx_learning_paths_published ON learning_paths(is_published) WHERE is_published = TRUE;

-- Comments
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);

-- User Profiles
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_topics ON user_profiles USING GIN(preferred_topics);

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

-- User Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON user_profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- Posts Policies
CREATE POLICY "Published posts are viewable by everyone"
    ON posts FOR SELECT
    USING (status = 'published' OR author_id = auth.uid());

CREATE POLICY "Contributors can create posts"
    ON posts FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('contributor', 'editor', 'admin')
        )
    );

CREATE POLICY "Authors can update their own posts"
    ON posts FOR UPDATE
    USING (author_id = auth.uid());

CREATE POLICY "Editors and admins can update any post"
    ON posts FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('editor', 'admin')
        )
    );

-- News Feed Policies
CREATE POLICY "News feed is viewable by everyone"
    ON news_feed FOR SELECT
    USING (true);

CREATE POLICY "Editors can manage news feed"
    ON news_feed FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('editor', 'admin')
        )
    );

-- Learning Paths Policies
CREATE POLICY "Published learning paths are viewable by everyone"
    ON learning_paths FOR SELECT
    USING (is_published = TRUE OR created_by = auth.uid());

CREATE POLICY "Contributors can create learning paths"
    ON learning_paths FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('contributor', 'editor', 'admin')
        )
    );

CREATE POLICY "Creators can update their own learning paths"
    ON learning_paths FOR UPDATE
    USING (created_by = auth.uid());

-- Learning Path Progress Policies
CREATE POLICY "Users can view their own progress"
    ON learning_path_progress FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own progress"
    ON learning_path_progress FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own progress"
    ON learning_path_progress FOR UPDATE
    USING (user_id = auth.uid());

-- Comments Policies
CREATE POLICY "Comments are viewable by everyone"
    ON comments FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create comments"
    ON comments FOR INSERT
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own comments"
    ON comments FOR UPDATE
    USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments"
    ON comments FOR DELETE
    USING (auth.uid() = author_id);

-- Post Reactions Policies
CREATE POLICY "Reactions are viewable by everyone"
    ON post_reactions FOR SELECT
    USING (true);

CREATE POLICY "Users can manage their own reactions"
    ON post_reactions FOR ALL
    USING (auth.uid() = user_id);

-- Infrastructure Topologies Policies
CREATE POLICY "Topologies are viewable by everyone"
    ON infrastructure_topologies FOR SELECT
    USING (true);

-- Incident Timelines Policies
CREATE POLICY "Public incident timelines are viewable by everyone"
    ON incident_timelines FOR SELECT
    USING (is_public = TRUE OR auth.uid() = ANY(contributors));

CREATE POLICY "Contributors can update incident timelines"
    ON incident_timelines FOR UPDATE
    USING (auth.uid() = ANY(contributors));

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

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_paths_updated_at BEFORE UPDATE ON learning_paths
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update post metrics
CREATE OR REPLACE FUNCTION update_post_metrics()
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

CREATE TRIGGER update_post_reactions_metrics
    AFTER INSERT OR DELETE ON post_reactions
    FOR EACH ROW EXECUTE FUNCTION update_post_metrics();

-- Auto-update comment count
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_comment_count
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_comment_count();

-- =====================================================
-- REALTIME SUBSCRIPTIONS
-- =====================================================

-- Enable realtime for news feed
ALTER PUBLICATION supabase_realtime ADD TABLE news_feed;
ALTER PUBLICATION supabase_realtime ADD TABLE incident_timelines;

-- =====================================================
-- SEED DATA (Optional - for development)
-- =====================================================

-- Insert sample categories and tags
COMMENT ON TABLE posts IS 'Main blog posts for DevOps, Platform Engineering, and Cloud Native content';
COMMENT ON TABLE news_feed IS 'Live infrastructure news feed for real-time updates on K8s, Terraform, etc.';
COMMENT ON TABLE learning_paths IS 'Curated learning paths for Platform Engineering education';
COMMENT ON TABLE infrastructure_topologies IS 'Interactive infrastructure visualizations for blog posts';
COMMENT ON TABLE incident_timelines IS 'Collaborative incident response timelines';
