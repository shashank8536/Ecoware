
import express from 'express';

import { protect, authorize } from '../middleware/authMiddleware.js';

import {
  createSchedule,
  getLocalitySchedules,
  getAllSchedules,
  updateSchedule,
  cancelSchedule,
} from '../controllers/scheduleController.js';

const router = express.Router();

// Admin creates a collection schedule
router.post(
  '/',
  protect,
  authorize('ADMIN'),
  createSchedule
);

// Citizen views schedules for their locality
router.get(
  '/my-locality',
  protect,
  authorize('CITIZEN'),
  getLocalitySchedules
);

// Admin views all schedules
router.get(
  '/',
  protect,
  authorize('ADMIN'),
  getAllSchedules
);

// Admin updates a schedule
router.put(
  '/:id',
  protect,
  authorize('ADMIN'),
  updateSchedule
);

// Admin cancels a schedule
router.patch(
  '/:id/cancel',
  protect,
  authorize('ADMIN'),
  cancelSchedule
);

export default router;
