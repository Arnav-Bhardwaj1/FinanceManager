# Google Sign-In/Sign-Up Implementation Guide

This document explains how Google OAuth is wired up in this project (FinanceManager) so you can replicate it elsewhere.

## High-Level Flow
1. **Frontend** shows a "Continue with Google" button (`frontend/src/pages/Login.jsx`). Clicking it sends the browser to the backend endpoint `/api/auth/google`.
2. **Backend** (Express + Passport) starts the Google OAuth flow and, after Google authenticates the user, receives the callback at `/api/auth/google/callback`.
3. The callback handler (`backend/controllers/authController.js` → `googleCallback`) issues a JWT, packages user data, and redirects back to the frontend route `/auth/google-success` with the token plus serialized user in the query string.
4. **Frontend success page** (`frontend/src/pages/GoogleAuthSuccess.jsx`) reads the query params, stores the token/user in `localStorage`, sets the Axios Authorization header, updates `AuthContext`, and navigates to the dashboard.

## Backend Setup
### 1. Packages
```
npm install passport passport-google-oauth20 express-session
```
Passport configuration lives in `backend/config/passport.js`.

### 2. User Model Fields
`backend/models/User.js` includes:
- `googleId` (unique, sparse)
- `provider` (`'local' | 'google'`)
- `avatar`
These allow linking Google accounts to existing users or creating new ones.

### 3. Environment Variables
Add these to `.env` (root directory):
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend.com/api/auth/google/callback
FRONTEND_URL=https://your-frontend.com
SESSION_SECRET=some-random-string
```
`backend/app.js` loads `.env` before anything else.

### 4. Express + Sessions + Passport (`backend/app.js`)
- Enables CORS with `credentials: true` so cookies/sessions work across origins.
- Configures `express-session` (required because Passport uses sessions internally).
- Initializes Passport: `app.use(passport.initialize()); app.use(passport.session());`
- Mounts routes: `app.use('/api/auth', authRoutes);`

### 5. Google Strategy (`backend/config/passport.js`)
- Guarded so it only loads if both `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` are present.
- Uses `passport-google-oauth20` to fetch profile & email.
- Logic:
  - Find user by `googleId`; if found, log in.
  - Otherwise, check if user with same email already exists. If yes, link the Google account (set `googleId`, `provider`, `avatar`).
  - Else create new user with Google profile data.
- Serializes the Mongo `_id`, deserializes the full user document.

### 6. Auth Routes (`backend/routes/authRoutes.js`)
```
GET /api/auth/google -> passport.authenticate('google', { scope: ['profile','email'] })
GET /api/auth/google/callback -> passport.authenticate(...), then `authController.googleCallback`
```
`googleCallback` creates a JWT (using the same helper as email/password login) and redirects to the frontend success route with:
```
/auth/google-success?token=<JWT>&user=<encoded JSON>
```

### 7. Controller Redirect (`backend/controllers/authController.js`)
- Validates `req.user` injected by Passport.
- Builds `userData { id, name, email, avatar, provider }`.
- Generates JWT via `generateToken(user)`.
- Redirects to `${FRONTEND_URL}/auth/google-success?token=...`.

## Frontend Setup
### 1. Login Button (`frontend/src/pages/Login.jsx`)
```
const handleGoogleSignIn = () => {
  window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/google`;
};
```
- Button uses Material UI and triggers the redirect.

### 2. Success Route (`frontend/src/AppRoutes.jsx`)
```
<Route path="/auth/google-success" element={<GoogleAuthSuccess />} />
```
Route is *not* behind `PrivateRoute` because it needs to run before the user is authenticated.

### 3. Success Page (`frontend/src/pages/GoogleAuthSuccess.jsx`)
- Reads `token` and `user` from query params.
- Stores them in `localStorage` and sets Axios default `Authorization` header.
- Calls `setUser` from `AuthContext` so the rest of the app knows the user is logged in.
- Redirects to `/analytics` on success; to `/login?error=google_auth_failed` on failure.

### 4. Auth Context (`frontend/src/context/AuthContext.jsx`)
- On mount, reads `token` & `user` from `localStorage` and sets Axios headers, enabling persistent sessions for both email/password and Google logins.

## Adding This Flow to Another Project
1. **Prep Google Credentials**: Create credentials in Google Cloud Console (OAuth 2.0 Client ID). Add authorized redirect URI: `https://your-backend.com/api/auth/google/callback` (and dev version `http://localhost:5000/api/auth/google/callback`).
2. **Backend**:
   - Install Passport packages.
   - Add Google fields to your user model.
   - Configure sessions + Passport initialization.
   - Drop in the Google Strategy and routes similar to this repo.
   - Ensure your controller issues a token/response your frontend understands.
3. **Frontend**:
   - Add a button that navigates to `/api/auth/google`.
   - Build a success page that consumes the token/user data returned by your backend and persists them.
   - Update your auth context/store to hydrate from `localStorage` on reload.
4. **Environment Variables**: Make sure both backend and frontend know the base URLs so redirects work in dev & prod.
5. **Testing**:
   - Run backend locally (`npm run dev`) and frontend (`npm run dev`).
   - Click "Continue with Google" → complete Google login → verify you land on `/auth/google-success` and then get redirected as an authenticated user.

## Troubleshooting Tips
- If you see `Google OAuth credentials not configured` in the backend logs, double-check `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`.
- The redirect URI must exactly match what is registered in Google Cloud (protocol, host, path).
- If the frontend never receives `token`/`user`, log `req.user` inside `googleCallback` to verify that Passport is providing the profile.
- When deploying, set `FRONTEND_URL` and `GOOGLE_CALLBACK_URL` to the production URLs.

Refer to the files mentioned above for real implementations:
- `backend/app.js`
- `backend/config/passport.js`
- `backend/routes/authRoutes.js`
- `backend/controllers/authController.js`
- `frontend/src/pages/Login.jsx`
- `frontend/src/pages/GoogleAuthSuccess.jsx`
- `frontend/src/context/AuthContext.jsx`
