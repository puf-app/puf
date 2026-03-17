const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const debtStatusHistorySchema = new Schema({

    debtId: { type: Schema.Types.ObjectId, ref: 'Debt', required: true },
    changedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    oldStatus: { type: String, maxLength: 30 },
    newStatus: { type: String, maxLength: 30 },
    note: { type: String, maxLength: 500 }
}, {
    collection: 'debt_status_history',
    timestamps: { createdAt: 'changedAt', updatedAt: false }
});

const DebtStatusHistory = mongoose.model('DebtStatusHistory', debtStatusHistorySchema);
module.exports = DebtStatusHistory;
