import express from 'express';
import morgan from 'morgan';
import * as dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './mongodb/connect.js';
import bodyParser from 'body-parser';
import openAiRoutes from './routes/openAiRoutes.js';
import userRoutes from './routes/userRoute.js';
import doctorRoutes from './routes/doctorRoute.js';
dotenv.config();

const app = express();
app.use(cors());

app.use(morgan('dev'));
app.use(bodyParser.json({ limit: '20mb' }));
app.use(express.json({ limit: '50mb' }));

app.use('/user', userRoutes);
app.use('/api', openAiRoutes);
app.use('/doctor', doctorRoutes);
app.get('/', async function (req, res) {
  return res.send('hello world');
});

const startServer = async function () {
  try {
    connectDB(process.env.MONGODB_URL)
      .then(function () {
        app.listen(8080, function () {
          console.log('Server has started on port 8080 ');
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  } catch (error) {
    console.log(error);
  }
};

startServer();
