import express from 'express';
import * as dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../mongodb/models/user.js';
import History from '../mongodb/models/historyModel.js';
import otpGenerator from 'otp-generator';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
dotenv.config();

const router = express.Router();

router.route('/login').post(async function (req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) return res.status(500).send('error');

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
          username: user.name,
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
          const newUser = User.create({
            name,
            email,
            phone,
            password: hashedPassword,
          });
          newUser
            .then(function (data) {
              const name = data.name;
              const _id = data._id.toString();
              const words = name.split(' ');
              const _username =
                words.length > 1 ? words[words.length - 1] : words[0]; //ten
              let messages = [];
              messages.push(
                {
                  role: 'system',
                  content: `Tôi tên là ${_username}. Bạn tên là EmotiBot, một trợ lý ảo của nền tảng AI-Care và là một nhà chuyên gia tư vấn tâm lý, bạn sẽ giúp đỡ tôi về vấn đề tâm lý, bạn có thể ghi nhớ tên tôi và các câu chuyện để đưa ra lời khuyên.`,
                },

                {
                  role: 'user',
                  content: `Tôi tên là ${_username} (hãy ghi nhớ tên của tôi, tên của bạn và nội dung tôi chia sẻ về sau, Hãy trò chuyện với tôi bằng tên của tôi và tên của bạn là Emotibot và khi được hỏi những câu "Tôi tên là gì?/ Bạn còn nhớ tên tôi không?/ Bạn có biết tên tôi là gì không?" thì hãy chỉ trả lời "Tên của bạn là ${_username}". Khi tôi hỏi "Tên của bạn là gì? Bạn tên gì? Bạn là ai?" hãy trả lời "Tôi là EmotiBot, một trợ lý ảo của nền tảng AI-Care " bạn có thể tư vấn tâm lý và giúp đỡ những người đang gặp vấn đề về tâm lý `,
                },
                {
                  role: 'assistant',
                  content: `Dạ, tôi sẽ ghi nhớ tên của bạn là ${_username} và nội dung các câu chuyện bạn chia sẻ để có thể tư vấn tâm lý và đưa ra lời khuyên hữu ích cho bạn. Khi bạn hỏi tôi về tên của mình, tôi sẽ trả lời là "Tôi là EmotiBot, một trợ lý ảo của nền tảng AI-Care". `,
                }
              );
              const hisstory = History.create({
                messages: messages,
                user: _id,
              });
              hisstory.then(function () {
                res.status(200).send({ success: true });
              });
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
    const foundUser = await User.findOne({ _id });

    // const update = await User.updateOne({ _id: _id }, body);
    const { email, phone, name } = user;
    const existEmail = new Promise(async function (resolve, reject) {
      const emailexist = await User.findOne({ email });

      if (emailexist && emailexist.email != foundUser.email)
        reject('Email already exists');

      resolve();
    });

    const existPhone = new Promise(async function (resolve, reject) {
      const phoneexist = await User.findOne({ phone });

      if (phoneexist && phoneexist.phone != foundUser.phone)
        reject('Phone already exists');

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
  }
});

router.route('/changepassword').put(async function updateUser(req, res) {
  try {
    const { _id } = req.body;
    const user = req.body.user;
    console.log(_id);
    // const update = await User.updateOne({ _id: _id }, body);
    const password = user.password;
    const newPassword = user.newPassword;

    const body = req.body.user;

    const foundUser = await User.findOne({ _id });
    if (!foundUser) return res.status(405).send('User not found');
    bcrypt.compare(password, foundUser.password).then(function (check) {
      if (!check) return res.status(203).send('Password not correct');
      else {
        bcrypt.hash(newPassword, 10).then(async function (hashedPassword) {
          const update = await User.updateOne(
            { _id: _id },
            { password: hashedPassword }
          );
          if (update) return res.status(200).send('User Updated');
          else return res.status(501).send({ error });
        });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(503).send({ error });
  }
});
//sendmail
async function sendOTPtoEmail(email, otp) {
  // create a nodemailer transporter using your SMTP credentials
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'solokill2001@gmail.com', // your email address
      pass: 'kwounewjdeubkbeo', // your email password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: 'solokill2001@gmail.com', // sender address
    to: email, // list of receivers
    subject: 'Mã xác nhận quên mật khẩu', // subject line

    html: `
    <head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your login</title>
  <!--[if mso]><style type="text/css">body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }</style><![endif]-->
</head>

<body style="font-family: Helvetica, Arial, sans-serif; margin: 0px; padding: 0px; background-color: #ffffff;">
  <table role="presentation"
    style="width: 100%; border-collapse: collapse; border: 0px; border-spacing: 0px; font-family: Arial, Helvetica, sans-serif; background-color: rgb(239, 239, 239);">
    <tbody>
      <tr>
        <td align="center" style="padding: 1rem 2rem; vertical-align: top; width: 100%;">
          <table role="presentation" style="max-width: 600px; border-collapse: collapse; border: 0px; border-spacing: 0px; text-align: left;">
            <tbody>
              <tr>
                <td style="padding: 40px 0px 0px;">
                  <div style="text-align: left;">
                    <div style="padding-bottom: 20px;"><img src="https://i.ibb.co/Qbnj4mz/logo.png" alt="Company" style="width: 56px;"></div>
                  </div>
                  <div style="padding: 20px; background-color: rgb(255, 255, 255);">
                    <div style="color: rgb(0, 0, 0); text-align: left;">
                      <h1 style="margin: 1rem 0">Mã OTP</h1>
                      <p style="padding-bottom: 16px">Hãy sử dụng mã OTP bên dưới để đặt lại mật khẩu.</p>
                      <p style="padding-bottom: 16px"><strong style="font-size: 130%">${otp}</strong></p>
                      <p style="padding-bottom: 16px">Nếu bạn không gửi yêu cầu, hãy bỏ qua tin nhắn này.</p>
                      <p style="padding-bottom: 16px">Xin cám ơn,<br>AI-Care.</p>
                    </div>
                  </div>
                
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  `,
  });

  console.log('Message sent: %s', info.messageId);
}
router.route('/forgot').post(async function (req, res) {
  try {
    const { email } = req.body;
    console.log(email);
    const user = await User.findOne({ email: email });
    if (!user) return res.status(202).send('error');
    else {
      const OTP = await otpGenerator.generate(6, {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
      if (!email) return res.status(501).send({ error: 'invalid email' });

      const user = await User.findOne({ email });

      if (!user)
        return res.status(501).send({ error: 'could not find the user' });

      user.otp = OTP;
      const _id = user._id;

      await User.updateOne({ _id: _id }, { otp: OTP });
      await sendOTPtoEmail(email, OTP);

      return res.status(201).send({ _id: _id });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: error });
  }
});
router.route('/checkotp').post(async function (req, res) {
  try {
    const { otp, _id } = req.body;

    const foundUser = await User.findOne({ _id: _id });
    if (!foundUser) return res.status(202).send('error');
    else {
      if (otp === foundUser.otp) {
        return res.status(201).send('ok');
      } else {
        return res.status(203).send('sai');
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: error });
  }
});
router.route('/resetpassword').put(async function (req, res) {
  try {
    const { newPassword, _id } = req.body;

    const foundUser = await User.findOne({ _id: _id });
    if (!foundUser) return res.status(202).send('error');
    else {
      bcrypt.hash(newPassword, 10).then(async function (hashedPassword) {
        const update = await User.updateOne(
          { _id: _id },
          { password: hashedPassword }
        );
        if (update) return res.status(201).send('User Updated');
        else return res.status(501).send({ error });
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: error });
  }
});
export default router;
