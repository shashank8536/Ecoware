import express from 'express'
import {
  registerCitizen,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
  registerStaff,
} from '../controllers/authController.js'
import {
  protect,
  authorize,
  validateRegisterInput,
} from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/register', validateRegisterInput, registerCitizen)
router.post('/login', loginUser)

router.get('/me', protect, getMe)
router.put('/profile', protect, updateProfile)
router.put('/change-password', protect, changePassword)

router.post(
  '/staff',
  protect,
  authorize('ADMIN', 'SUPERVISOR'),
  registerStaff
)

router.get('/citizen-only', protect, authorize('CITIZEN'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authorized: Citizen access granted.',
    user: req.user.fullName,
    role: req.user.role,
  })
})

router.get(
  '/staff-only',
  protect,
  authorize('STAFF', 'SUPERVISOR', 'ADMIN'),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Authorized: Staff portal access granted.',
      user: req.user.fullName,
      role: req.user.role,
      ward: req.user.ward,
    })
  }
)

router.get('/admin-only', protect, authorize('ADMIN'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authorized: Super Admin access granted.',
    user: req.user.fullName,
  })
})

export default router
