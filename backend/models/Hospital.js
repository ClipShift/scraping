/*eslint-disable*/
import mongoose from 'mongoose';

const HospitalSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  records: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  about:{
    type: {
      name: String,
      address: String,
      number: String,
      email: String,
      url: String
    },
    required: true
  }
});

export default mongoose.model('Hospital', HospitalSchema);