import express from 'express';
import * as dotenv from 'dotenv';

import { v2 as cloudinary } from 'cloudinary';
import Post from '../mongodb/models/post.js';
import multer from 'multer';
dotenv.config();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });
const router = express.Router();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
router.route('/allofuser').get(async function (req, res) {
  try {
    console.log(req.body);
    const _id = '647945c1b4f6d8c5cb9f153f';
    const posts = await Post.find({ _userid: _id });
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: error });
  }
});

router.route('/upload').post(async function (req, res) {
  try {
    const { name, prompt, photo, date, _userid } = req.body;
    var photoUrl = '';
    if (photo) {
      photoUrl = await cloudinary.uploader.upload(photo);
    } else {
      photoUrl =
        'http://bdbackgrounds.com/media/zoo/images/1-lightyellow-paper_7aebeb667bb535ad797b057b7234cfb9.jpg';
    }

    const newPost = await Post.create({
      name,
      prompt,
      photo: photoUrl.url,
      date,
      _userid: _userid,
    })
      .then(function () {
        res.status(200).send({ success: true });
      })
      .catch(function (error) {
        console.log(error);
        res.status(500).send(error);
      });
  } catch (error) {
    console.log(error);
    res.status(501).send({ success: false, data: error });
  }
});

export default router;
