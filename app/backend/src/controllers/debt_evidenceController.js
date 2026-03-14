const pool = require('../db');

const createDebtEvidence = async (req, res) => {
    try {
        const uploaded_by_user_id = req.session.userId;
        const { debt_id, file_name, file_type, file_url, file_storage_id, evidence_type, description } = req.body;

        if (!debt_id || !file_name || !file_type || !file_url) {
            return res.status(400).json({ data: {}, error: "debt_id, file_name, file_type and file_url are required" });
        }

        const debt = await pool.query(`SELECT * FROM debts WHERE debt_id = $1`, [debt_id]);

        if (debt.rows.length === 0) {
            return res.status(404).json({ data: {}, error: "Debt not found" });
        }

        const { creditor_user_id, debtor_user_id } = debt.rows[0];
        if (uploaded_by_user_id !== creditor_user_id && uploaded_by_user_id !== debtor_user_id) {
            return res.status(403).json({ data: {}, error: "You are not authorized to upload evidence for this debt" });
        }

        const result = await pool.query(
            `INSERT INTO debt_evidence
                (debt_id, uploaded_by_user_id, file_name, file_type, file_url, file_storage_id, evidence_type, description, uploaded_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
             RETURNING *`,
            [debt_id, uploaded_by_user_id, file_name, file_type, file_url, file_storage_id || null, evidence_type || null, description || null]
        );

        return res.status(201).json({
            data: { message: "Debt evidence uploaded successfully", evidence: result.rows[0] },
            error: ""
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: "Internal server error while uploading debt evidence" });
    }
};

const deleteDebtEvidence = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.userId;

        const evidence = await pool.query(`SELECT * FROM debt_evidence WHERE evidence_id = $1`, [id]);

        if (evidence.rows.length === 0) {
            return res.status(404).json({ data: {}, error: "Debt evidence not found" });
        }

        if (evidence.rows[0].uploaded_by_user_id !== userId) {
            return res.status(403).json({ data: {}, error: "You are not authorized to delete this evidence" });
        }

        await pool.query(`DELETE FROM debt_evidence WHERE evidence_id = $1`, [id]);

        return res.status(200).json({
            data: { message: "Debt evidence deleted successfully" },
            error: ""
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: "Internal server error while deleting debt evidence" });
    }
};

module.exports = {
    createDebtEvidence,
    deleteDebtEvidence
};