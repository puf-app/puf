const Debt = require('../models/Debt');
const User = require('../models/User');

const createDebt = async (req, res) => {
    try {
        const creditorUserId = req.session.userId;
        const {
            debtor_username,
            title,
            description,
            amount,
            currency,
            reason,
            due_date,
            verification_required
        } = req.body;

        if (!debtor_username || !title || !amount || !currency) {
            return res.status(400).json({ data: {}, error: "debtor_username, title, amount and currency are required" });
        }

        const debtor = await User.findOne({ username: debtor_username });
        if (!debtor) {
            return res.status(404).json({ data: {}, error: "Debtor user not found" });
        }

        if (creditorUserId === debtor._id.toString()) {
            return res.status(400).json({ data: {}, error: "You cannot create a debt with yourself" });
        }

        const debt = new Debt({
            creditorUserId,
            debtorUserId: debtor._id,
            title,
            description: description || null,
            amount,
            currency,
            reason: reason || null,
            status: 'PENDING',
            dueDate: due_date || null,
            verificationRequired: verification_required ?? false
        });

        await debt.save();

        return res.status(201).json({
            data: { message: "Debt created successfully", debt },
            error: ""
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: "Internal server error while creating debt" });
    }
};

const updateDebt = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.userId;
        const { title, description, reason, amount, currency, due_date } = req.body;

        const debt = await Debt.findById(id);
        if (!debt) {
            return res.status(404).json({ data: {}, error: "Debt not found" });
        }

        if (debt.creditorUserId.toString() !== userId) {
            return res.status(403).json({ data: {}, error: "You are not authorized to update this debt" });
        }

        if (title !== undefined) debt.title = title;
        if (description !== undefined) debt.description = description;
        if (reason !== undefined) debt.reason = reason;
        if (amount !== undefined) debt.amount = amount;
        if (currency !== undefined) debt.currency = currency;
        if (due_date !== undefined) debt.dueDate = due_date;

        await debt.save();

        return res.status(200).json({
            data: { message: "Debt updated successfully", debt },
            error: ""
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: "Internal server error while updating debt" });
    }
};

const completeDebt = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.userId;

        const debt = await Debt.findById(id);
        if (!debt) {
            return res.status(404).json({ data: {}, error: "Debt not found" });
        }

        if (debt.creditorUserId.toString() !== userId) {
            return res.status(403).json({ data: {}, error: "You are not authorized to complete this debt" });
        }

        if (debt.status === 'PAID') {
            return res.status(400).json({ data: {}, error: "Debt is already marked as paid" });
        }

        debt.status = 'PAID';
        debt.paidAt = new Date();

        await debt.save();

        return res.status(200).json({
            data: { message: "Debt marked as paid", debt },
            error: ""
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: "Internal server error while completing debt" });
    }
};

const deleteDebt = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.userId;

        const debt = await Debt.findById(id);
        if (!debt) {
            return res.status(404).json({ data: {}, error: "Debt not found" });
        }

        if (debt.creditorUserId.toString() !== userId) {
            return res.status(403).json({ data: {}, error: "You are not authorized to delete this debt" });
        }

        await debt.deleteOne();

        return res.status(200).json({
            data: { message: "Debt deleted successfully" },
            error: ""
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: "Internal server error while deleting debt" });
    }
};
const getDebts = async (req, res) => {
    try {
        const userId = req.session.userId;
        const isAdmin = req.session.role === 'admin';
 
        const query = isAdmin
            ? {}
            : { $or: [{ creditorUserId: userId }, { debtorUserId: userId }] };
 
        const debts = await Debt.find(query)
            .populate('creditorUserId', 'username firstName lastName')
            .populate('debtorUserId', 'username firstName lastName')
            .sort({ createdAt: -1 });
 
        return res.status(200).json({
            data: { debts },
            error: ''
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: 'Internal server error while fetching debts' });
    }
};
 
const getDebtById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.userId;
        const isAdmin = req.session.role === 'admin';
 
        const debt = await Debt.findById(id)
            .populate('creditorUserId', 'username firstName lastName')
            .populate('debtorUserId', 'username firstName lastName');
 
        if (!debt) {
            return res.status(404).json({ data: {}, error: 'Debt not found' });
        }
 
        const isParty = debt.creditorUserId._id.toString() === userId || debt.debtorUserId._id.toString() === userId;
        if (!isAdmin && !isParty) {
            return res.status(403).json({ data: {}, error: 'You are not authorized to view this debt' });
        }
 
        return res.status(200).json({
            data: { debt },
            error: ''
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: 'Internal server error while fetching debt' });
    }
};

module.exports = { createDebt, updateDebt, completeDebt, deleteDebt, getDebts, getDebtById };