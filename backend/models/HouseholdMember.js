
import mongoose from 'mongoose';

const householdMemberSchema = new mongoose.Schema(
  {
    household: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Household',
      required: true,
    },

    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    isPrimary: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// A citizen can belong to only one active household.
householdMemberSchema.index(
  { citizen: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true },
  }
);

// A citizen cannot be added twice to the same household.
householdMemberSchema.index(
  { household: 1, citizen: 1 },
  { unique: true }
);

const HouseholdMember = mongoose.model(
  'HouseholdMember',
  householdMemberSchema
);

export default HouseholdMember;
