const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const biometricController = require('../controllers/biometricController');
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


/**
 * @swagger
 * tags:
 *   name: Biometric
 *   description: Biometric authentication (WebAuthn / Passkeys) management
 */

/**
 * @swagger
 * /api/auth/biometric/registerOptions:
 *   get:
 *     summary: Get biometric registration options (Step 1)
 *     description: Generates a WebAuthn challenge and registration options required for the frontend to trigger FaceID, Fingerprint, or Windows Hello.
 *     tags: [Biometric]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Success - Returns WebAuthn registration options
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     challenge: { type: string }
 *                     rp: { type: object }
 *                     user: { type: object }
 *                     pubKeyCredParams: { type: array, items: { type: object } }
 *                 error: { type: string, example: "" }
 *       401:
 *         description: Unauthorized - You must be logged in
 *       500:
 *         description: Internal server error
 */
router.get('/biometric/registerOptions', requireAuth, biometricController.getRegistrationOptions);

/**
 * @swagger
 * /api/auth/biometric/loginOptions:
 *   get:
 *     summary: Get options for biometric login
 *     description: Generates a challenge for a specific user to initiate passwordless biometric login.
 *     tags: [Biometric]
 *     parameters:
 *       - in: query
 *         name: username
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Success - Returns login challenge
 *       400:
 *         description: User has no biometric devices registered
 */
router.get('/biometric/loginOptions', requireNotAuth, biometricController.getLoginOptions);

/**
 * @swagger
 * /api/auth/biometric/list:
 *   get:
 *     summary: List registered biometric devices
 *     description: Retrieves all biometric authenticators (Passkeys) associated with the currently authenticated user.
 *     tags: [Biometric]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Success - Returns list of devices
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string, description: "Base64URL encoded credential ID" }
 *                       transports: { type: array, items: { type: string } }
 *                 error: { type: string, example: "" }
 *       401:
 *         description: Unauthorized
 */
router.get('/biometric/list', requireAuth, biometricController.listAuthenticators);

/**
 * @swagger
 * /api/auth/biometric/verifyRegistration:
 *   post:
 *     summary: Verify and save biometric device (Step 2)
 *     description: Receives the response from the browser's WebAuthn API, verifies it, and saves the public key to the user's account.
 *     tags: [Biometric]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Success - Biometric device registered
 *       400:
 *         description: Bad Request - Verification failed
 */
router.post('/biometric/verifyRegistration', requireAuth, biometricController.verifyRegistration);

/**
 * @swagger
 * /api/auth/biometric/verifyLogin:
 *   post:
 *     summary: Login with biometrics
 *     description: Verifies the biometric signature from the browser and creates a user session (Login).
 *     tags: [Biometric]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string }
 *               body: { type: object }
 *     responses:
 *       200:
 *         description: Success - Biometric login successful
 *       401:
 *         description: Biometric verification failed
 */
router.post('/biometric/verifyLogin', requireNotAuth, biometricController.verifyLogin);

/**
 * @swagger
 * /api/auth/biometric/removeDevice/{credentialId}:
 *   delete:
 *     summary: Remove a biometric device
 *     description: Permanently removes a specific biometric device from the user's account.
 *     tags: [Biometric]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: credentialId
 *         required: true
 *         schema: { type: string }
 *         description: Base64URL encoded credential ID
 *     responses:
 *       200:
 *         description: Device removed successfully
 *       404:
 *         description: Device not found
 */
router.delete('/biometric/removeDevice/:credentialId', requireAuth, biometricController.removeAuthenticator);

module.exports = router;