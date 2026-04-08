const express = require('express');
const router = express.Router();
const friendshipController = require('../controllers/friendshipController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Friendships
 *   description: Friend request and friendship management endpoints
 */

/**
 * @swagger
 * /api/friendships/friendRequest:
 *   post:
 *     summary: Send a friend request
 *     description: Logged in user sends a friend request to the user id provided in the request body. If the request is later accepted, the friend request remains stored as history with status `ACCEPTED`. If a pending friend request already exists in either direction, or if an active friendship already exists, a new friend request will not be created.
 *     tags: [Friendships]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [receiverUserId]
 *             properties:
 *               receiverUserId:
 *                 type: string
 *                 description: MongoDB id of the user who should receive the friend request
 *               message:
 *                 type: string
 *                 example: "Hi, let's connect on Puff."
 *     responses:
 *       201:
 *         description: Friend request created successfully
 *       400:
 *         description: Bad Request - Invalid payload, duplicate pending request, or friendship already exists
 *       401:
 *         description: Unauthorized - User not logged in
 *       404:
 *         description: Receiver user not found
 *       500:
 *         description: Server error
 */
router.post('/friendRequest', requireAuth, friendshipController.friendRequest);

/**
 * @swagger
 * /api/friendships/friendRequestCancel/{friendRequestId}:
 *   patch:
 *     summary: Cancel a friend request
 *     description: Only the sender can cancel a pending friend request.
 *     tags: [Friendships]
 *     parameters:
 *       - in: path
 *         name: friendRequestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Friend request MongoDB id
 *     responses:
 *       200:
 *         description: Friend request cancelled successfully
 *       400:
 *         description: Bad Request - Only pending requests can be cancelled
 *       401:
 *         description: Unauthorized - Only sender can cancel
 *       404:
 *         description: Friend request not found
 *       500:
 *         description: Server error
 */
router.patch('/friendRequestCancel/:friendRequestId', requireAuth, friendshipController.friendRequestCancel);

/**
 * @swagger
 * /api/friendships/friendRequestAccept/{friendRequestId}:
 *   patch:
 *     summary: Accept a friend request
 *     description: Only the receiver can accept a pending friend request. This creates an active friendship and keeps the friend request in the database as history with status `ACCEPTED`.
 *     tags: [Friendships]
 *     parameters:
 *       - in: path
 *         name: friendRequestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Friend request MongoDB id
 *     responses:
 *       200:
 *         description: Friend request accepted successfully
 *       400:
 *         description: Bad Request - Only pending requests can be accepted or friendship already exists
 *       401:
 *         description: Unauthorized - Only receiver can accept
 *       404:
 *         description: Friend request not found
 *       500:
 *         description: Server error
 */
router.patch('/friendRequestAccept/:friendRequestId', requireAuth, friendshipController.friendRequestAccept);

/**
 * @swagger
 * /api/friendships/friendRequestReject/{friendRequestId}:
 *   patch:
 *     summary: Reject a friend request
 *     description: Only the receiver can reject a pending friend request.
 *     tags: [Friendships]
 *     parameters:
 *       - in: path
 *         name: friendRequestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Friend request MongoDB id
 *     responses:
 *       200:
 *         description: Friend request rejected successfully
 *       400:
 *         description: Bad Request - Only pending requests can be rejected
 *       401:
 *         description: Unauthorized - Only receiver can reject
 *       404:
 *         description: Friend request not found
 *       500:
 *         description: Server error
 */
router.patch('/friendRequestReject/:friendRequestId', requireAuth, friendshipController.friendRequestReject);

/**
 * @swagger
 * /api/friendships/getReceivedFriendRequests:
 *   get:
 *     summary: Get received friend requests of the logged in user
 *     description: Returns all friend requests where the currently logged in user is the receiver.
 *     tags: [Friendships]
 *     responses:
 *       200:
 *         description: Received friend requests fetched successfully
 *       401:
 *         description: Unauthorized - User not logged in
 *       500:
 *         description: Server error
 */
router.get('/getReceivedFriendRequests', requireAuth, friendshipController.getReceivedFriendRequests);

/**
 * @swagger
 * /api/friendships/getSentFriendRequests:
 *   get:
 *     summary: Get sent friend requests of the logged in user
 *     description: Returns all friend requests where the currently logged in user is the sender.
 *     tags: [Friendships]
 *     responses:
 *       200:
 *         description: Sent friend requests fetched successfully
 *       401:
 *         description: Unauthorized - User not logged in
 *       500:
 *         description: Server error
 */
router.get('/getSentFriendRequests', requireAuth, friendshipController.getSentFriendRequests);

/**
 * @swagger
 * /api/friendships/getFriendRequests:
 *   get:
 *     summary: Get all friend requests (Admin)
 *     description: Admin only. Returns every friend request in the database.
 *     tags: [Friendships]
 *     responses:
 *       200:
 *         description: Friend requests fetched successfully
 *       401:
 *         description: Unauthorized - User not logged in or not admin
 *       500:
 *         description: Server error
 */
router.get('/getFriendRequests', requireAuth, requireAdmin, friendshipController.getFriendRequests);

/**
 * @swagger
 * /api/friendships/deleteFriendRequestById/{friendRequestId}:
 *   delete:
 *     summary: Delete one friend request by id
 *     description: Deletes a single friend request by its MongoDB id. This only removes the friend request record and does not delete any existing friendship.
 *     tags: [Friendships]
 *     parameters:
 *       - in: path
 *         name: friendRequestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Friend request MongoDB id
 *     responses:
 *       200:
 *         description: Friend request deleted successfully
 *       401:
 *         description: Unauthorized - User not logged in
 *       404:
 *         description: Friend request not found
 *       500:
 *         description: Server error
 */
router.delete('/deleteFriendRequestById/:friendRequestId', requireAuth, friendshipController.deleteFriendRequestById);

/**
 * @swagger
 * /api/friendships/deleteFriendRequestsByUserIdAndStatus/{userId}/{status}:
 *   delete:
 *     summary: Delete friend requests by user id and status (Admin)
 *     description: Admin only. Deletes all friend requests where the given user is either sender or receiver and the request has the provided status. This only removes friend request records and does not delete any existing friendships.
 *     tags: [Friendships]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           example: "69b546ce5b30d54c89a25a32"
 *         description: User MongoDB id
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PENDING, ACCEPTED, REJECTED, CANCELLED]
 *           example: "PENDING"
 *         description: Friend request status
 *     responses:
 *       200:
 *         description: Friend requests deleted successfully
 *       400:
 *         description: Bad Request - Invalid status
 *       401:
 *         description: Unauthorized - User not logged in or not admin
 *       500:
 *         description: Server error
 */
router.delete(
    '/deleteFriendRequestsByUserIdAndStatus/:userId/:status',
    requireAuth,
    requireAdmin,
    friendshipController.deleteFriendRequestsByUserIdAndStatus
);

/**
 * @swagger
 * /api/friendships/createFriendship:
 *   post:
 *     summary: Create friendship directly (Admin)
 *     description: Admin only. Creates an active friendship between the logged in user and another user. Example is `klada` creating friendship with `florijan123`. This creates only the friendship record and does not create a friend request history record.
 *     tags: [Friendships]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [secondUserId]
 *             properties:
 *               secondUserId:
 *                 type: string
 *                 example: "69b55dac713d6b4f2717494b"
 *     responses:
 *       201:
 *         description: Friendship created successfully
 *       400:
 *         description: Bad Request - Invalid payload or friendship already exists
 *       401:
 *         description: Unauthorized - User not logged in or not admin
 *       404:
 *         description: Second user not found
 *       500:
 *         description: Server error
 */
router.post('/createFriendship', requireAuth, requireAdmin, friendshipController.createFriendship);

/**
 * @swagger
 * /api/friendships/getFriendships:
 *   get:
 *     summary: Get friendships of the logged in user
 *     description: Returns all friendships where the currently logged in user is either `user1Id` or `user2Id`.
 *     tags: [Friendships]
 *     responses:
 *       200:
 *         description: Friendships fetched successfully
 *       401:
 *         description: Unauthorized - User not logged in
 *       500:
 *         description: Server error
 */
router.get('/getFriendships', requireAuth, friendshipController.getFriendships);

/**
 * @swagger
 * /api/friendships/getAllFriendships:
 *   get:
 *     summary: Get all friendships (Admin)
 *     description: Admin only. Returns all friendships in the database.
 *     tags: [Friendships]
 *     responses:
 *       200:
 *         description: All friendships fetched successfully
 *       401:
 *         description: Unauthorized - User not logged in or not admin
 *       500:
 *         description: Server error
 */
router.get('/getAllFriendships', requireAuth, requireAdmin, friendshipController.getAllFriendships);

/**
 * @swagger
 * /api/friendships/removeFriendshipByUserId/{userId}:
 *   delete:
 *     summary: Remove friendship by the other user id
 *     description: Logged in user removes the friendship they have with another user. This deletes only the friendship record and keeps any past friend request records as history.
 *     tags: [Friendships]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           example: "69b55dac713d6b4f2717494b"
 *         description: Other user MongoDB id
 *     responses:
 *       200:
 *         description: Friendship removed successfully
 *       401:
 *         description: Unauthorized - User not logged in
 *       404:
 *         description: Friendship not found
 *       500:
 *         description: Server error
 */
router.delete('/removeFriendshipByUserId/:userId', requireAuth, friendshipController.removeFriendshipByUserId);

/**
 * @swagger
 * /api/friendships/removeFriendshipById/{friendshipId}:
 *   delete:
 *     summary: Remove friendship by friendship id (Admin)
 *     description: Admin only. Deletes a friendship by friendship MongoDB id. This deletes only the friendship record and keeps any past friend request records as history.
 *     tags: [Friendships]
 *     parameters:
 *       - in: path
 *         name: friendshipId
 *         required: true
 *         schema:
 *           type: string
 *         description: Friendship MongoDB id
 *     responses:
 *       200:
 *         description: Friendship removed successfully
 *       401:
 *         description: Unauthorized - User not logged in or not admin
 *       404:
 *         description: Friendship not found
 *       500:
 *         description: Server error
 */
router.delete('/removeFriendshipById/:friendshipId', requireAuth, requireAdmin, friendshipController.removeFriendshipById);

/**
 * @swagger
 * /api/friendships/blockFriendshipById/{friendshipId}:
 *   patch:
 *     summary: Block friendship by friendship id (Admin)
 *     description: Admin only. Sets the friendship status to `BLOCKED` using the friendship MongoDB id.
 *     tags: [Friendships]
 *     parameters:
 *       - in: path
 *         name: friendshipId
 *         required: true
 *         schema:
 *           type: string
 *         description: Friendship MongoDB id
 *     responses:
 *       200:
 *         description: Friendship blocked successfully
 *       401:
 *         description: Unauthorized - User not logged in or not admin
 *       404:
 *         description: Friendship not found
 *       500:
 *         description: Server error
 */
router.patch('/blockFriendshipById/:friendshipId', requireAuth, requireAdmin, friendshipController.blockFriendshipById);

/**
 * @swagger
 * /api/friendships/blockFriendshipByUserId/{userId}:
 *   patch:
 *     summary: Block friendship by user id
 *     description: Sets the friendship status to `BLOCKED` between the logged in user and the provided user.
 *     tags: [Friendships]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           example: "69b55dac713d6b4f2717494b"
 *         description: Other user MongoDB id
 *     responses:
 *       200:
 *         description: Friendship blocked successfully
 *       401:
 *         description: Unauthorized - User not logged in
 *       404:
 *         description: Friendship not found
 *       500:
 *         description: Server error
 */
router.patch('/blockFriendshipByUserId/:userId', requireAuth, friendshipController.blockFriendshipByUserId);

/**
 * @swagger
 * /api/friendships/unblockFriendshipById/{friendshipId}:
 *   patch:
 *     summary: Unblock friendship by friendship id (Admin)
 *     description: Admin only. Sets the friendship status back to `ACTIVE` using the friendship MongoDB id.
 *     tags: [Friendships]
 *     parameters:
 *       - in: path
 *         name: friendshipId
 *         required: true
 *         schema:
 *           type: string
 *         description: Friendship MongoDB id
 *     responses:
 *       200:
 *         description: Friendship unblocked successfully
 *       401:
 *         description: Unauthorized - User not logged in or not admin
 *       404:
 *         description: Friendship not found
 *       500:
 *         description: Server error
 */
router.patch('/unblockFriendshipById/:friendshipId', requireAuth, requireAdmin, friendshipController.unblockFriendshipById);

/**
 * @swagger
 * /api/friendships/unblockFriendshipByUserId/{userId}:
 *   patch:
 *     summary: Unblock friendship by user id
 *     description: Sets the friendship status back to `ACTIVE` between the logged in user and the provided user.
 *     tags: [Friendships]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           example: "69b55dac713d6b4f2717494b"
 *         description: Other user MongoDB id
 *     responses:
 *       200:
 *         description: Friendship unblocked successfully
 *       401:
 *         description: Unauthorized - User not logged in
 *       404:
 *         description: Friendship not found
 *       500:
 *         description: Server error
 */
router.patch('/unblockFriendshipByUserId/:userId', requireAuth, friendshipController.unblockFriendshipByUserId);

module.exports = router;
