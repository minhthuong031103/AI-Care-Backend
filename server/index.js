import express from 'express';
import morgan from 'morgan';
import * as dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import connectDB from './mongodb/connect.js';
import bodyParser from 'body-parser';
import openAiRoutes from './routes/openAiRoutes.js';
import userRoutes from './routes/userRoute.js';
import doctorRoutes from './routes/doctorRoute.js';
import postRoutes from './routes/postRoutes.js';
import dalleRoutes from './routes/dalleRoutes.js';
import googleRoutes from './routes/googleRoutes.js';
import passport from 'passport';
dotenv.config();

const app = express();
app.use(cors());
1;
app.use(morgan('dev'));
app.use(bodyParser.json({ limit: '20mb' }));
app.use(express.json({ limit: '50mb' }));
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function (user, cb) {
  cb(null, user);
});
passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});
app.use('/user', userRoutes);
app.use('/api', openAiRoutes);
app.use('/api/dalle', dalleRoutes);
app.use('/doctor', doctorRoutes);
app.use('/api/v1/post', postRoutes);
app.use('/google', googleRoutes);
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
