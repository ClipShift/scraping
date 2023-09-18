import dotenv from 'dotenv';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { promises as fs } from 'node:fs';
import mongoose from 'mongoose';
import Hospital from '../backend/models/Hospital.js';

const content = await fs.readFile('../raw_schedules/ysdSchedule.csv');

const jsonContent = parse(content, {
  columns: true,
  group_columns_by_name: true,
  relax_column_count: true,
});

const records = {};

jsonContent.forEach((data) => {
  const doctorObject = {};
  const dayTimeObject = {};
  if (records[data.DEPARTMENT]?.[data["DOCTOR'S NAME"]]?.[data.DAY]) {
    dayTimeObject[data.DAY] = [...records[data.DEPARTMENT][data["DOCTOR'S NAME"]][data.DAY], data.TIME];
  } else {
    dayTimeObject[data.DAY] = [data.TIME];
  }
  if (records[data.DEPARTMENT]?.[data["DOCTOR'S NAME"]]) {
    doctorObject[data["DOCTOR'S NAME"]] = { ...records[data.DEPARTMENT]?.[data["DOCTOR'S NAME"]], ...dayTimeObject };
  } else {
    doctorObject[data["DOCTOR'S NAME"]] = { ...dayTimeObject };
  }
  records[data.DEPARTMENT] = { ...records[data.DEPARTMENT], ...doctorObject };
});

const fullDetails = { records };

const about = await fs.readFile('../hospital_details/ysdDetails.txt');
fullDetails.about = JSON.parse(about);

const dirname = path.resolve();
const dotenvPath = path.resolve(`${dirname}/..`, '.env');
dotenv.config({ path: dotenvPath });

await mongoose.connect(process.env.DB_URI).then(() => {
  console.log('connected to db');
});

const ysd = await Hospital.findOne({ 'about.name': 'Yashoda Super Speciality Hospitals Pvt. Ltd.' });

if (ysd) {
  await Hospital.findOneAndReplace({ 'about.name': 'Yashoda Super Speciality Hospitals Pvt. Ltd.' }, fullDetails)
    .then((doc) => console.log(doc))
    .catch((err) => console.log(err));
} else {
  const ysdObj = new Hospital(fullDetails);
  await ysdObj.save();
}

mongoose.connection.close();
