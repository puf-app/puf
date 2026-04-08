const express = require('express');
const router = express.Router();
const debtStatusHistoryController = require('../controllers/debtStatusHistoryController');
const { requireAuth } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: DebtStatusHistory
 *   description: Debt status history tracking
 */

/**
 * @swagger
 * /api/debtStatusHistory/createDebtStatusHistory:
 *   post:
 *     summary: Create a debt status history entry
 *     tags: [DebtStatusHistory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [debt_id, old_status, new_status]
 *             properties:
 *               debt_id: { type: string, example: "664f1b2e8a1c2d3e4f5a6b7c" }
 *               old_status: { type: string, example: "PENDING" }
 *               new_status: { type: string, example: "ACCEPTED" }
 *               note: { type: string, example: "Debtor confirmed the amount" }
 *     responses:
 *       201:
 *         description: Debt status history entry created successfully
 *       400:
 *         description: Bad Request - Missing fields
 *       403:
 *         description: Forbidden - Not a party of this debt
 *       404:
 *         description: Debt not found
 *       500:
 *         description: Server error
 */
router.post('/createDebtStatusHistory', requireAuth, debtStatusHistoryController.createDebtStatusHistory);

/**
 * @swagger
 * /api/debtStatusHistory/updateDebtStatusHistory/{id}:
 *   patch:
 *     summary: Update a debt status history entry note (creditor only)
 *     tags: [DebtStatusHistory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: History entry ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [note]
 *             properties:
 *               note: { type: string, example: "Updated note" }
 *     responses:
 *       200:
 *         description: Debt status history entry updated successfully
 *       400:
 *         description: Bad Request - Missing note
 *       403:
 *         description: Forbidden - Not the creditor
 *       404:
 *         description: History entry not found
 *       500:
 *         description: Server error
 */
router.patch('/updateDebtStatusHistory/:id', requireAuth, debtStatusHistoryController.updateDebtStatusHistory);

/**
 * @swagger
 * /api/debtStatusHistory/deleteDebtStatusHistory/{id}:
 *   delete:
 *     summary: Delete a debt status history entry (creditor only)
 *     tags: [DebtStatusHistory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: History entry ID
 *     responses:
 *       200:
 *         description: Debt status history entry deleted successfully
 *       403:
 *         description: Forbidden - Not the creditor
 *       404:
 *         description: History entry not found
 *       500:
 *         description: Server error
 */
router.delete('/deleteDebtStatusHistory/:id', requireAuth, debtStatusHistoryController.deleteDebtStatusHistory);

router.get('/getDebtStatusHistories', requireAuth, debtStatusHistoryController.getDebtStatusHistories);
router.get('/getDebtStatusHistory/:id', requireAuth, debtStatusHistoryController.getDebtStatusHistoryById);
module.exports = router;