const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile and user management endpoints
 */

/**
 * @swagger
 * /api/users/getAllUsers:
 *   get:
 *     summary: Get all users (Admin)
 *     description: Admin only. Returns all users.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *       401:
 *         description: Unauthorized - User not logged in or not admin
 *       500:
 *         description: Internal server error
 */
router.get('/getAllUsers', requireAuth, requireAdmin, userController.getAllUsers);

/**
 * @swagger
 * /api/users/getUserById/{userId}:
 *   get:
 *     summary: Get user by id
 *     description: Returns a single user by id. Requires logged in access.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB user id
 *     responses:
 *       200:
 *         description: User fetched successfully
 *       401:
 *         description: Unauthorized - User not logged in
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/getUserById/:userId', requireAuth, userController.getUserById);

/**
 * @swagger
 * /api/users/searchUsers:
 *   get:
 *     summary: Search users
 *     description: Searches users by username, first name, or last name. Requires logged in access.
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search text for username, first name, or last name
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *       400:
 *         description: Bad Request - Search query is missing
 *       401:
 *         description: Unauthorized - User not logged in
 *       500:
 *         description: Internal server error
 */
router.get('/searchUsers', requireAuth, userController.searchUsers);

/**
 * @swagger
 * /api/users/getCurrentUserProfile:
 *   get:
 *     summary: Get current user profile
 *     description: Returns the currently logged in user's profile.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Current user profile fetched successfully
 *       401:
 *         description: Unauthorized - User not logged in
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/getCurrentUserProfile', requireAuth, userController.getCurrentUserProfile);

/**
 * @swagger
 * /api/users/updateUserProfile/{userId}:
 *   patch:
 *     summary: Update user profile
 *     description: Logged in users can update only their own profile. Admins can update any user.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB user id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string, example: "Jan" }
 *               lastName: { type: string, example: "Kladusek" }
 *               username: { type: string, example: "jan123" }
 *               email: { type: string, example: "jan@example.com" }
 *               phone: { type: string, example: "+38640123456" }
 *               profileImageUrl: { type: string, example: "https://example.com/profile.jpg" }
 *               status: { type: string, enum: [ACTIVE, SUSPENDED, DEACTIVATED] }
 *               admin: { type: boolean, example: false }
 *               company: { type: boolean, example: false }
 *               isVerified: { type: boolean, example: true }
 *               verificationLevel: { type: string, enum: [NONE, BASIC, IDENTITY, ENHANCED] }
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       400:
 *         description: Bad Request - Invalid update payload or duplicate username/email
 *       401:
 *         description: Unauthorized - User not logged in or cannot update selected user
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.patch('/updateUserProfile/:userId', requireAuth, userController.updateUserProfile);

/**
 * @swagger
 * /api/users/deleteUser/{userId}:
 *   delete:
 *     summary: Delete user
 *     description: TODO endpoint placeholder.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB user id
 *     responses:
 *       501:
 *         description: Not implemented yet
 */
router.delete('/deleteUser/:userId', requireAuth, userController.deleteUser);

module.exports = router;
