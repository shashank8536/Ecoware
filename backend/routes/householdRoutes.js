
import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';

import {
  createHousehold,
  addHouseholdMember,
  updateHousehold,
} from '../controllers/householdController.js';

const router = express.Router();

// Only Admin can register households
router.post(
  '/',
  protect,
  authorize('ADMIN'),
  createHousehold
);

// Only Admin can link citizens to households
router.post(
  '/add-member',
  protect,
  authorize('ADMIN'),
  addHouseholdMember
);

// Only Admin can update household details
router.put(
  '/:id',
  protect,
  authorize('ADMIN'),
  updateHousehold
);

export default router;
