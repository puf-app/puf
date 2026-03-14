const User = require('../models/User');

const userSelectFields = '-password';
const selfUpdateFields = ['firstName', 'lastName', 'username', 'email', 'phone', 'profileImageUrl'];
const adminUpdateFields = [
    ...selfUpdateFields,
    'status',
    'admin',
    'company',
    'isVerified',
    'verificationLevel'
];

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select(userSelectFields).sort({ createdAt: -1 });

        return res.status(200).json({
            data: { users },
            error: ''
        });
    } catch (error) {
        return res.status(500).json({
            data: {},
            error: 'Internal server error while fetching users'
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select(userSelectFields);

        if (!user) {
            return res.status(404).json({
                data: {},
                error: 'User not found'
            });
        }

        return res.status(200).json({
            data: { user },
            error: ''
        });
    } catch (error) {
        return res.status(500).json({
            data: {},
            error: 'Internal server error while fetching user'
        });
    }
};

const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || !query.trim()) {
            return res.status(400).json({
                data: {},
                error: 'Search query is required'
            });
        }

        const searchRegex = new RegExp(query.trim(), 'i');
        const users = await User.find({
            $or: [
                { username: searchRegex },
                { firstName: searchRegex },
                { lastName: searchRegex }
            ]
        })
            .select(userSelectFields)
            .sort({ username: 1 })
            .limit(20);

        return res.status(200).json({
            data: { users },
            error: ''
        });
    } catch (error) {
        return res.status(500).json({
            data: {},
            error: 'Internal server error while searching users'
        });
    }
};

const getCurrentUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select(userSelectFields);

        if (!user) {
            return res.status(404).json({
                data: {},
                error: 'User not found'
            });
        }

        return res.status(200).json({
            data: { user },
            error: ''
        });
    } catch (error) {
        return res.status(500).json({
            data: {},
            error: 'Internal server error while fetching current user profile'
        });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const requestedUserId = req.params.userId || String(req.user._id);
        const isSelfUpdate = String(req.user._id) === requestedUserId;

        if (!isSelfUpdate && !req.user.admin) {
            return res.status(401).json({
                data: {},
                error: 'Unauthorized - You can only update your own profile'
            });
        }

        const allowedFields = req.user.admin ? adminUpdateFields : selfUpdateFields;
        const updates = {};

        allowedFields.forEach((field) => {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                updates[field] = req.body[field];
            }
        });

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                data: {},
                error: 'No valid fields provided for update'
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            requestedUserId,
            updates,
            {
                new: true,
                runValidators: true
            }
        ).select(userSelectFields);

        if (!updatedUser) {
            return res.status(404).json({
                data: {},
                error: 'User not found'
            });
        }

        return res.status(200).json({
            data: {
                message: 'User profile updated successfully',
                user: updatedUser
            },
            error: ''
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                data: {},
                error: 'Username or email already exists'
            });
        }

        return res.status(500).json({
            data: {},
            error: 'Internal server error while updating user profile'
        });
    }
};

const deleteUser = async (req, res) => {
    return res.status(501).json({
        data: {},
        error: 'Not implemented yet'
    });
};

module.exports = {
    getAllUsers,
    getUserById,
    searchUsers,
    getCurrentUserProfile,
    updateUserProfile,
    deleteUser
};
