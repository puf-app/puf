const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {requireNotAuth, requireAuth} = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and session management
 */

/**
 * @swagger
 * /api/auth/registerUser:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, username, email, password]
 *             properties:
 *               firstName: { type: string, example: "Florijan" }
 *               lastName: { type: string, example: "Siter" }
 *               username: { type: string, example: "florijan123" }
 *               email: { type: string, example: "florijan@example.com" }
 *               password: { type: string, example: "securePassword123" }
 *               phone: { type: string, example: "+38640123456" }
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad Request - Missing fields or user already exists
 *       500:
 *         description: Server error
 */
router.post('/registerUser', requireNotAuth, authController.registerUser);
/**
 * @swagger
 * /api/auth/loginUser:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string, example: "florijan123" }
 *               password: { type: string, example: "password123" }
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     message: { type: string }
 *                     user:
 *                       type: object
 *                       properties:
 *                         username: { type: string }
 *                         admin: { type: boolean }
 *                 error: { type: string, example: "" }
 *       401:
 *         description: Unauthorized - Invalid credentials
 */

router.post('/loginUser', requireNotAuth, authController.loginUser);
/**
 * @swagger
 * /api/auth/logoutUser:
 *   post:
 *     summary: User logout
 *     description: Ends the user session and clears the cookie.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                 error:
 *                   type: string
 *                   example: ""
 *       401:
 *         description: Unauthorized - User not logged in
 *       500:
 *         description: Server error while destroying session
 */
router.post('/logoutUser', requireAuth, authController.logoutUser);
/**
 * @swagger
 * /api/auth/changePassword:
 *   post:
 *     summary: Change user password
 *     description: Updates the password after verifying the old one.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword]
 *             properties:
 *               oldPassword: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       401:
 *         description: Invalid old password
 */
router.post('/changePassword', requireAuth, authController.changePassword);

module.exports = router;