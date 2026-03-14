const express = require('express');
const router = express.Router();
const debtStatusHistoryController = require('../controllers/debt_status_historyController');
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
 *               debt_id: { type: integer, example: 1 }
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
 * /api/debtStatusHistory/deleteDebtStatusHistory/{id}:
 *   delete:
 *     summary: Delete a debt status history entry
 *     tags: [DebtStatusHistory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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

module.exports = router;