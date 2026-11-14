import User from '../models/User.js'
import generateToken from '../utils/generateToken.js'

const formatUserResponse = (user) => {
  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    ward: user.ward,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    citizenId: user.citizenId,
    gender: user.gender,
    houseStreet: user.houseStreet,
    locality: user.locality,
    city: user.city,
    state: user.state,
    pinCode: user.pinCode,
    emailVerified: user.emailVerified,
    staffId: user.staffId,
    designation: user.designation,
    department: user.department,
    assignedVehicle: user.assignedVehicle,
    shiftTimings: user.shiftTimings,
    depotBase: user.depotBase,
    supervisor: user.supervisor,
  }
}

export const registerCitizen = async (req, res) => {
  try {
    const { name, email, phone, password, ward, locality, city, houseStreet, pinCode } = req.body

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      })
    }

    const user = await User.create({
      fullName: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
      role: 'CITIZEN',
      ward: ward || 'Ward 1',
      locality: locality || '',
      city: city || 'Bengaluru',
      houseStreet: houseStreet || '',
      pinCode: pinCode || '',
      emailVerified: false,
    })

    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
    })

    res.status(201).json({
      success: true,
      message: 'Citizen account created successfully.',
      token,
      user: formatUserResponse(user),
    })
  } catch (error) {
    console.error('[Register Error]:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration.',
    })
  }
}

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      })
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User does not exist.',
      })
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact administration.',
      })
    }

    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      })
    }

    user.lastLogin = new Date()
    await user.save({ validateBeforeSave: false })

    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
    })

    res.status(200).json({
      success: true,
      message: `Login successful. Welcome ${user.fullName}.`,
      token,
      user: formatUserResponse(user),
    })
  } catch (error) {
    console.error('[Login Error]:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login.',
    })
  }
}

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      })
    }

    res.status(200).json({
      success: true,
      user: formatUserResponse(user),
    })
  } catch (error) {
    console.error('[GetMe Error]:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching user profile.',
    })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      })
    }

    const {
      fullName,
      phone,
      gender,
      houseStreet,
      locality,
      city,
      state,
      pinCode,
      ward,
    } = req.body

    if (fullName) user.fullName = fullName.trim()
    if (phone) user.phone = phone.trim()
    if (gender) user.gender = gender
    if (houseStreet !== undefined) user.houseStreet = houseStreet.trim()
    if (locality !== undefined) user.locality = locality.trim()
    if (city !== undefined) user.city = city.trim()
    if (state !== undefined) user.state = state.trim()
    if (pinCode !== undefined) user.pinCode = pinCode.trim()
    if (ward !== undefined) user.ward = ward.trim()

    await user.save()

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: formatUserResponse(user),
    })
  } catch (error) {
    console.error('[UpdateProfile Error]:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating profile.',
    })
  }
}

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current password and new password.',
      })
    }

    if (newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters with letters and numbers.',
      })
    }

    const user = await User.findById(req.user._id).select('+password')

    const isMatch = await user.matchPassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password does not match.',
      })
    }

    user.password = newPassword
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    })
  } catch (error) {
    console.error('[ChangePassword Error]:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating password.',
    })
  }
}

export const registerStaff = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      designation,
      ward,
      department,
      assignedVehicle,
      shiftTimings,
      depotBase,
      supervisor,
    } = req.body

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A staff member with this email already exists.',
      })
    }

    const staff = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: password || 'Staff@123',
      role: 'STAFF',
      designation: designation || 'Waste Collection Staff',
      ward: ward || 'Ward 02',
      department: department || 'Sanitation & Solid Waste Management',
      assignedVehicle: assignedVehicle || 'WT-01 (Compactor)',
      shiftTimings: shiftTimings || '07:00 AM – 03:30 PM (Mon – Sat)',
      depotBase: depotBase || 'Central Depot',
      supervisor: supervisor || 'Field Operations Officer',
    })

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully.',
      staff: formatUserResponse(staff),
    })
  } catch (error) {
    console.error('[RegisterStaff Error]:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating staff account.',
    })
  }
}
