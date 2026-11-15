
import mongoose from 'mongoose';

import Task from '../models/Task.js';
import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import Schedule from '../models/Schedule.js';

// Admin assigns a complaint to a staff member
export const assignTask = async (req, res) => {
  try {
    const { complaintId, staffId, scheduleId } = req.body;

    if (!complaintId || !staffId) {
      return res.status(400).json({
        success: false,
        message: 'Complaint ID and Staff ID are required',
      });
    }

    if (
      !mongoose.isValidObjectId(complaintId) ||
      !mongoose.isValidObjectId(staffId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid complaint ID or staff ID',
      });
    }

    if (scheduleId && !mongoose.isValidObjectId(scheduleId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid schedule ID',
      });
    }

    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    const staff = await User.findOne({
      _id: staffId,
      role: 'STAFF',
      isActive: true,
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Active staff member not found',
      });
    }

    // Validate optional schedule
    let schedule = null;

    if (scheduleId) {
      schedule = await Schedule.findById(scheduleId);

      if (!schedule || schedule.status === 'Cancelled') {
        return res.status(404).json({
          success: false,
          message: 'Valid collection schedule not found',
        });
      }

      if (
        !schedule.assignedStaff ||
        schedule.assignedStaff.toString() !== staff._id.toString()
      ) {
        return res.status(400).json({
          success: false,
          message: 'Staff member does not match schedule assignment',
        });
      }

      const complaintLocality =
        complaint.location?.locality?.trim().toLowerCase();

      if (
        !complaintLocality ||
        complaintLocality !== schedule.locality.trim().toLowerCase()
      ) {
        return res.status(400).json({
          success: false,
          message: 'Complaint locality does not match schedule locality',
        });
      }
    }

    const existingTask = await Task.findOne({
      complaint: complaint._id,
    });

    if (existingTask) {
      return res.status(409).json({
        success: false,
        message: 'A task is already assigned to this complaint',
      });
    }

    const task = await Task.create({
      complaint: complaint._id,
      assignedTo: staff._id,
      assignedBy: req.user._id,
      schedule: schedule ? schedule._id : null,
    });

    complaint.status = 'Assigned';
    await complaint.save();

    return res.status(201).json({
      success: true,
      message: 'Task assigned successfully',
      task,
    });
  } catch (error) {
    console.error('Task Assignment Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to assign task',
    });
  }
};

// Admin links an existing task to a collection schedule
export const linkTaskToSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduleId } = req.body;

    if (
      !mongoose.isValidObjectId(id) ||
      !mongoose.isValidObjectId(scheduleId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID or schedule ID',
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    if (task.schedule) {
      return res.status(409).json({
        success: false,
        message: 'Task is already linked to a schedule',
      });
    }

    const schedule = await Schedule.findById(scheduleId);

    if (!schedule || schedule.status === 'Cancelled') {
      return res.status(404).json({
        success: false,
        message: 'Valid schedule not found',
      });
    }

    if (
      !schedule.assignedStaff ||
      schedule.assignedStaff.toString() !== task.assignedTo.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Schedule staff does not match task staff',
      });
    }

    const complaint = await Complaint.findById(task.complaint);

    if (
      !complaint ||
      complaint.location?.locality?.trim().toLowerCase() !==
        schedule.locality.trim().toLowerCase()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Complaint locality does not match schedule locality',
      });
    }

    task.schedule = schedule._id;
    await task.save();

    return res.status(200).json({
      success: true,
      message: 'Task successfully linked to schedule',
      task,
    });
  } catch (error) {
    console.error('Link Task Schedule Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to link task to schedule',
    });
  }
};

// Staff views their assigned tasks
export const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user._id,
    })
      .populate('complaint')
      .populate('schedule')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error('Get My Tasks Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Staff updates task progress
export const updateTaskProgress = async (req, res) => {
  try {
    const { status, staffNotes, completionPhoto } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID',
      });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      assignedTo: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or not assigned to you',
      });
    }

    if (
      status &&
      !['In Progress', 'Completed'].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task status',
      });
    }

    if (status === 'In Progress') {
      if (task.status === 'Completed') {
        return res.status(400).json({
          success: false,
          message: 'Completed task cannot return to In Progress',
        });
      }

      task.status = status;
      task.startedAt = task.startedAt || new Date();

      await Complaint.findByIdAndUpdate(task.complaint, {
        status: 'In Progress',
      });

      if (task.schedule) {
        await Schedule.findByIdAndUpdate(task.schedule, {
          status: 'In Progress',
        });
      }
    }

    if (status === 'Completed') {
      if (task.status === 'Completed') {
        return res.status(400).json({
          success: false,
          message: 'Task is already completed',
        });
      }

      task.status = status;
      task.completedAt = new Date();

      if (task.schedule) {
        await Schedule.findByIdAndUpdate(task.schedule, {
          status: 'Completed',
        });
      }
    }

    if (staffNotes !== undefined) {
      task.staffNotes = staffNotes;
    }

    if (completionPhoto !== undefined) {
      task.completionPhoto = completionPhoto;
    }

    await task.save();

    return res.status(200).json({
      success: true,
      message: 'Task progress updated successfully',
      task,
    });
  } catch (error) {
    console.error('Update Task Progress Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
