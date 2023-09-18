import { parse } from 'csv-parse/sync';
import { promises as fs } from 'node:fs';
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import Hospital from '../backend/models/Hospital.js';

const content = await fs.readFile('../raw_schedules/nmhSchedule.csv');

const jsonContent = parse(content, {
  columns: true,
  group_columns_by_name: true,
  relax_column_count: true,
});

const records = {};

jsonContent.forEach((data) => {
  const doctorObject = {};
  const dayTimeObject = {};

  if (typeof data.DaysTime !== 'string') {
    for (let i = 0; i < data.DaysTime.length; i += 1) {
      if (data['OPD Timing'][i] && data.DaysTime[i]) {
        if (dayTimeObject[data.DaysTime[i]]) {
          dayTimeObject[data.DaysTime[i]] = [...dayTimeObject[data.DaysTime[i]], data['OPD Timing'][i]];
        } else {
          dayTimeObject[data.DaysTime[i]] = [data['OPD Timing'][i]];
        }
      }
    }
  } else {
    dayTimeObject[data.DaysTime] = [data['OPD Timing']];
  }
  if (data['Doctor’s Name']) {
    if (records[data.DEPARTMENT]?.[data['Doctor’s Name']]) {
      doctorObject[data['Doctor’s Name']] = { ...records[data.DEPARTMENT]?.[data['Doctor’s Name']], ...dayTimeObject };
    } else {
      doctorObject[data['Doctor’s Name']] = { ...dayTimeObject };
    }
  }
  records[data.Department] = { ...records[data.Department], ...doctorObject };
});

const fullDetails = { records };

const about = await fs.readFile('../hospital_details/nmhDetails.txt');
fullDetails.about = JSON.parse(about);

const dirname = path.resolve();
const dotenvPath = path.resolve(`${dirname}/..`, '.env');
dotenv.config({ path: dotenvPath });

await mongoose.connect(process.env.DB_URI).then(() => {
  console.log('connected to db');
});

const nmh = await Hospital.findOne({ 'about.name': 'Narinder Mohan Hospital & Heart Centre' });

if (nmh) {
  await Hospital.findOneAndReplace({ 'about.name': 'Narinder Mohan Hospital & Heart Centre' }, fullDetails)
    .then((doc) => console.log(doc))
    .catch((err) => console.log(err));
} else {
  const nmhObj = new Hospital(fullDetails);
  await nmhObj.save();
}

mongoose.connection.close();
