const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const upload = require('../middleware/uploadMiddleware');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Verification
 *   description: KYC and Identity Verification
 */

/**
 * @swagger
 * /api/verification/request:
 *   post:
 *     summary: Create a new verification request
 *     description: Initializes the verification process for the current user.
 *     tags: [Verification]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [verificationType, documentNumber, countryCode]
 *             properties:
 *               verificationType:
 *                 type: string
 *                 enum: [ID_CARD, PASSPORT, DRIVERS_LICENSE]
 *               documentNumber:
 *                 type: string
 *                 example: "AB1234567"
 *               countryCode:
 *                 type: string
 *                 example: "SI"
 *                 description: ISO 2-letter country code
 *     responses:
 *       201:
 *         description: Request created successfully
 *       400:
 *         description: Missing fields or request already exists
 */
router.post('/request', requireAuth, verificationController.createVerificationRequest);

/**
 * @swagger
 * /api/verification/upload:
 *   post:
 *     summary: Upload a document image
 *     description: Uploads a specific side of the ID (Front, Back, or Selfie). Uses multipart/form-data.
 *     tags: [Verification]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [verificationId, documentSide, document]
 *             properties:
 *               verificationId:
 *                 type: string
 *               documentSide:
 *                 type: string
 *                 enum: [FRONT, BACK, SELFIE]
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: The image file (JPG/PNG/PDF)
 *     responses:
 *       201:
 *         description: Document uploaded and linked successfully
 *       403:
 *         description: Unauthorized - You don't own this verification request
 */
router.post('/upload',
    requireAuth,
    upload.single('document'),
    verificationController.uploadDocument
);

/**
 * @swagger
 * /api/verification/my-status:
 *   get:
 *     summary: Get status of own verification
 *     description: Returns the latest verification request for the logged-in user, including a list of uploaded documents.
 *     tags: [Verification]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current status and document metadata
 *       404:
 *         description: No verification request found
 */
router.get('/my-status', requireAuth, verificationController.getMyVerification);

/**
 * @swagger
 * /api/verification/details/{id}:
 *   get:
 *     summary: Get full details of a request (Admin Only)
 *     tags: [Verification]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Full request data including unmasked document numbers
 */
router.get('/details/:id', requireAuth, requireAdmin, verificationController.getVerificationById);

/**
 * @swagger
 * /api/verification/view/{filename}:
 *   get:
 *     summary: Securely view/stream a document file
 *     description: Accesses the private storage to serve the image file. Only the Owner or an Admin can access this.
 *     tags: [Verification]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The image file
 *       403:
 *         description: Access Denied
 */
router.get('/view/:filename', requireAuth, verificationController.viewDocument);

/**
 * @swagger
 * /api/verification/requests/list:
 *   get:
 *     summary: List all verification requests (Admin Only)
 *     tags: [Verification]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *     responses:
 *       200:
 *         description: List of requests with populated user data
 */
router.get('/requests/list', requireAuth, requireAdmin, verificationController.adminListVerifications);

/**
 * @swagger
 * /api/verification/review/{id}:
 *   patch:
 *     summary: Approve or Reject a verification (Admin Only)
 *     description: Finalizes the KYC process. If approved, user.isVerified becomes true.
 *     tags: [Verification]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *               expiresAt:
 *                 type: string
 *                 format: date
 *               reviewNote:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.patch('/review/:id', requireAuth, requireAdmin, verificationController.reviewVerification);

/**
 * @swagger
 * /api/verification/document/{documentId}:
 *   delete:
 *     summary: Remove a specific document
 *     description: Deletes an uploaded file from disk and DB. Only allowed if status is PENDING.
 *     tags: [Verification]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document deleted successfully
 */
router.delete('/document/:documentId', requireAuth, verificationController.deleteDocument);

/**
 * @swagger
 * /api/verification/request/{id}:
 *   delete:
 *     summary: Cancel and Reset verification request
 *     description: Permanently deletes the verification request and all uploaded document files from the server. Only allowed for PENDING or REJECTED requests.
 *     tags: [Verification]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request and files deleted successfully
 *       400:
 *         description: Cannot delete an APPROVED request
 *       403:
 *         description: Unauthorized
 */
router.delete('/request/:id', requireAuth, verificationController.cancelVerification);

/**
 * @swagger
 * /api/verification/request/{id}:
 *   patch:
 *     summary: Update an existing verification draft
 *     description: Allows the user to fix typos in document number or country code while the request is still in DRAFT status.
 *     tags: [Verification]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               verificationType:
 *                 type: string
 *                 enum: [ID_CARD, PASSPORT, DRIVERS_LICENSE]
 *               documentNumber:
 *                 type: string
 *               countryCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Draft updated successfully
 *       400:
 *         description: Cannot edit - Request is no longer a draft
 *       403:
 *         description: Unauthorized
 */
router.patch('/request/:id', requireAuth, verificationController.updateVerificationRequest);

/**
 * @swagger
 * /api/verification/submit/{id}:
 *   post:
 *     summary: Finalize and submit request for Admin review
 *     description: Changes status from DRAFT to PENDING. Validates that FRONT, BACK, and SELFIE documents are uploaded.
 *     tags: [Verification]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Submitted successfully
 *       400:
 *         description: Incomplete - Missing required document sides
 */
router.post('/submit/:id', requireAuth, verificationController.submitVerification);

/**
 * @swagger
 * /api/verification/resubmit/{id}:
 *   post:
 *     summary: Reset a rejected request to Draft
 *     description: If an admin rejected the request, the user can call this to move it back to DRAFT to make corrections.
 *     tags: [Verification]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status reset to DRAFT successfully
 *       400:
 *         description: Request is not in REJECTED state
 */
router.post('/resubmit/:id', requireAuth, verificationController.resubmitVerification);

/**
 * @swagger
 * /api/verification/stats:
 *   get:
 *     summary: Get verification statistics (Admin Only)
 *     description: Returns total counts grouped by status (Draft, Pending, Approved, etc.)
 *     tags: [Verification]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Statistics object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     total: { type: number }
 *                     breakdown: { type: array, items: { type: object } }
 */
router.get('/stats', requireAuth, requireAdmin, verificationController.getVerificationStats);

module.exports = router;