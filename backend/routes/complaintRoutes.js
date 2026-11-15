
import express from 'express';

import {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  reviewComplaint,
  updateComplaintStatus,
} from '../controllers/complaintController.js';

import {
  protect,
  authorize,
} from '../middleware/authMiddleware.js';

const router = express.Router();

// Citizen routes
router.post('/', protect, createComplaint);
router.get('/my', protect, getMyComplaints);

// Admin routes
router.get('/', protect, authorize('ADMIN'), getAllComplaints);
router.patch('/:id/review', protect, authorize('ADMIN'), reviewComplaint);
router.patch('/:id/status', protect, authorize('ADMIN'), updateComplaintStatus);

export default router;
