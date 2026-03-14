const pool = require('../db');

const createDebtStatusHistory = async (req, res) => {
    try {
        const changed_by_user_id = req.session.userId;
        const { debt_id, old_status, new_status, note } = req.body;

        if (!debt_id || !old_status || !new_status) {
            return res.status(400).json({ data: {}, error: "debt_id, old_status and new_status are required" });
        }

        const debt = await pool.query(`SELECT * FROM debts WHERE debt_id = $1`, [debt_id]);

        if (debt.rows.length === 0) {
            return res.status(404).json({ data: {}, error: "Debt not found" });
        }

        const { creditor_user_id, debtor_user_id } = debt.rows[0];
        if (changed_by_user_id !== creditor_user_id && changed_by_user_id !== debtor_user_id) {
            return res.status(403).json({ data: {}, error: "You are not authorized to add status history to this debt" });
        }

        const result = await pool.query(
            `INSERT INTO debt_status_history
                (debt_id, changed_by_user_id, old_status, new_status, note, changed_at)
             VALUES ($1, $2, $3, $4, $5, NOW())
             RETURNING *`,
            [debt_id, changed_by_user_id, old_status, new_status, note || null]
        );

        return res.status(201).json({
            data: { message: "Debt status history entry created successfully", history: result.rows[0] },
            error: ""
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: "Internal server error while creating debt status history" });
    }
};

const deleteDebtStatusHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.userId;

        const history = await pool.query(
            `SELECT dsh.*, d.creditor_user_id
             FROM debt_status_history dsh
             JOIN debts d ON d.debt_id = dsh.debt_id
             WHERE dsh.history_id = $1`,
            [id]
        );

        if (history.rows.length === 0) {
            return res.status(404).json({ data: {}, error: "Debt status history entry not found" });
        }

        if (history.rows[0].creditor_user_id !== userId) {
            return res.status(403).json({ data: {}, error: "You are not authorized to delete this history entry" });
        }

        await pool.query(`DELETE FROM debt_status_history WHERE history_id = $1`, [id]);

        return res.status(200).json({
            data: { message: "Debt status history entry deleted successfully" },
            error: ""
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: "Internal server error while deleting debt status history" });
    }
};

module.exports = {
    createDebtStatusHistory,
    deleteDebtStatusHistory
};