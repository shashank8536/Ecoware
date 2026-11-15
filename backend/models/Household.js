
import mongoose from 'mongoose';
import { randomBytes } from 'node:crypto';

const householdSchema = new mongoose.Schema(
  {
    householdId: {
      type: String,
      unique: true,
      immutable: true,
    },

    houseStreet: {
      type: String,
      required: true,
      trim: true,
    },

    locality: {
      type: String,
      required: true,
      trim: true,
    },

    ward: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    pinCode: {
      type: String,
      trim: true,
      default: '',
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

householdSchema.pre('validate', function () {
  if (this.isNew && !this.householdId) {
    const uniqueCode = randomBytes(4).toString('hex').toUpperCase();
    this.householdId = `ECW-HH-${uniqueCode}`;
  }
});

const Household = mongoose.model('Household', householdSchema);

export default Household;
