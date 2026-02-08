# 🚀 RapidReach Setup Guide

## Quick Start (5 minutes)

Your RapidReach blog is currently running in **demo mode** with placeholder data. Follow these steps to connect your real Supabase database.

---

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" (free tier available)
3. Create a new organization (if needed)
4. Create a new project:
   - **Name**: RapidReach Blog
   - **Database Password**: Save this somewhere safe!
   - **Region**: Choose closest to your users
   - Click "Create new project"

⏱️ *Wait 2-3 minutes for project to initialize*

---

## Step 2: Get Your Credentials

1. In your Supabase project dashboard
2. Go to **Settings** (gear icon in sidebar)
3. Click **API** in the left menu
4. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (the `anon` `public` key in the table)

---

## Step 3: Update Environment Variables

1. Open the file `.env.local` in your project root
2. Replace the placeholder values:

```bash
# Replace these with YOUR actual values from Step 2
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Keep these as-is
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Save the file

---

## Step 4: Run Database Migration

1. In Supabase dashboard, go to **SQL Editor** (database icon in sidebar)
2. Click **New query**
3. Open the file `supabase/schema.sql` from your project
4. Copy **ALL** the contents
5. Paste into the SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

✅ You should see "Success. No rows returned"

This creates all your tables, indexes, policies, and triggers.

---

## Step 5: Enable Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Ensure **Email** is enabled (should be by default)
3. For development, optionally:
   - Go to **Authentication** → **Settings**
   - Disable "Enable email confirmations" (under Email Auth section)
   - This lets you test without email verification

4. Add Redirect URLs:
   - Go to **Authentication** → **URL Configuration**
   - Add to **Site URL**: `http://localhost:3000`
   - Add to **Redirect URLs**: `http://localhost:3000/**`

---

## Step 6: Restart Your Dev Server

```bash
# Stop the current server (Ctrl + C)
# Then restart:
npm run dev
```

🎉 Your site should now be connected to Supabase!

---

## Step 7: Create Your Admin Account

1. Go to [http://localhost:3000/auth/signup](http://localhost:3000/auth/signup)
2. Create a new account with your email
3. You'll be registered as a "reader" by default
4. **Upgrade to Admin**:
   - Go to Supabase dashboard → **Table Editor**
   - Open the `user_profiles` table
   - Find your user row
   - Change the `role` column from `reader` to `admin`
   - Save

5. Sign out and sign back in
6. You should now see "Admin Panel" in the navigation!

---

## Step 8: Create Your First Post (Optional)

### Option A: Via Admin Panel (Recommended)
1. Go to Admin Panel → Posts → New Post
2. Fill in the details
3. Click "Save as Draft" or "Publish"

### Option B: Via SQL (Quick Demo Data)
Run this in SQL Editor to create sample content:

```sql
-- Insert a sample post (replace 'your-user-id' with your actual ID from user_profiles table)
INSERT INTO posts (
  title, slug, excerpt, content, author_id, category, tags, 
  difficulty, status, featured, read_time, word_count, character_count
) VALUES (
  'Getting Started with Kubernetes',
  'getting-started-kubernetes',
  'A comprehensive guide to deploying your first Kubernetes cluster.',
  '# Getting Started with Kubernetes\n\nKubernetes is...',
  'your-user-id',  -- REPLACE THIS!
  'Kubernetes',
  ARRAY['kubernetes', 'devops', 'containers'],
  'beginner',
  'published',
  true,
  10,
  2000,
  10000
);
```

---

## Troubleshooting

### "Error fetching posts: {}"
- Check that your `.env.local` has the correct values
- Restart your dev server after changing `.env.local`
- Make sure you ran the database migration (Step 4)

### "relation does not exist" error
- You haven't run the database migration
- Go back to Step 4 and run `supabase/schema.sql`

### Can't see Admin Panel
- Your user role must be set to `admin` in the database
- Go to Supabase → Table Editor → user_profiles
- Change your user's `role` to `admin`

### Posts not showing on homepage
- Make sure posts have `status = 'published'`
- Check `featured` or `trending` flags if filtering

### Authentication not working
- Verify environment variables are correct
- Check Supabase Auth settings (Step 5)
- Look for errors in browser console

---

## Next Steps

✅ **Backend is complete!** You now have:
- Full database with PostgreSQL
- User authentication with Supabase Auth
- Admin panel for content management
- Comment system with moderation
- Analytics dashboard
- Real-time capabilities

### Optional Enhancements:

1. **Add Real-time Updates**
   - Enable real-time on tables in Supabase
   - See `components/LiveInfrastructureFeed.tsx` for example

2. **Email Notifications**
   - Configure SMTP in Supabase settings
   - Enable email confirmations

3. **Deploy to Production**
   - Push to GitHub
   - Deploy on Vercel
   - Update environment variables in Vercel dashboard
   - Update Supabase redirect URLs for production domain

4. **Add More Features**
   - Social login (GitHub, Google)
   - Image uploads with Supabase Storage
   - Advanced analytics
   - Newsletter integration

---

## Support

- 📖 **Documentation**: `BACKEND_INTEGRATION.md`
- 🔐 **Auth Guide**: `AUTHENTICATION.md`
- 🗄️ **Database Schema**: `supabase/schema.sql`

---

**Status**: Demo mode → Production ready! 🚀
