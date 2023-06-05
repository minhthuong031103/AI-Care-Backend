import User from '../mongodb/models/user.js';
import passport from 'passport';
import * as dotenv from 'dotenv';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import express from 'express';

import googleAuth from '../googleAuth/googleAuth.js';
const router = express.Router();
dotenv.config();

let userProfile;
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    },
    function (accessToken, refreshToken, profile, done) {
      userProfile = profile;
      return done(null, userProfile);
    }
  )
);

// request at /auth/google, when user click sign-up with google button transferring
// the request to google server, to show emails screen
router.get(
  '/',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// URL Must be same as 'Authorized redirect URIs' field of OAuth client, i.e: /auth/google/callback
router.get(
  '/callback',
  passport.authenticate('google', { failureRedirect: '/google/error' }),
  (req, res) => {
    res.redirect('/google/success'); // Successful authentication, redirect success.
  }
);

router.get('/success', async (req, res) => {
  console.log(userProfile);
  const { login, register } = await googleAuth.registerWithGoogle(userProfile);
  if (login) {
    const expirationTime = 30 * 1000; // 0.5 minute in milliseconds
    res.cookie('responseData', JSON.stringify(login), {
      maxAge: expirationTime,
    });

    return res.redirect('https://ai-care-uit.vercel.app/');
  }
  console.log('Registering new Google user..');
  const expirationTime = 60 * 1000; // 1 minute in milliseconds
  res.cookie('responseData', JSON.stringify(register), {
    maxAge: expirationTime,
  });

  return res.redirect('https://ai-care-uit.vercel.app/register'); // Redirect to the client URL
});

router.get('/error', (req, res) => res.send('Error logging in via Google..'));

router.get('/signout', (req, res) => {
  try {
    req.session.destroy(function (err) {
      console.log('session destroyed.');
    });
    res.render('auth');
  } catch (err) {
    res.status(400).send({ message: 'Failed to sign out user' });
  }
});

export default router;
