const express = require('express');
const router = express.Router();
const debtEvidenceController = require('../controllers/debt_evidenceController');
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
 *               debt_id: { type: integer, example: 1 }
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
 * /api/debtEvidence/deleteDebtEvidence/{id}:
 *   delete:
 *     summary: Delete a debt evidence entry
 *     tags: [DebtEvidence]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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

module.exports = router;