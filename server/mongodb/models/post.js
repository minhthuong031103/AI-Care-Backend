import mongoose from 'mongoose';

const Post = new mongoose.Schema({
  name: { type: String },
  prompt: { type: String },
  photo: {
    type: String,
    default:
      'https://res.cloudinary.com/dci8dhaps/image/upload/v1685243026/light-yellow-background_dvdrwo.jpg',
  },
  date: {
    type: String,
  },
  _userid: { type: String },
});
const PostSchema = mongoose.model('Post', Post);
export default PostSchema;
