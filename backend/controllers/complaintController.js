
import Complaint from '../models/Complaint.js';

// @desc Create a new complaint
// @route POST /api/complaints
// @access Private (Citizen)
export const createComplaint = async (req, res) => {
  try {
    const { category, description, photo, location } = req.body;

    if (!category || !description) {
      return res.status(400).json({
        success: false,
        message: 'Category and description are required.',
      });
    }

    const complaint = await Complaint.create({
      citizen: req.user._id,
      category,
      description,
      photo: photo || '',
      location: {
        address: location?.address || '',
        locality: location?.locality || req.user.locality || '',
        ward: location?.ward || req.user.ward || '',
        city: location?.city || req.user.city || '',
        coordinates: location?.coordinates || {},
      },
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      complaint,
    });
  } catch (error) {
    console.error('Create complaint error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to submit complaint.',
    });
  }
};

// @desc Get complaints submitted by logged-in citizen
// @route GET /api/complaints/my
// @access Private
export const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      citizen: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error('Get complaints error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints.',
    });
  }
};

// @desc Get all complaints
// @route GET /api/complaints
// @access Private (Admin)
export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('citizen', 'fullName email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error('Get all complaints error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints.',
    });
  }
};

// @desc Review a complaint
// @route PATCH /api/complaints/:id/review
// @access Private (Admin)
export const reviewComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    if (complaint.status !== 'Submitted' &&
        complaint.status !== 'Under Review') {
      return res.status(400).json({
        success: false,
        message: 'Only submitted complaints can be reviewed.',
      });
    }

    complaint.status = 'Under Review';
    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Complaint moved to Under Review.',
      complaint,
    });
  } catch (error) {
    console.error('Review complaint error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to review complaint.',
    });
  }
};

// @desc Update complaint status and priority
// @route PATCH /api/complaints/:id/status
// @access Private (Admin)
export const updateComplaintStatus = async (req, res) => {
  try {
    const { status, priority } = req.body;

    const allowedStatuses = [
      'Submitted',
      'Under Review',
      'Assigned',
      'In Progress',
      'Resolved',
      'Reopened',
      'Escalated',
    ];

    const allowedPriorities = ['Low', 'Medium', 'High'];

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    if (status !== undefined) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid complaint status.',
        });
      }
      complaint.status = status;
    }

    if (priority !== undefined) {
      if (!allowedPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid complaint priority.',
        });
      }
      complaint.priority = priority;
    }

    if (status === undefined && priority === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Provide a status or priority to update.',
      });
    }

    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully.',
      complaint,
    });
  } catch (error) {
    console.error('Update complaint error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update complaint.',
    });
  }
};
