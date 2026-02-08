# 🔐 Authentication System

## Overview
RapidReach Blog features a complete authentication system with role-based access control, user profiles, and admin panel protection.

## Features

### ✅ Sign In / Sign Up
- **Sign In Page**: `/auth/signin`
- **Sign Up Page**: `/auth/signup`
- Demo credentials for testing
- Social login UI (Google, GitHub)
- Password visibility toggle
- Remember me checkbox
- Responsive design

### 👤 User Roles
- **Admin**: Full access to admin panel, can manage posts, users, comments
- **Editor**: Can create and edit posts (not yet implemented)
- **Contributor**: Can write posts (not yet implemented)
- **Reader**: Basic user access

### 🛡️ Protected Routes
- Admin panel (`/admin/*`) requires admin role
- Profile page (`/profile`) requires authentication
- Middleware protection on admin routes

### 🎨 UI Components
- User menu dropdown in navbar
- Admin panel link (shown only to admins)
- Profile link
- Sign out button
- Mobile-responsive menu with auth integration

## Demo Credentials

### Admin Access
```
Email: admin@rapidreach.blog
Password: admin123
```

### Regular User
```
Email: Any email address
Password: Any password (minimum 6 characters)
```

## Usage

### 1. Sign In
Navigate to `/auth/signin` or click "Sign In" in the navbar.

**As Admin:**
- Use `admin@rapidreach.blog` / `admin123`
- You'll be redirected to `/admin` dashboard
- Admin panel link appears in navbar

**As Regular User:**
- Use any email/password
- You'll be redirected to homepage
- Can access profile page

### 2. Navigation
**Authenticated users see:**
- User avatar and name in navbar
- Dropdown menu with:
  - Profile link
  - Admin Panel link (admins only)
  - Sign Out button

**Mobile menu shows:**
- User info at top
- Admin Panel button (admins only)
- Sign Out button at bottom

### 3. Admin Panel
- Navigate to `/admin` (auto-redirected if not admin)
- Sidebar navigation with logout button
- User info displayed in sidebar
- "Back to Site" link to return to main site

### 4. Profile Page
- Navigate to `/profile` from user menu
- View and edit account settings
- User stats (articles, comments, bookmarks)
- Notification preferences
- Responsive layout

## Implementation Details

### Auth Library (`/lib/auth.ts`)
```typescript
// Get current user
const user = getUser()

// Check if authenticated
if (isAuthenticated()) {
  // User is logged in
}

// Check if admin
if (isAdmin()) {
  // User has admin role
}

// Logout
logout() // Clears session and redirects to home
```

### Storage
Uses **localStorage** for demo mode:
- `user`: JSON object with user data
- `isAuthenticated`: Boolean flag

### Components Integration

**Navbar** (`/components/Navbar.tsx`):
- Auto-detects auth state on mount
- Listens for storage changes
- Shows appropriate menu (Sign In vs User Menu)
- Admin panel link for admins

**AdminLayout** (`/components/AdminLayout.tsx`):
- Checks auth on mount
- Redirects non-admins to `/auth/signin`
- Shows user info in sidebar
- Logout button in sidebar

### Middleware (`/middleware.ts`)
```typescript
// Protects /admin routes
// Currently allows client-side handling
// Can be extended for server-side auth
```

## File Structure

```
app/
├── auth/
│   ├── signin/page.tsx       # Sign in form
│   └── signup/page.tsx       # Sign up form
├── profile/page.tsx          # User profile page
└── admin/                    # Protected admin routes

components/
├── Navbar.tsx                # With auth menu
└── AdminLayout.tsx           # With auth protection

lib/
└── auth.ts                   # Auth utility functions

middleware.ts                 # Route protection
```

## Extending the System

### Add Supabase Auth

1. **Install Supabase Auth Helpers:**
```bash
npm install @supabase/auth-helpers-nextjs
```

2. **Update `/lib/auth.ts`:**
```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export async function signIn(email: string, password: string) {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}
```

3. **Update sign-in page:**
```typescript
const handleSignIn = async (e: FormEvent) => {
  e.preventDefault()
  const { data, error } = await signIn(email, password)
  if (error) {
    setError(error.message)
  } else {
    router.push('/admin')
  }
}
```

### Add Server-Side Protection

Update `/middleware.ts`:
```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session && req.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }
  
  return res
}
```

### Add Password Reset

Create `/app/auth/forgot-password/page.tsx`:
```typescript
const handleReset = async (email: string) => {
  const supabase = createClientComponentClient()
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })
}
```

### Add Email Verification

Update signup flow:
```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
})
```

## Security Considerations

### Current (Demo Mode)
⚠️ **Not production-ready**
- Client-side only authentication
- No password hashing
- No session management
- LocalStorage can be manipulated

### Production Recommendations
1. **Use Supabase Auth or NextAuth.js**
2. **Implement server-side session validation**
3. **Add CSRF protection**
4. **Use HTTP-only cookies for tokens**
5. **Implement rate limiting**
6. **Add 2FA for admin accounts**
7. **Encrypt sensitive data**
8. **Use environment variables for secrets**

## API Routes (To Implement)

```
POST /api/auth/signin      # Sign in endpoint
POST /api/auth/signup      # Sign up endpoint
POST /api/auth/signout     # Sign out endpoint
GET  /api/auth/session     # Get current session
POST /api/auth/refresh     # Refresh token
```

## Testing

### Test Admin Flow
1. Go to `/auth/signin`
2. Enter admin credentials
3. Verify redirect to `/admin`
4. Check navbar shows "Admin Panel" link
5. Test logout functionality

### Test User Flow
1. Go to `/auth/signup`
2. Create new account
3. Verify redirect to homepage
4. Navigate to `/profile`
5. Test profile editing

### Test Protection
1. Try accessing `/admin` without login
2. Should redirect to `/auth/signin`
3. Try accessing `/admin` as regular user
4. Should redirect to `/auth/signin`

## Troubleshooting

**User menu not showing:**
- Check browser console for errors
- Verify localStorage has `user` and `isAuthenticated`
- Refresh page to trigger auth check

**Admin panel redirect loop:**
- Clear localStorage
- Sign in again with admin credentials
- Check `role` field in user object

**Mobile menu not closing:**
- Click outside menu area
- Use close button (X icon)
- Navigation links auto-close menu

---

**Built with ❤️ for secure, scalable authentication**
