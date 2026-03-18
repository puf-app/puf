const DebtEvidence = require('../models/DebtEvidence');
const Debt = require('../models/Debt');

const createDebtEvidence = async (req, res) => {
    try {
        const uploadedByUserId = req.session.userId;
        const { debt_id, file_name, file_type, file_url, file_storage_id, evidence_type, description } = req.body;

        if (!debt_id || !file_name || !file_type || !file_url) {
            return res.status(400).json({ data: {}, error: "debt_id, file_name, file_type and file_url are required" });
        }

        const debt = await Debt.findById(debt_id);
        if (!debt) {
            return res.status(404).json({ data: {}, error: "Debt not found" });
        }

        const isCreditor = debt.creditorUserId.toString() === uploadedByUserId;
        const isDebtor = debt.debtorUserId.toString() === uploadedByUserId;
        if (!isCreditor && !isDebtor) {
            return res.status(403).json({ data: {}, error: "You are not authorized to upload evidence for this debt" });
        }

        const evidence = new DebtEvidence({
            debtId: debt._id,
            uploadedByUserId,
            fileName: file_name,
            fileType: file_type,
            fileUrl: file_url,
            fileStorageId: file_storage_id || null,
            evidenceType: evidence_type || null,
            description: description || null
        });

        await evidence.save();

        return res.status(201).json({
            data: { message: "Debt evidence uploaded successfully", evidence },
            error: ""
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: "Internal server error while uploading debt evidence" });
    }
};

const updateDebtEvidence = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.userId;
        const { description, evidence_type } = req.body;

        if (description === undefined && evidence_type === undefined) {
            return res.status(400).json({ data: {}, error: "At least one of description or evidence_type is required" });
        }

        const evidence = await DebtEvidence.findById(id).populate('debtId');
        if (!evidence) {
            return res.status(404).json({ data: {}, error: "Debt evidence not found" });
        }

        if (evidence.debtId.creditorUserId.toString() !== userId) {
            return res.status(403).json({ data: {}, error: "You are not authorized to update this evidence" });
        }

        if (description !== undefined) evidence.description = description;
        if (evidence_type !== undefined) evidence.evidenceType = evidence_type;

        await evidence.save();

        return res.status(200).json({
            data: { message: "Debt evidence updated successfully", evidence },
            error: ""
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: "Internal server error while updating debt evidence" });
    }
};

const deleteDebtEvidence = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.userId;

        const evidence = await DebtEvidence.findById(id);
        if (!evidence) {
            return res.status(404).json({ data: {}, error: "Debt evidence not found" });
        }

        if (evidence.uploadedByUserId.toString() !== userId) {
            return res.status(403).json({ data: {}, error: "You are not authorized to delete this evidence" });
        }

        await evidence.deleteOne();

        return res.status(200).json({
            data: { message: "Debt evidence deleted successfully" },
            error: ""
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: "Internal server error while deleting debt evidence" });
    }
};

module.exports = { createDebtEvidence, updateDebtEvidence, deleteDebtEvidence };