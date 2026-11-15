
import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';

import {
  assignTask,
  getMyTasks,
  updateTaskProgress,
  linkTaskToSchedule,
} from '../controllers/taskController.js';

const router = express.Router();

// Admin assigns a complaint to staff
router.post('/assign', protect, authorize('ADMIN'), assignTask);

// Admin links an existing task to a collection schedule
router.patch(
  '/:id/link-schedule',
  protect,
  authorize('ADMIN'),
  linkTaskToSchedule
);

// Staff views their assigned tasks
router.get('/my', protect, authorize('STAFF'), getMyTasks);

// Staff updates task progress
router.patch('/:id/progress', protect, authorize('STAFF'), updateTaskProgress);

export default router;
