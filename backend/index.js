import mongoose from 'mongoose';
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';
import hospitalRouter from './routes/hospitalRoutes.js';

const dirname = path.resolve();
const dotenvPath = path.resolve(`${dirname}/..`, '.env');
dotenv.config({ path: dotenvPath });

const app = express();

app.use(morgan('dev'));
app.use(cors());

app.use('/', hospitalRouter);

mongoose.connect(process.env.DB_URI).then(() => {
  app.listen(process.env.PORT, () => {
    console.log('connected to DB and Started server');
  });
});
