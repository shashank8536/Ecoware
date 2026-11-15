
import mongoose from 'mongoose';

import Household from '../models/Household.js';
import HouseholdMember from '../models/HouseholdMember.js';
import User from '../models/User.js';

// Register a new residential household
export const createHousehold = async (req, res) => {
  try {
    const {
      houseStreet,
      locality,
      ward,
      city,
      state,
      pinCode,
    } = req.body;

    if (!houseStreet || !locality || !ward || !city || !state) {
      return res.status(400).json({
        success: false,
        message:
          'House address, locality, ward, city and state are required.',
      });
    }

    const household = await Household.create({
      houseStreet,
      locality,
      ward,
      city,
      state,
      pinCode,
      registeredBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Household registered successfully.',
      household,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Link an existing citizen to a household
export const addHouseholdMember = async (req, res) => {
  try {
    const { householdId, citizenId } = req.body;

    if (!householdId || !citizenId) {
      return res.status(400).json({
        success: false,
        message: 'Household ID and citizen ID are required.',
      });
    }

    if (
      !mongoose.isValidObjectId(householdId) ||
      !mongoose.isValidObjectId(citizenId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid household or citizen ID.',
      });
    }

    const household = await Household.findById(householdId);

    if (!household || !household.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Active household not found.',
      });
    }

    const citizen = await User.findOne({
      _id: citizenId,
      role: 'CITIZEN',
      isActive: true,
    });

    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: 'Active citizen not found.',
      });
    }

    const normalize = (value) =>
      (value || '').trim().toLowerCase();

    const addressMatches =
      normalize(citizen.houseStreet) ===
        normalize(household.houseStreet) &&
      normalize(citizen.locality) ===
        normalize(household.locality) &&
      normalize(citizen.ward) ===
        normalize(household.ward) &&
      normalize(citizen.city) ===
        normalize(household.city) &&
      normalize(citizen.state) ===
        normalize(household.state);

    if (!addressMatches) {
      return res.status(400).json({
        success: false,
        message:
          'Citizen address does not match the registered household.',
      });
    }

    const membership = await HouseholdMember.create({
      household: household._id,
      citizen: citizen._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Citizen linked to household successfully.',
      membership,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Citizen is already linked to a household.',
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update an existing household address
export const updateHousehold = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid household ID.',
      });
    }

    const allowedFields = [
      'houseStreet',
      'locality',
      'ward',
      'city',
      'state',
      'pinCode',
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least one field to update.',
      });
    }

    for (const value of Object.values(updates)) {
      if (typeof value !== 'string' || !value.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Address fields must contain non-empty text.',
        });
      }
    }

    for (const field of Object.keys(updates)) {
      updates[field] = updates[field].trim();
    }

    const household = await Household.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!household) {
      return res.status(404).json({
        success: false,
        message: 'Household not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Household address updated successfully.',
      household,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
