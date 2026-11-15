
import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      unique: true,
    },

    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Schedule',
      default: null,
      index: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    status: {
      type: String,
      enum: ['Assigned', 'In Progress', 'Completed'],
      default: 'Assigned',
    },

    staffNotes: {
      type: String,
      trim: true,
      default: '',
    },

    completionPhoto: {
      type: String,
      default: '',
    },

    assignedAt: {
      type: Date,
      default: Date.now,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Task = mongoose.model('Task', taskSchema);

export default Task;
