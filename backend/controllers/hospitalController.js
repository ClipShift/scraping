import Hospital from '../models/Hospital.js';

export const home = (req, res) => {
  try {
    res.status(200).json({ home: 'hospital routes' });
  } catch (error) {
    res.status(503).json({ error });
  }
};

export const getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find().select('about');
    res.status(200).json(hospitals);
  } catch (error) {
    res.status(503).json({ error });
  }
};

export const getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await Hospital.findById(id);
    res.status(200).json(schedule);
  } catch (error) {
    res.status(503).json({ error });
  }
};
