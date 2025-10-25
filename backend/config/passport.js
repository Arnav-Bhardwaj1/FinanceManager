// Use environment variables only - no fallback credentials
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

console.log('🔍 Passport Config - GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID ? 'Set' : 'Not Set');
console.log('🔍 Passport Config - GOOGLE_CLIENT_SECRET:', GOOGLE_CLIENT_SECRET ? 'Set' : 'Not Set');

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Only configure Google OAuth if credentials are available
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  
  // Configure Google OAuth Strategy
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      let existingUser = await User.findOne({ googleId: profile.id });
      
      if (existingUser) {
        return done(null, existingUser);
      }
      
      // Check if user exists with same email
      existingUser = await User.findOne({ email: profile.emails[0].value });
      
      if (existingUser) {
        // Link Google account to existing user
        existingUser.googleId = profile.id;
        existingUser.provider = 'google';
        existingUser.avatar = profile.photos[0]?.value || '';
        // Update name if it's empty and we have a display name
        if (!existingUser.name && profile.displayName) {
          existingUser.name = profile.displayName;
        }
        await existingUser.save();
        return done(null, existingUser);
      }
      
      // Create new user
      const newUser = new User({
        googleId: profile.id,
        name: profile.displayName || profile.emails[0].value.split('@')[0] || 'Google User',
        email: profile.emails[0].value,
        avatar: profile.photos[0]?.value || '',
        provider: 'google'
      });
      
      await newUser.save();
      return done(null, newUser);
      
    } catch (error) {
      console.error('Google OAuth error:', error);
      return done(error, null);
    }
  }));
  
} else {
  console.log('Google OAuth credentials not configured - Google Sign-In disabled');
}

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
