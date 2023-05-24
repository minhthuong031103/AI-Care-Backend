import mongoose from 'mongoose';

const User = new mongoose.Schema({
  name: { type: String, requied: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
});
const UserSchema = mongoose.model('User', User);
export default UserSchema;
