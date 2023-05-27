import Doctor from '../mongodb/models/doctorModel.js';
import * as dotenv from 'dotenv';
import confirmScheduleMail from './mailer.js';
import express from 'express';
dotenv.config();

const router = express.Router();

// router.route('/login').post(async function (req, res) {
//   try {
//     const { email, password } = req.body;
//     console.log(email, password);
//     const user = await User.findOne({ email: email });
//     if (!user) return res.status(500).send('error');
//     console.log(user.password);

//     bcrypt
//       .compare(password, user.password)
//       .then(function (passwordCheck) {
//         if (!passwordCheck) return res.status(402).send('wrong!');
//         const token = jwt.sign(
//           {
//             userId: user._id,
//             email: user.email,
//           },
//           'WNi3oF3NfduzvwUiOPlnDdUUjIlMcv7fX28ms3udpPM',

//           { expiresIn: '24h' }
//         );
//         return res.status(201).send({
//           msg: 'Login Successfully',
//           _id: user._id,
//           token,
//         });
//       })
//       .catch(function (error) {
//         return res.status(500).send('error');
//       });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({ success: false, message: error });
//   }
// });
router.route('/schedule').post(async function (req, res) {
  try {
    const { user, doctorEmail, doctorName } = req.body; //get parameter
    console.log(user);
    const { email, name, phone, message } = user;
    if (!user) return res.status(501).send({ error: 'invalid date' });

    try {
      await confirmScheduleMail(
        email,
        doctorName,
        name,
        doctorEmail,
        phone,
        message
      )
        .then(function () {
          return res.status(201).send('ok');
        })
        .catch(function (error) {
          return res.status(504).send('failed');
        });
    } catch (error) {
      return res.status(505).send({ error });
    }
  } catch (error) {
    console.log(error);
  }
});
export default router;
