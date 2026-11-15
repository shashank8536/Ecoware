
import mongoose from 'mongoose';

const communityVerificationSchema = new mongoose.Schema(
  {
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Schedule',
      required: true,
      index: true,
    },

    household: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Household',
      required: true,
    },

    // Citizen who actually submitted the household response
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    locality: {
      type: String,
      required: true,
      trim: true,
    },

    response: {
      type: String,
      enum: ['Yes', 'No'],
      required: true,
    },

    respondedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// One response per household per collection schedule.
communityVerificationSchema.index(
  { schedule: 1, household: 1 },
  {
    unique: true,
    partialFilterExpression: {
      household: { $exists: true },
    },
  }
);

// Prevent the same citizen from submitting twice for a schedule.
communityVerificationSchema.index(
  { schedule: 1, citizen: 1 },
  { unique: true }
);

const CommunityVerification = mongoose.model(
  'CommunityVerification',
  communityVerificationSchema
);

export default CommunityVerification;
