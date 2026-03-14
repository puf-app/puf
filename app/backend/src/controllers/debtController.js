const pool = require('../db');

const createDebt = async (req, res) => {
    try {
        const creditor_user_id = req.session.userId;
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

        const debtorResult = await pool.query(
            `SELECT user_id FROM users WHERE username = $1`,
            [debtor_username]
        );

        if (debtorResult.rows.length === 0) {
            return res.status(404).json({ data: {}, error: "Debtor user not found" });
        }

        const debtor_user_id = debtorResult.rows[0].user_id;

        if (creditor_user_id === debtor_user_id) {
            return res.status(400).json({ data: {}, error: "You cannot create a debt with yourself" });
        }

        const result = await pool.query(
            `INSERT INTO debts
                (creditor_user_id, debtor_user_id, title, description, amount, currency, reason, status, due_date, created_at, updated_at, verification_required)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING', $8, NOW(), NOW(), $9)
             RETURNING *`,
            [creditor_user_id, debtor_user_id, title, description || null, amount, currency, reason || null, due_date || null, verification_required ?? false]
        );

        return res.status(201).json({
            data: { message: "Debt created successfully", debt: result.rows[0] },
            error: ""
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: "Internal server error while creating debt" });
    }
};

const deleteDebt = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.userId;

        const debt = await pool.query(`SELECT * FROM debts WHERE debt_id = $1`, [id]);

        if (debt.rows.length === 0) {
            return res.status(404).json({ data: {}, error: "Debt not found" });
        }

        if (debt.rows[0].creditor_user_id !== userId) {
            return res.status(403).json({ data: {}, error: "You are not authorized to delete this debt" });
        }

        await pool.query(`DELETE FROM debts WHERE debt_id = $1`, [id]);

        return res.status(200).json({
            data: { message: "Debt deleted successfully" },
            error: ""
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: "Internal server error while deleting debt" });
    }
};

module.exports = {
    createDebt,
    deleteDebt
};