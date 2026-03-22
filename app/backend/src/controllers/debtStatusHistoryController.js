const DebtStatusHistory = require('../models/DebtStatusHistory');
const Debt = require('../models/Debt');

const createDebtStatusHistory = async (req, res) => {
    try {
        const changedByUserId = req.session.userId;
        const { debt_id, old_status, new_status, note } = req.body;

        if (!debt_id || !old_status || !new_status) {
            return res.status(400).json({ data: {}, error: "debt_id, old_status and new_status are required" });
        }

        const debt = await Debt.findById(debt_id);
        if (!debt) {
            return res.status(404).json({ data: {}, error: "Debt not found" });
        }

        const isCreditor = debt.creditorUserId.toString() === changedByUserId;
        const isDebtor = debt.debtorUserId.toString() === changedByUserId;
        if (!isCreditor && !isDebtor) {
            return res.status(403).json({ data: {}, error: "You are not authorized to add status history to this debt" });
        }

        const history = new DebtStatusHistory({
            debtId: debt._id,
            changedByUserId,
            oldStatus: old_status,
            newStatus: new_status,
            note: note || null
        });

        await history.save();

        return res.status(201).json({
            data: { message: "Debt status history entry created successfully", history },
            error: ""
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: "Internal server error while creating debt status history" });
    }
};

const updateDebtStatusHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.userId;
        const { note } = req.body;

        if (note === undefined) {
            return res.status(400).json({ data: {}, error: "note is required" });
        }

        const history = await DebtStatusHistory.findById(id).populate('debtId');
        if (!history) {
            return res.status(404).json({ data: {}, error: "Debt status history entry not found" });
        }

        if (history.debtId.creditorUserId.toString() !== userId) {
            return res.status(403).json({ data: {}, error: "You are not authorized to update this history entry" });
        }

        history.note = note;
        await history.save();

        return res.status(200).json({
            data: { message: "Debt status history entry updated successfully", history },
            error: ""
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: "Internal server error while updating debt status history" });
    }
};

const deleteDebtStatusHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.userId;

        const history = await DebtStatusHistory.findById(id).populate('debtId');
        if (!history) {
            return res.status(404).json({ data: {}, error: "Debt status history entry not found" });
        }

        if (history.debtId.creditorUserId.toString() !== userId) {
            return res.status(403).json({ data: {}, error: "You are not authorized to delete this history entry" });
        }

        await history.deleteOne();

        return res.status(200).json({
            data: { message: "Debt status history entry deleted successfully" },
            error: ""
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: "Internal server error while deleting debt status history" });
    }
};
const getDebtStatusHistories = async (req, res) => {
    try {
        const userId = req.session.userId;
        const isAdmin = req.session.role === 'admin';
 
        let query = {};
        if (!isAdmin) {
            const userDebts = await Debt.find({
                $or: [{ creditorUserId: userId }, { debtorUserId: userId }]
            }).select('_id');
            const debtIds = userDebts.map(d => d._id);
            query = { debtId: { $in: debtIds } };
        }
 
        const histories = await DebtStatusHistory.find(query)
            .populate('debtId', 'title status')
            .populate('changedByUserId', 'username firstName lastName')
            .sort({ changedAt: -1 });
 
        return res.status(200).json({
            data: { histories },
            error: ''
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: 'Internal server error while fetching debt status histories' });
    }
};
 
const getDebtStatusHistoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.userId;
        const isAdmin = req.session.role === 'admin';
 
        const history = await DebtStatusHistory.findById(id)
            .populate('debtId', 'title status creditorUserId debtorUserId')
            .populate('changedByUserId', 'username firstName lastName');
 
        if (!history) {
            return res.status(404).json({ data: {}, error: 'Debt status history entry not found' });
        }
 
        const isParty = history.debtId.creditorUserId.toString() === userId || history.debtId.debtorUserId.toString() === userId;
        if (!isAdmin && !isParty) {
            return res.status(403).json({ data: {}, error: 'You are not authorized to view this history entry' });
        }
 
        return res.status(200).json({
            data: { history },
            error: ''
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: 'Internal server error while fetching debt status history' });
    }
};
 

module.exports = { createDebtStatusHistory, updateDebtStatusHistory, deleteDebtStatusHistory };