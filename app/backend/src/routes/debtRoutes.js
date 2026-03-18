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
 *             required: [debtor_username, title, amount, currency]
 *             properties:
 *               debtor_username: { type: string, example: "florijan123" }
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
 *       404:
 *         description: Debtor user not found
 *       500:
 *         description: Server error
 */
router.post('/createDebt', requireAuth, debtController.createDebt);

/**
 * @swagger
 * /api/debts/updateDebt/{id}:
 *   patch:
 *     summary: Update a debt (creditor only)
 *     tags: [Debts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Debt ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string, example: "Lunch money" }
 *               description: { type: string, example: "Updated description" }
 *               reason: { type: string, example: "Personal loan" }
 *               amount: { type: number, example: 15.00 }
 *               currency: { type: string, example: "EUR" }
 *               due_date: { type: string, format: date-time, example: "2025-12-31T00:00:00Z" }
 *     responses:
 *       200:
 *         description: Debt updated successfully
 *       400:
 *         description: Bad Request
 *       403:
 *         description: Forbidden - Not the creditor
 *       404:
 *         description: Debt not found
 *       500:
 *         description: Server error
 */
router.patch('/updateDebt/:id', requireAuth, debtController.updateDebt);

/**
 * @swagger
 * /api/debts/completeDebt/{id}:
 *   patch:
 *     summary: Mark a debt as paid (creditor only)
 *     tags: [Debts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Debt ID
 *     responses:
 *       200:
 *         description: Debt marked as paid
 *       400:
 *         description: Debt is already paid
 *       403:
 *         description: Forbidden - Not the creditor
 *       404:
 *         description: Debt not found
 *       500:
 *         description: Server error
 */
router.patch('/completeDebt/:id', requireAuth, debtController.completeDebt);

/**
 * @swagger
 * /api/debts/deleteDebt/{id}:
 *   delete:
 *     summary: Delete a debt (creditor only)
 *     tags: [Debts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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