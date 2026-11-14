import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please provide full name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['CITIZEN', 'STAFF', 'SUPERVISOR', 'ADMIN'],
      default: 'CITIZEN',
      uppercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    citizenId: {
      type: String,
      unique: true,
      sparse: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
      default: 'Prefer not to say',
    },
    houseStreet: { type: String, trim: true },
    locality: { type: String, trim: true },
    city: { type: String, trim: true, default: 'Bengaluru' },
    state: { type: String, trim: true, default: 'Karnataka' },
    pinCode: { type: String, trim: true },
    ward: { type: String, trim: true, default: 'Ward 1' },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    staffId: {
      type: String,
      unique: true,
      sparse: true,
    },
    designation: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
      default: 'Sanitation & Solid Waste Management',
    },
    assignedVehicle: {
      type: String,
      trim: true,
    },
    shiftTimings: {
      type: String,
      trim: true,
    },
    depotBase: {
      type: String,
      trim: true,
    },
    supervisor: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

userSchema.pre('save', async function (next) {
  if (this.isNew) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    if (this.role === 'CITIZEN' && !this.citizenId) {
      this.citizenId = `ECW-CIT-${randomSuffix}`
    } else if (this.role === 'STAFF' && !this.staffId) {
      this.staffId = `STF-${randomSuffix}`
    } else if (this.role === 'ADMIN' && !this.staffId) {
      this.staffId = `ADM-${randomSuffix}`
    }
  }

  if (!this.isModified('password')) {
    return next()
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

const User = mongoose.model('User', userSchema)

export default User
