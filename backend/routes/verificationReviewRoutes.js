
import express from 'express';

import {
  submitVerificationReview,
  getVerificationReview,
} from '../controllers/verificationReviewController.js';

import {
  protect,
  authorize,
} from '../middleware/authMiddleware.js';

const router = express.Router();

// Municipal Admin records the final verification decision.
router.post(
  '/submit',
  protect,
  authorize('ADMIN'),
  submitVerificationReview
);

// Municipal Admin views the recorded verification decision.
router.get(
  '/:scheduleId',
  protect,
  authorize('ADMIN'),
  getVerificationReview
);

export default router;
