
import mongoose from 'mongoose';
import Schedule from '../models/Schedule.js';
import User from '../models/User.js';

// Admin creates a collection schedule
export const createSchedule = async (req, res) => {
  try {
    const {
      title,
      locality,
      ward,
      city,
      wasteType,
      collectionDate,
      startTime,
      endTime,
      assignedStaff,
      instructions,
    } = req.body;

    if (
      !title ||
      !locality ||
      !ward ||
      !city ||
      !collectionDate ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required schedule details',
      });
    }

    if (assignedStaff) {
      if (!mongoose.Types.ObjectId.isValid(assignedStaff)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid staff ID',
        });
      }

      const staff = await User.findOne({
        _id: assignedStaff,
        role: 'STAFF',
        isActive: true,
      });

      if (!staff) {
        return res.status(404).json({
          success: false,
          message: 'Active staff member not found',
        });
      }
    }

    const schedule = await Schedule.create({
      title,
      locality,
      ward,
      city,
      wasteType,
      collectionDate,
      startTime,
      endTime,
      assignedStaff: assignedStaff || null,
      instructions,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Collection schedule created successfully',
      schedule,
    });
  } catch (error) {
    console.error('Create Schedule Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Citizens view schedules for their locality
export const getLocalitySchedules = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const schedules = await Schedule.find({
      locality: user.locality,
      status: { $ne: 'Cancelled' },
    })
      .populate('assignedStaff', 'fullName staffId')
      .sort({ collectionDate: 1 });

    return res.status(200).json({
      success: true,
      count: schedules.length,
      schedules,
    });
  } catch (error) {
    console.error('Get Locality Schedules Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin views all schedules
export const getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate('assignedStaff', 'fullName staffId')
      .populate('createdBy', 'fullName email')
      .sort({ collectionDate: 1 });

    return res.status(200).json({
      success: true,
      count: schedules.length,
      schedules,
    });
  } catch (error) {
    console.error('Get All Schedules Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin updates a schedule
export const updateSchedule = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid schedule ID',
      });
    }

    const updates = { ...req.body };

    delete updates.createdBy;

    if (updates.assignedStaff) {
      const staff = await User.findOne({
        _id: updates.assignedStaff,
        role: 'STAFF',
        isActive: true,
      });

      if (!staff) {
        return res.status(404).json({
          success: false,
          message: 'Active staff member not found',
        });
      }
    }

    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Schedule updated successfully',
      schedule,
    });
  } catch (error) {
    console.error('Update Schedule Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin cancels a schedule
export const cancelSchedule = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid schedule ID',
      });
    }

    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      { status: 'Cancelled' },
      { new: true, runValidators: true }
    );

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Schedule cancelled successfully',
      schedule,
    });
  } catch (error) {
    console.error('Cancel Schedule Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
