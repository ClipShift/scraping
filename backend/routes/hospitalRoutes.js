import express from 'express';
import * as hospitalController from '../controllers/hospitalController.js';

const hospitalRouter = express.Router();

hospitalRouter.get('/', hospitalController.home);
hospitalRouter.get('/hospital', hospitalController.getHospitals);
hospitalRouter.get('/hospital/:id', hospitalController.getScheduleById);

export default hospitalRouter;
