
import mongoose from 'mongoose';
import { randomBytes } from 'node:crypto';

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      unique: true,
      immutable: true,
    },

    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    photo: {
      type: String,
      default: '',
    },

    location: {
      address: { type: String, trim: true },
      locality: { type: String, trim: true },
      ward: { type: String, trim: true },
      city: { type: String, trim: true },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },

    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },

    status: {
      type: String,
      enum: [
        'Submitted',
        'Under Review',
        'Assigned',
        'In Progress',
        'Resolved',
        'Reopened',
        'Escalated',
      ],
      default: 'Submitted',
    },
  },
  { timestamps: true }
);

// Automatically generate a unique complaint ID
complaintSchema.pre('validate', function () {
  if (this.isNew && !this.complaintId) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const uniqueCode = randomBytes(3).toString('hex').toUpperCase();

    this.complaintId = `ECW-CMP-${date}-${uniqueCode}`;
  }
});

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;
