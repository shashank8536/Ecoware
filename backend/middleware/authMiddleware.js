import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1]

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'ecoware_jwt_super_secret_key_member3_2026'
      )

      const user = await User.findById(decoded.id).select('-password')
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User belonging to this token no longer exists.',
        })
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account has been deactivated. Please contact administrator.',
        })
      }

      req.user = user
      next()
    } catch (error) {
      console.error('[Auth Middleware Error]:', error.message)
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token validation failed.',
      })
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided in Authorization header.',
    })
  }
}

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user?.role || 'Unknown'}' is not authorized to access this resource. Required role: [${roles.join(', ')}].`,
      })
    }
    next()
  }
}

export const validateRegisterInput = (req, res, next) => {
  const { name, email, phone, password } = req.body

  if (!name || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Name is required and must be at least 2 characters.',
    })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/
  if (!email || !emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'A valid email address is required.',
    })
  }

  if (!phone || phone.trim().length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Phone number must be at least 10 digits.',
    })
  }

  if (
    !password ||
    password.length < 8 ||
    !/[a-zA-Z]/.test(password) ||
    !/\d/.test(password)
  ) {
    return res.status(400).json({
      success: false,
      message:
        'Password must be at least 8 characters long and contain both letters and numbers.',
    })
  }

  next()
}
