import mongoose from 'mongoose';

const Doctor = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  certificate: [{ type: String }],
  description: { type: String },
  address: { type: String },
  avatar: { type: String },
  email: { type: String, requied: true },
});
const DoctorSchema = mongoose.model('Doctor', Doctor);
export default DoctorSchema;
