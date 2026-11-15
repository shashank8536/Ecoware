
import mongoose from 'mongoose';

import VerificationSettings from '../models/VerificationSettings.js';
import VerificationReview from '../models/VerificationReview.js';
import CommunityVerification from '../models/CommunityVerification.js';
import Schedule from '../models/Schedule.js';
import Task from '../models/Task.js';
import Household from '../models/Household.js';
import HouseholdMember from '../models/HouseholdMember.js';

const DEFAULT_THRESHOLD = 60;
const VERIFICATION_WINDOW_HOURS = 12;

// Calculate eligible households for a locality.
const getEligibleHouseholdIds = async (locality) => {
  const escapedLocality = locality.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  );

  const households = await Household.find({
    locality: new RegExp(`^${escapedLocality}$`, 'i'),
    isActive: true,
  }).select('_id');

  const householdIds = households.map((item) => item._id);

  if (householdIds.length === 0) {
    return [];
  }

  const memberships = await HouseholdMember.aggregate([
    {
      $match: {
        household: { $in: householdIds },
        isActive: true,
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'citizen',
        foreignField: '_id',
        as: 'citizenDetails',
      },
    },
    { $unwind: '$citizenDetails' },
    {
      $match: {
        'citizenDetails.role': 'CITIZEN',
        'citizenDetails.isActive': true,
      },
    },
    {
      $group: {
        _id: '$household',
      },
    },
  ]);

  return memberships.map((item) => item._id);
};

// Admin reviews collection evidence and records a final decision.
export const submitVerificationReview = async (req, res) => {
  try {
    const {
      scheduleId,
      decision,
      evidenceReviewed,
      reviewNotes,
    } = req.body;

    if (!mongoose.isValidObjectId(scheduleId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid schedule ID.',
      });
    }

    if (!['Community Verified', 'Unverified'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: 'Decision must be Community Verified or Unverified.',
      });
    }

    if (evidenceReviewed !== true) {
      return res.status(400).json({
        success: false,
        message: 'Collection evidence must be reviewed before recording a decision.',
      });
    }

    if (
      typeof reviewNotes !== 'string' ||
      reviewNotes.trim().length < 10
    ) {
      return res.status(400).json({
        success: false,
        message: 'Review notes must contain at least 10 characters.',
      });
    }

    const schedule = await Schedule.findById(scheduleId);

    if (!schedule || schedule.status === 'Cancelled') {
      return res.status(404).json({
        success: false,
        message: 'Valid collection schedule not found.',
      });
    }

    const completedTask = await Task.findOne({
      schedule: scheduleId,
      status: 'Completed',
      completedAt: { $ne: null },
    });

    if (!completedTask) {
      return res.status(400).json({
        success: false,
        message: 'Collection task must be completed before review.',
      });
    }

    const deadline = new Date(
      completedTask.completedAt.getTime() +
        VERIFICATION_WINDOW_HOURS * 60 * 60 * 1000
    );

    if (new Date() < deadline) {
      return res.status(400).json({
        success: false,
        message: 'Administrative review is available after the 12-hour verification window closes.',
        deadline,
      });
    }

    const eligibleHouseholdIds =
      await getEligibleHouseholdIds(schedule.locality);

    const totalEligible = eligibleHouseholdIds.length;

    const responses = await CommunityVerification.find({
      schedule: scheduleId,
      household: { $in: eligibleHouseholdIds },
    });

    const yesCount = responses.filter(
      (item) => item.response === 'Yes'
    ).length;

    const noCount = responses.filter(
      (item) => item.response === 'No'
    ).length;

    const positivePercentage =
      totalEligible > 0
        ? (yesCount / totalEligible) * 100
        : 0;

    const settings = await VerificationSettings.findOne({
      locality: schedule.locality.trim(),
    });

    const threshold = settings
      ? settings.threshold
      : DEFAULT_THRESHOLD;

    // Community Verified requires the configured positive threshold.
    if (decision === 'Community Verified') {
      if (totalEligible === 0) {
        return res.status(400).json({
          success: false,
          message: 'No eligible registered households were found for this schedule.',
        });
      }

      if (positivePercentage < threshold) {
        return res.status(400).json({
          success: false,
          message: 'Positive household confirmations have not reached the required threshold.',
          totalEligibleHouseholds: totalEligible,
          yesCount,
          noCount,
          positivePercentage: Number(positivePercentage.toFixed(2)),
          threshold,
        });
      }
    }

    const review = await VerificationReview.create({
      schedule: scheduleId,
      reviewedBy: req.user._id,
      decision,
      evidenceReviewed: true,
      reviewNotes: reviewNotes.trim(),
    });

    return res.status(201).json({
      success: true,
      message: 'Administrative verification decision recorded successfully.',
      review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An administrative review already exists for this schedule.',
      });
    }

    console.error('Submit verification review error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while recording administrative review.',
    });
  }
};

// Admin views the recorded decision for a schedule.
export const getVerificationReview = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    if (!mongoose.isValidObjectId(scheduleId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid schedule ID.',
      });
    }

    const review = await VerificationReview.findOne({
      schedule: scheduleId,
    })
      .populate('reviewedBy', 'fullName email role')
      .populate('schedule');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Administrative review not found.',
      });
    }

    return res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    console.error('Get verification review error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve administrative review.',
    });
  }
};
