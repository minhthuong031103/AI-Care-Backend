import mongoose from 'mongoose';

const connectDB = async function (url) {
  mongoose.set('strictQuery', true);

  mongoose
    .connect(url)
    .then(function () {
      console.log('MongoDB connected');
    })
    .catch(function (error) {
      console.log(error);
    });
};
export default connectDB;
