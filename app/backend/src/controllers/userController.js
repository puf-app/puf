const User = require('../models/User');
const Debt = require('../models/Debt');
const DebtEvidence = require('../models/DebtEvidence');
const DebtStatusHistory = require('../models/DebtStatusHistory');
const FriendRequest = require('../models/FriendRequest');
const Friendship = require('../models/Friendship');
const UserVerification = require('../models/UserVerification');
const VerificationDocument = require('../models/VerificationDocument');

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
    try {
        const requestedUserId = req.params.userId || String(req.user._id);
        const isSelfDelete = String(req.user._id) === requestedUserId;

        if (!isSelfDelete && !req.user.admin) {
            return res.status(401).json({
                data: {},
                error: 'Unauthorized - You can only delete your own account'
            });
        }

        const user = await User.findById(requestedUserId).select('_id');

        if (!user) {
            return res.status(404).json({
                data: {},
                error: 'User not found'
            });
        }

        const [relatedDebts, userVerifications] = await Promise.all([
            Debt.find({
                $or: [
                    { creditorUserId: requestedUserId },
                    { debtorUserId: requestedUserId }
                ]
            }).select('_id').lean(),
            UserVerification.find({ userId: requestedUserId }).select('_id').lean()
        ]);

        const debtIds = relatedDebts.map((debt) => debt._id);
        const userVerificationIds = userVerifications.map((verification) => verification._id);

        if (debtIds.length > 0) {
            await Promise.all([
                DebtEvidence.deleteMany({ debtId: { $in: debtIds } }),
                DebtStatusHistory.deleteMany({ debtId: { $in: debtIds } })
            ]);
        }

        if (userVerificationIds.length > 0) {
            await VerificationDocument.deleteMany({ verificationId: { $in: userVerificationIds } });
        }

        await Promise.all([
            FriendRequest.deleteMany({
                $or: [
                    { senderUserId: requestedUserId },
                    { receiverUserId: requestedUserId }
                ]
            }),
            Friendship.deleteMany({
                $or: [
                    { user1Id: requestedUserId },
                    { user2Id: requestedUserId }
                ]
            }),
            DebtEvidence.deleteMany({ uploadedByUserId: requestedUserId }),
            DebtStatusHistory.deleteMany({ changedByUserId: requestedUserId }),
            UserVerification.deleteMany({ userId: requestedUserId }),
            Debt.deleteMany({
                $or: [
                    { creditorUserId: requestedUserId },
                    { debtorUserId: requestedUserId }
                ]
            })
        ]);

        await User.findByIdAndDelete(requestedUserId);

        if (isSelfDelete && req.session) {
            return req.session.destroy((sessionError) => {
                if (sessionError) {
                    return res.status(500).json({
                        data: {},
                        error: 'User deleted, but session logout failed'
                    });
                }

                res.clearCookie('puf_session');

                return res.status(200).json({
                    data: { message: 'User deleted successfully' },
                    error: ''
                });
            });
        }

        return res.status(200).json({
            data: { message: 'User deleted successfully' },
            error: ''
        });
    } catch (error) {
        return res.status(500).json({
            data: {},
            error: 'Internal server error while deleting user'
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    searchUsers,
    getCurrentUserProfile,
    updateUserProfile,
    deleteUser
};
