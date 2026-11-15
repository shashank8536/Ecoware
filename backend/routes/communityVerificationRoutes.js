
import express from 'express';

import {
  submitVerification,
  getVerificationResult,
  updateVerificationThreshold,
} from '../controllers/communityVerificationController.js';

import {
  protect,
  authorize,
} from '../middleware/authMiddleware.js';

const router = express.Router();

// Citizen submits Yes/No confirmation.
router.post(
  '/submit',
  protect,
  authorize('CITIZEN'),
  submitVerification
);

// Admin updates locality-wise verification threshold.
router.put(
  '/threshold',
  protect,
  authorize('ADMIN'),
  updateVerificationThreshold
);

// Admin and Supervisor view verification result.
router.get(
  '/result/:scheduleId',
  protect,
  authorize('ADMIN', 'SUPERVISOR'),
  getVerificationResult
);

export default router;
