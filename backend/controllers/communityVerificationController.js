
import mongoose from 'mongoose';

import CommunityVerification from '../models/CommunityVerification.js';
import VerificationSettings from '../models/VerificationSettings.js';
import Schedule from '../models/Schedule.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import Household from '../models/Household.js';
import HouseholdMember from '../models/HouseholdMember.js';

const DEFAULT_THRESHOLD = 60;
const MIN_THRESHOLD = 55;
const MAX_THRESHOLD = 60;
const VERIFICATION_WINDOW_HOURS = 12;

// Safely escape locality names used in regular expressions.
const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Citizen submits a household-level Yes/No verification.
export const submitVerification = async (req, res) => {
  try {
    const { scheduleId, response } = req.body;

    if (!mongoose.isValidObjectId(scheduleId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid schedule ID.',
      });
    }

    if (!['Yes', 'No'].includes(response)) {
      return res.status(400).json({
        success: false,
        message: 'Response must be Yes or No.',
      });
    }

    const citizen = await User.findById(req.user._id);

    if (!citizen || citizen.role !== 'CITIZEN' || !citizen.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Only active citizens can submit verification.',
      });
    }

    const schedule = await Schedule.findById(scheduleId);

    if (!schedule || schedule.status === 'Cancelled') {
      return res.status(404).json({
        success: false,
        message: 'Valid collection schedule not found.',
      });
    }

    if (
      !citizen.locality ||
      citizen.locality.trim().toLowerCase() !==
        schedule.locality.trim().toLowerCase()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not eligible for this locality verification.',
      });
    }

    // Find the citizen's active household membership.
    const membership = await HouseholdMember.findOne({
      citizen: citizen._id,
      isActive: true,
    }).populate('household');

    if (!membership || !membership.household) {
      return res.status(403).json({
        success: false,
        message: 'You are not linked to a registered household.',
      });
    }

    const household = membership.household;

    if (!household.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your registered household is inactive.',
      });
    }

    if (
      household.locality.trim().toLowerCase() !==
      schedule.locality.trim().toLowerCase()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Your household is not eligible for this schedule.',
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
        message: 'Collection task for this schedule is not completed.',
      });
    }

    const deadline = new Date(
      completedTask.completedAt.getTime() +
        VERIFICATION_WINDOW_HOURS * 60 * 60 * 1000
    );

    if (new Date() > deadline) {
      return res.status(400).json({
        success: false,
        message: 'Verification window has closed.',
        deadline,
      });
    }

    // Preserve an existing citizen response as historical data.
    // If it has no household reference, associate it with the
    // citizen's verified household instead of creating a second vote.
    const existingCitizenResponse = await CommunityVerification.findOne({
      schedule: scheduleId,
      citizen: citizen._id,
    });

    if (existingCitizenResponse) {
      if (
        !existingCitizenResponse.household &&
        existingCitizenResponse.locality.trim().toLowerCase() ===
          household.locality.trim().toLowerCase()
      ) {
        existingCitizenResponse.household = household._id;
        await existingCitizenResponse.save();

        return res.status(200).json({
          success: true,
          message:
            'Your existing response has been associated with your household. It was not counted as a new response.',
          verification: existingCitizenResponse,
        });
      }

      return res.status(409).json({
        success: false,
        message: 'You have already responded to this schedule.',
      });
    }

    // Prevent another citizen in the same household from voting again.
    const existingHouseholdResponse = await CommunityVerification.findOne({
      schedule: scheduleId,
      household: household._id,
    });

    if (existingHouseholdResponse) {
      return res.status(409).json({
        success: false,
        message: 'Your household has already responded to this schedule.',
      });
    }

    const verification = await CommunityVerification.create({
      schedule: scheduleId,
      household: household._id,
      citizen: citizen._id,
      locality: schedule.locality,
      response,
    });

    return res.status(201).json({
      success: true,
      message: 'Household verification submitted successfully.',
      verification,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Your household has already responded to this schedule.',
      });
    }

    console.error('Submit verification error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while submitting verification.',
    });
  }
};

// Admin configures the threshold for a locality.
export const updateVerificationThreshold = async (req, res) => {
  try {
    const { locality, threshold } = req.body;
    const numericThreshold = Number(threshold);

    if (
      typeof locality !== 'string' ||
      !locality.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Locality is required.',
      });
    }

    if (
      threshold === undefined ||
      threshold === null ||
      !Number.isFinite(numericThreshold) ||
      numericThreshold < MIN_THRESHOLD ||
      numericThreshold > MAX_THRESHOLD
    ) {
      return res.status(400).json({
        success: false,
        message: 'Threshold must be a number between 55 and 60.',
      });
    }

    const normalizedLocality = locality.trim();

    const settings = await VerificationSettings.findOneAndUpdate(
      { locality: normalizedLocality },
      {
        $set: {
          threshold: numericThreshold,
          updatedBy: req.user._id,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Locality verification threshold saved successfully.',
      settings,
    });
  } catch (error) {
    console.error('Update threshold error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to save verification threshold.',
    });
  }
};

// Admin views household-based verification result for a schedule.
export const getVerificationResult = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    if (!mongoose.isValidObjectId(scheduleId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid schedule ID.',
      });
    }

    const schedule = await Schedule.findById(scheduleId);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found.',
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
        message: 'Collection task is not completed.',
      });
    }

    const deadline = new Date(
      completedTask.completedAt.getTime() +
        VERIFICATION_WINDOW_HOURS * 60 * 60 * 1000
    );

    const localityRegex = new RegExp(
      `^${escapeRegex(schedule.locality.trim())}$`,
      'i'
    );

    // Find active households in the scheduled locality.
    const households = await Household.find({
      locality: localityRegex,
      isActive: true,
    }).select('_id');

    const householdIds = households.map(
      (household) => household._id
    );

    // Count only households having at least one active citizen member.
    const eligibleMemberships = await HouseholdMember.aggregate([
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
      {
        $unwind: '$citizenDetails',
      },
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

    const eligibleHouseholdIds = eligibleMemberships.map(
      (item) => item._id
    );

    const totalEligible = eligibleHouseholdIds.length;

    // Only household-linked responses count towards the result.
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

    const responseCount = yesCount + noCount;

    const positivePercentage =
      totalEligible > 0
        ? (yesCount / totalEligible) * 100
        : 0;

    // Retrieve locality-specific threshold or use default 60%.
    const settings = await VerificationSettings.findOne({
      locality: schedule.locality.trim(),
    });

    const threshold = settings
      ? settings.threshold
      : DEFAULT_THRESHOLD;

    const windowClosed = new Date() >= deadline;

    let result = 'Needs Review';

    if (windowClosed) {
      result =
        totalEligible > 0 && positivePercentage >= threshold
          ? 'Community Verified'
          : 'Unverified';
    }

    return res.status(200).json({
      success: true,
      scheduleId,
      locality: schedule.locality,
      totalEligibleHouseholds: totalEligible,
      totalResponses: responseCount,
      yesCount,
      noCount,
      nonResponses: Math.max(totalEligible - responseCount, 0),
      positivePercentage: Number(positivePercentage.toFixed(2)),
      threshold,
      deadline,
      windowClosed,
      result,
    });
  } catch (error) {
    console.error('Verification result error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while calculating verification result.',
    });
  }
};
