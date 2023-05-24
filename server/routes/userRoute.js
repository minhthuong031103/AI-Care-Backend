import express from 'express';
import * as dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../mongodb/models/user.js';

import jwt from 'jsonwebtoken';

dotenv.config();

const router = express.Router();

router.route('/login').post(async function (req, res) {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    const user = await User.findOne({ email: email });
    if (!user) return res.status(500).send('error');
    console.log(user.password);
    bcrypt.hash(password, 10).then(function (hashedPassword) {
      console.log(hashedPassword);
    });
    bcrypt
      .compare(password, user.password)
      .then(function (passwordCheck) {
        if (!passwordCheck) return res.status(402).send('wrong!');
        const token = jwt.sign(
          {
            userId: user._id,
            email: user.email,
          },
          'WNi3oF3NfduzvwUiOPlnDdUUjIlMcv7fX28ms3udpPM',

          { expiresIn: '24h' }
        );
        return res.status(201).send({
          msg: 'Login Successfully',
          _id: user._id,
          token,
        });
      })
      .catch(function (error) {
        return res.status(500).send('error');
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: error });
  }
});

router.route('/createaccount').post(async function (req, res) {
  try {
    const { name, email, phone, password } = req.body;
    console.log(name, email, phone, password);
    const existEmail = new Promise(async function (resolve, reject) {
      const emailexist = await User.findOne({ email });

      if (emailexist) reject('Email already exists');

      resolve();
    });
    const existPhone = new Promise(async function (resolve, reject) {
      const phoneexist = await User.findOne({ phone });

      if (phoneexist) reject('Phone already exists');

      resolve();
    });
    Promise.all([existEmail, existPhone])
      .then(function () {
        bcrypt.hash(password, 10).then(async function (hashedPassword) {
          const newUser = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
          })
            .then(function () {
              res.status(200).send({ success: true });
            })
            .catch(function (error) {
              console.log(hashedPassword);
              console.log(error);
              res.status(500).send(error);
            });
        });
      })
      .catch(function (error) {
        if (error === 'Email already exists') {
          return res.status(201).send('Email exist');
        } else if (error === 'Phone already exists') {
          return res.status(202).send('Phone exist');
        }
      });
  } catch (error) {
    console.log(error);
    res.status(501).send({ success: false, data: error });
  }
});

router.route('/:_id').get(async function getUserbyId(req, res) {
  const { _id } = req.params; //get parameter
  try {
    if (!_id) return res.status(501).send({ error: 'invalid id' });
    const user = await User.findOne({ _id: _id });
    if (!user) return res.status(500).send('error not found user');

    const { password, ...rest } = user.toJSON();
    return res.status(201).send(rest);
  } catch (error) {
    return res.status(409).send({ error: 'can not find user data' });
  }
});
router.route('/updateuser').put(async function updateUser(req, res) {
  try {
    const { _id } = req.body;
    const user = req.body.user;
    console.log(_id);
    const { email, phone } = user;
    const existEmail = new Promise(async function (resolve, reject) {
      const emailexist = await User.findOne({ email });

      if (emailexist) reject('Email already exists');

      resolve();
    });

    const existPhone = new Promise(async function (resolve, reject) {
      const phoneexist = await User.findOne({ phone });

      if (phoneexist) reject('Phone already exists');

      resolve();
    });
    Promise.all([existEmail, existPhone])
      .then(async () => {
        const body = req.body.user;

        const foundUser = await User.findOne({ _id });
        if (!foundUser) return res.status(404).send('User not found');
        const update = await User.updateOne({ _id: _id }, body);
        console.log(update);

        if (update) return res.status(200).send('User Updated');
        else return res.status(501).send({ error });
      })
      .catch(function (error) {
        console.log(error);
        if (error === 'Email already exists') {
          return res.status(201).send('Email exist');
        } else if (error === 'Phone already exists') {
          return res.status(202).send('Phone exist');
        }
      });
  } catch (error) {
    console.log(error);
    return res.status(503).send({ error });
    // .then(function () {
    //   bcrypt.hash(password, 10).then(async function (hashedPassword) {
    //     const newUser = await User.create({
    //       name,
    //       email,
    //       phone,
    //       password: hashedPassword,
    //     })
    //       .then(function () {
    //         res.status(200).send({ success: true });
    //       })
    //       .catch(function (error) {
    //         console.log(hashedPassword);
    //         console.log(error);
    //         res.status(500).send(error);
    //       });
    //   });
    // })
    // .catch(function (error) {
    //   if (error === 'Email already exists') {
    //     return res.status(201).send('Email exist');
    //   } else if (error === 'Phone already exists') {
    //     return res.status(202).send('Phone exist');
    //   }
    // });
  }
});
export default router;
