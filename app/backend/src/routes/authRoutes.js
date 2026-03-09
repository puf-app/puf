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
 *     description: Creates a new user account in the system.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: newuser@example.com
 *               password:
 *                 type: string
 *                 example: securePassword123
 *     responses:
 *       201:
 *         description: User created successfully
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
 *                     user:
 *                       type: object
 *                 error:
 *                   type: string
 *       400:
 *         description: Bad Request - Missing fields or user already logged in
 *       500:
 *         description: Server error
 */
router.post('/registerUser', requireNotAuth, authController.registerUser);
/**
 * @swagger
 * /api/auth/loginUser:
 *   post:
 *     summary: User login
 *     description: Authenticates a user and starts a session.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
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
 *                     message:
 *                       type: string
 *                     user:
 *                       type: object
 *                 error:
 *                   type: string
 *                   example: ""
 *       400:
 *         description: Bad Request - User already authenticated
 *       401:
 *         description: Unauthorized - Invalid credentials
 *       500:
 *         description: Server error
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

module.exports = router;