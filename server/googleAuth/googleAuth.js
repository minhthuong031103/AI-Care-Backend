import User from '../mongodb/models/user.js';
import jwt from 'jsonwebtoken';
const googleAuth = {
  registerWithGoogle: async (oauthUser) => {
    const isUserExists = await User.findOne({
      email: oauthUser.emails[0].value,
    });
    if (isUserExists) {
      const token = jwt.sign(
        {
          userId: isUserExists._id,
          email: isUserExists.email,
        },
        'WNi3oF3NfduzvwUiOPlnDdUUjIlMcv7fX28ms3udpPM',

        { expiresIn: '24h' }
      );
      const login = {
        token: token,
        _id: isUserExists._id,
        name: isUserExists.name,
      };
      return { login };
    }

    const register = {
      name: oauthUser.displayName,

      email: oauthUser.emails[0].value,
    };
    return { register };
  },

  // loginUser: async (oauthUser) => {
  //   const userExists = await User.findOne({ email: oauthUser.emails[0].value });
  //   if (userExists) {
  //     const success = {
  //       message: 'User successfully logged In.',
  //     };
  //     return { success };
  //   }
  //   const failure = {
  //     message: 'Email not Registered. You need to sign up first',
  //   };
  //   return { failure };
  // },
};

export default googleAuth;
