const express = require('express');
const router = express.Router();
const debtEvidenceController = require('../controllers/debtEvidenceController');
const { requireAuth } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: DebtEvidence
 *   description: Debt evidence file management
 */

/**
 * @swagger
 * /api/debtEvidence/createDebtEvidence:
 *   post:
 *     summary: Upload evidence for a debt
 *     tags: [DebtEvidence]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [debt_id, file_name, file_type, file_url]
 *             properties:
 *               debt_id: { type: string, example: "664f1b2e8a1c2d3e4f5a6b7c" }
 *               file_name: { type: string, example: "receipt.pdf" }
 *               file_type: { type: string, example: "application/pdf" }
 *               file_url: { type: string, example: "https://storage.example.com/receipt.pdf" }
 *               file_storage_id: { type: string, example: "abc123" }
 *               evidence_type: { type: string, example: "RECEIPT" }
 *               description: { type: string, example: "Receipt from the restaurant" }
 *     responses:
 *       201:
 *         description: Debt evidence uploaded successfully
 *       400:
 *         description: Bad Request - Missing fields
 *       403:
 *         description: Forbidden - Not a party of this debt
 *       404:
 *         description: Debt not found
 *       500:
 *         description: Server error
 */
router.post('/createDebtEvidence', requireAuth, debtEvidenceController.createDebtEvidence);

/**
 * @swagger
 * /api/debtEvidence/updateDebtEvidence/{id}:
 *   patch:
 *     summary: Update debt evidence description or type (creditor only)
 *     tags: [DebtEvidence]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Evidence ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description: { type: string, example: "Updated description" }
 *               evidence_type: { type: string, example: "INVOICE" }
 *     responses:
 *       200:
 *         description: Debt evidence updated successfully
 *       400:
 *         description: Bad Request - No fields provided
 *       403:
 *         description: Forbidden - Not the creditor
 *       404:
 *         description: Evidence not found
 *       500:
 *         description: Server error
 */
router.patch('/updateDebtEvidence/:id', requireAuth, debtEvidenceController.updateDebtEvidence);

/**
 * @swagger
 * /api/debtEvidence/deleteDebtEvidence/{id}:
 *   delete:
 *     summary: Delete a debt evidence entry (uploader only)
 *     tags: [DebtEvidence]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Evidence ID
 *     responses:
 *       200:
 *         description: Debt evidence deleted successfully
 *       403:
 *         description: Forbidden - Not the uploader
 *       404:
 *         description: Evidence not found
 *       500:
 *         description: Server error
 */
router.delete('/deleteDebtEvidence/:id', requireAuth, debtEvidenceController.deleteDebtEvidence);

router.get('/getDebtEvidences', requireAuth, debtEvidenceController.getDebtEvidences);
router.get('/getDebtEvidence/:id', requireAuth, debtEvidenceController.getDebtEvidenceById);
module.exports = router;