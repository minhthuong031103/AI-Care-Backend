import mongoose from 'mongoose';

const User = new mongoose.Schema({
  name: { type: String, requied: true },
  email: { type: String, required: true },
  phone: { type: String },
  password: { type: String },
  otp: { type: String, expires: '10m' },
});
const UserSchema = mongoose.model('User', User);
export default UserSchema;
