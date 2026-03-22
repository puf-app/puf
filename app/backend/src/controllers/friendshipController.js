const Friendship = require('../models/Friendship');
const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');

const friendRequestStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'];
const friendshipStatuses = ['ACTIVE', 'BLOCKED', 'REMOVED'];

const normalizeFriendshipPair = (firstUserId, secondUserId) => {
    const first = String(firstUserId);
    const second = String(secondUserId);

    return first < second
        ? { user1Id: firstUserId, user2Id: secondUserId }
        : { user1Id: secondUserId, user2Id: firstUserId };
};

const findExistingFriendship = async (firstUserId, secondUserId) => {
    const normalizedPair = normalizeFriendshipPair(firstUserId, secondUserId);
    return Friendship.findOne(normalizedPair);
};

const ensureTargetUserExists = async (userId) => {
    const user = await User.findById(userId);
    return user && user.status === 'ACTIVE';
};

const friendRequest = async (req, res) => {
    try {
        const senderUserId = req.user._id;
        const { receiverUserId, message } = req.body;

        if (!receiverUserId) {
            return res.status(400).json({ data: {}, error: 'Receiver user id is required' });
        }

        if (String(senderUserId) === String(receiverUserId)) {
            return res.status(400).json({ data: {}, error: 'You cannot send a friend request to yourself' });
        }

        const receiverExists = await ensureTargetUserExists(receiverUserId);
        if (!receiverExists) {
            return res.status(404).json({ data: {}, error: 'Receiver user not found' });
        }

        const existingFriendship = await findExistingFriendship(senderUserId, receiverUserId);
        if (existingFriendship) {
            return res.status(400).json({ data: {}, error: 'Friendship already exists between these users' });
        }

        const pendingRequest = await FriendRequest.findOne({
            status: 'PENDING',
            $or: [
                { senderUserId, receiverUserId },
                { senderUserId: receiverUserId, receiverUserId: senderUserId }
            ]
        });

        if (pendingRequest) {
            return res.status(400).json({
                data: {},
                error: 'A pending friend request already exists between these users'
            });
        }

        const createdRequest = await FriendRequest.create({
            senderUserId,
            receiverUserId,
            status: 'PENDING',
            message: message || ''
        });

        return res.status(201).json({
            data: {
                message: 'Friend request created successfully',
                friendRequest: createdRequest
            },
            error: ''
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: 'Internal server error while creating friend request' });
    }
};

const friendRequestCancel = async (req, res) => {
    try {
        const { friendRequestId } = req.params;
        const friendRequestToCancel = await FriendRequest.findById(friendRequestId);

        if (!friendRequestToCancel) {
            return res.status(404).json({ data: {}, error: 'Friend request not found' });
        }

        if (String(friendRequestToCancel.senderUserId) !== String(req.user._id)) {
            return res.status(401).json({ data: {}, error: 'Unauthorized - Only the sender can cancel this request' });
        }

        if (friendRequestToCancel.status !== 'PENDING') {
            return res.status(400).json({ data: {}, error: 'Only pending friend requests can be cancelled' });
        }

        friendRequestToCancel.status = 'CANCELLED';
        friendRequestToCancel.respondedAt = new Date();
        await friendRequestToCancel.save();

        return res.status(200).json({
            data: {
                message: 'Friend request cancelled successfully',
                friendRequest: friendRequestToCancel
            },
            error: ''
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: 'Internal server error while cancelling friend request' });
    }
};

const friendRequestAccept = async (req, res) => {
    try {
        const { friendRequestId } = req.params;
        const requestToAccept = await FriendRequest.findById(friendRequestId);

        if (!requestToAccept) {
            return res.status(404).json({ data: {}, error: 'Friend request not found' });
        }

        if (String(requestToAccept.receiverUserId) !== String(req.user._id)) {
            return res.status(401).json({ data: {}, error: 'Unauthorized - Only the receiver can accept this request' });
        }

        if (requestToAccept.status !== 'PENDING') {
            return res.status(400).json({ data: {}, error: 'Only pending friend requests can be accepted' });
        }

        const existingFriendship = await findExistingFriendship(
            requestToAccept.senderUserId,
            requestToAccept.receiverUserId
        );

        if (existingFriendship) {
            return res.status(400).json({ data: {}, error: 'Friendship already exists between these users' });
        }

        const normalizedPair = normalizeFriendshipPair(
            requestToAccept.senderUserId,
            requestToAccept.receiverUserId
        );

        const friendship = await Friendship.create({
            ...normalizedPair,
            status: 'ACTIVE'
        });

        requestToAccept.status = 'ACCEPTED';
        requestToAccept.respondedAt = new Date();
        await requestToAccept.save();

        return res.status(200).json({
            data: {
                message: 'Friend request accepted successfully',
                friendRequest: requestToAccept,
                friendship
            },
            error: ''
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: 'Internal server error while accepting friend request' });
    }
};

const friendRequestReject = async (req, res) => {
    try {
        const { friendRequestId } = req.params;
        const requestToReject = await FriendRequest.findById(friendRequestId);

        if (!requestToReject) {
            return res.status(404).json({ data: {}, error: 'Friend request not found' });
        }

        if (String(requestToReject.receiverUserId) !== String(req.user._id)) {
            return res.status(401).json({ data: {}, error: 'Unauthorized - Only the receiver can reject this request' });
        }

        if (requestToReject.status !== 'PENDING') {
            return res.status(400).json({ data: {}, error: 'Only pending friend requests can be rejected' });
        }

        requestToReject.status = 'REJECTED';
        requestToReject.respondedAt = new Date();
        await requestToReject.save();

        return res.status(200).json({
            data: {
                message: 'Friend request rejected successfully',
                friendRequest: requestToReject
            },
            error: ''
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: 'Internal server error while rejecting friend request' });
    }
};

const getReceivedFriendRequests = async (req, res) => {
    try {
        const userId = req.user._id;
        const friendRequests = await FriendRequest.find({ receiverUserId: userId }).sort({ createdAt: -1 });

        return res.status(200).json({
            data: { friendRequests },
            error: ''
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: 'Internal server error while fetching received friend requests' });
    }
};

const getSentFriendRequests = async (req, res) => {
    try {
        const userId = req.user._id;
        const friendRequests = await FriendRequest.find({ senderUserId: userId }).sort({ createdAt: -1 });

        return res.status(200).json({
            data: { friendRequests },
            error: ''
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: 'Internal server error while fetching sent friend requests' });
    }
};

const getFriendRequests = async (req, res) => {
    try {
        const friendRequests = await FriendRequest.find().sort({ createdAt: -1 });

        return res.status(200).json({
            data: { friendRequests },
            error: ''
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: 'Internal server error while fetching all friend requests' });
    }
};

const deleteFriendRequestById = async (req, res) => {
    try {
        const { friendRequestId } = req.params;
        const deletedFriendRequest = await FriendRequest.findByIdAndDelete(friendRequestId);

        if (!deletedFriendRequest) {
            return res.status(404).json({ data: {}, error: 'Friend request not found' });
        }

        return res.status(200).json({
            data: {
                message: 'Friend request deleted successfully',
                friendRequest: deletedFriendRequest
            },
            error: ''
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: 'Internal server error while deleting friend request' });
    }
};

const deleteFriendRequestsByUserIdAndStatus = async (req, res) => {
    try {
        const { userId, status } = req.params;

        if (!friendRequestStatuses.includes(status)) {
            return res.status(400).json({ data: {}, error: 'Invalid friend request status' });
        }

        const deleteResult = await FriendRequest.deleteMany({
            status,
            $or: [
                { senderUserId: userId },
                { receiverUserId: userId }
            ]
        });

        return res.status(200).json({
            data: {
                message: 'Friend requests deleted successfully',
                deletedCount: deleteResult.deletedCount
            },
            error: ''
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: 'Internal server error while deleting friend requests' });
    }
};

const createFriendship = async (req, res) => {
    try {
        const { secondUserId } = req.body;
        const firstUserId = req.user._id;

        if (!secondUserId) {
            return res.status(400).json({ data: {}, error: 'Second user id is required' });
        }

        if (String(firstUserId) === String(secondUserId)) {
            return res.status(400).json({ data: {}, error: 'You cannot create a friendship with yourself' });
        }

        const secondUserExists = await ensureTargetUserExists(secondUserId);
        if (!secondUserExists) {
            return res.status(404).json({ data: {}, error: 'Second user not found' });
        }

        const existingFriendship = await findExistingFriendship(firstUserId, secondUserId);
        if (existingFriendship) {
            return res.status(400).json({ data: {}, error: 'Friendship already exists between these users' });
        }

        const normalizedPair = normalizeFriendshipPair(firstUserId, secondUserId);
        const friendship = await Friendship.create({
            ...normalizedPair,
            status: 'ACTIVE'
        });

        return res.status(201).json({
            data: {
                message: 'Friendship created successfully',
                friendship
            },
            error: ''
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: 'Internal server error while creating friendship' });
    }
};

const getFriendships = async (req, res) => {
    try {
        const userId = req.user._id;
        const friendships = await Friendship.find({
            $or: [
                { user1Id: userId },
                { user2Id: userId }
            ]
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            data: { friendships },
            error: ''
        });
    } catch (error) {
        return res.status(500).json({
            data: {},
            error: 'Internal server error while fetching friendships'
        });
    }
};

const getAllFriendships = async (req, res) => {
    try {
        const friendships = await Friendship.find().sort({ createdAt: -1 });

        return res.status(200).json({
            data: { friendships },
            error: ''
        });
    } catch (error) {
        return res.status(500).json({
            data: {},
            error: 'Internal server error while fetching all friendships'
        });
    }
};

const removeFriendshipByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const friendship = await findExistingFriendship(req.user._id, userId);

        if (!friendship) {
            return res.status(404).json({ data: {}, error: 'Friendship not found' });
        }

        await Friendship.findByIdAndDelete(friendship._id);

        return res.status(200).json({
            data: {
                message: 'Friendship removed successfully',
                friendshipId: friendship._id
            },
            error: ''
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: 'Internal server error while removing friendship' });
    }
};

const removeFriendshipById = async (req, res) => {
    try {
        const { friendshipId } = req.params;
        const deletedFriendship = await Friendship.findByIdAndDelete(friendshipId);

        if (!deletedFriendship) {
            return res.status(404).json({ data: {}, error: 'Friendship not found' });
        }

        return res.status(200).json({
            data: {
                message: 'Friendship removed successfully',
                friendship: deletedFriendship
            },
            error: ''
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: 'Internal server error while removing friendship by id' });
    }
};

const blockFriendshipById = async (req, res) => {
    try {
        const { friendshipId } = req.params;
        const friendship = await Friendship.findById(friendshipId);

        if (!friendship) {
            return res.status(404).json({ data: {}, error: 'Friendship not found' });
        }

        if (
            String(friendship.user1Id) !== String(req.user._id) &&
            String(friendship.user2Id) !== String(req.user._id) &&
            req.user.admin !== true
        ) {
            return res.status(401).json({ data: {}, error: 'Unauthorized - You can only block your own friendships' });
        }

        friendship.status = 'BLOCKED';
        await friendship.save();

        return res.status(200).json({
            data: {
                message: 'Friendship blocked successfully',
                friendship
            },
            error: ''
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: 'Internal server error while blocking friendship' });
    }
};

const blockFriendshipByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const friendship = await findExistingFriendship(req.user._id, userId);

        if (!friendship) {
            return res.status(404).json({ data: {}, error: 'Friendship not found' });
        }

        friendship.status = 'BLOCKED';
        await friendship.save();

        return res.status(200).json({
            data: {
                message: 'Friendship blocked successfully',
                friendship
            },
            error: ''
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: 'Internal server error while blocking friendship' });
    }
};

const unblockFriendshipById = async (req, res) => {
    try {
        const { friendshipId } = req.params;
        const friendship = await Friendship.findById(friendshipId);

        if (!friendship) {
            return res.status(404).json({ data: {}, error: 'Friendship not found' });
        }

        if (
            String(friendship.user1Id) !== String(req.user._id) &&
            String(friendship.user2Id) !== String(req.user._id) &&
            req.user.admin !== true
        ) {
            return res.status(401).json({ data: {}, error: 'Unauthorized - You can only unblock your own friendships' });
        }

        friendship.status = 'ACTIVE';
        await friendship.save();

        return res.status(200).json({
            data: {
                message: 'Friendship unblocked successfully',
                friendship
            },
            error: ''
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: 'Internal server error while unblocking friendship' });
    }
};

const unblockFriendshipByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const friendship = await findExistingFriendship(req.user._id, userId);

        if (!friendship) {
            return res.status(404).json({ data: {}, error: 'Friendship not found' });
        }

        friendship.status = 'ACTIVE';
        await friendship.save();

        return res.status(200).json({
            data: {
                message: 'Friendship unblocked successfully',
                friendship
            },
            error: ''
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: 'Internal server error while unblocking friendship' });
    }
};

module.exports = {
    friendRequest,
    friendRequestCancel,
    friendRequestAccept,
    friendRequestReject,
    getReceivedFriendRequests,
    getSentFriendRequests,
    getFriendRequests,
    deleteFriendRequestById,
    deleteFriendRequestsByUserIdAndStatus,
    createFriendship,
    getFriendships,
    getAllFriendships,
    removeFriendshipByUserId,
    removeFriendshipById,
    blockFriendshipById,
    blockFriendshipByUserId,
    unblockFriendshipById,
    unblockFriendshipByUserId
};
