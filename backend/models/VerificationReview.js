
import mongoose from 'mongoose';

const verificationReviewSchema = new mongoose.Schema(
  {
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Schedule',
      required: true,
      unique: true,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    decision: {
      type: String,
      enum: ['Community Verified', 'Unverified'],
      required: true,
    },

    evidenceReviewed: {
      type: Boolean,
      required: true,
      default: false,
    },

    reviewNotes: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
    },

    reviewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const VerificationReview = mongoose.model(
  'VerificationReview',
  verificationReviewSchema
);

export default VerificationReview;
