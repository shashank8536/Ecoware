
import mongoose from 'mongoose';

const verificationSettingsSchema = new mongoose.Schema(
  {
    locality: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    threshold: {
      type: Number,
      required: true,
      default: 60,
      min: 55,
      max: 60,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const VerificationSettings = mongoose.model(
  'VerificationSettings',
  verificationSettingsSchema
);

export default VerificationSettings;
