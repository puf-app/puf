const express = require('express');
const router = express.Router();
const debtController = require('../controllers/debtController');
const { requireAuth } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Debts
 *   description: Debt management
 */

/**
 * @swagger
 * /api/debts/createDebt:
 *   post:
 *     summary: Create a new debt
 *     tags: [Debts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [debtor_user_id, title, amount, currency]
 *             properties:
 *               debtor_user_id: { type: integer, example: 2 }
 *               title: { type: string, example: "Lunch money" }
 *               description: { type: string, example: "Borrowed for lunch on Friday" }
 *               amount: { type: number, example: 12.50 }
 *               currency: { type: string, example: "EUR" }
 *               reason: { type: string, example: "Personal loan" }
 *               due_date: { type: string, format: date-time, example: "2025-12-31T00:00:00Z" }
 *               verification_required: { type: boolean, example: false }
 *     responses:
 *       201:
 *         description: Debt created successfully
 *       400:
 *         description: Bad Request - Missing fields or invalid data
 *       500:
 *         description: Server error
 */
router.post('/createDebt', requireAuth, debtController.createDebt);

/**
 * @swagger
 * /api/debts/deleteDebt/{id}:
 *   delete:
 *     summary: Delete a debt
 *     tags: [Debts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Debt ID
 *     responses:
 *       200:
 *         description: Debt deleted successfully
 *       403:
 *         description: Forbidden - Not the creditor
 *       404:
 *         description: Debt not found
 *       500:
 *         description: Server error
 */
router.delete('/deleteDebt/:id', requireAuth, debtController.deleteDebt);

module.exports = router;