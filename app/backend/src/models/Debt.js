const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const debtSchema = new Schema({

    creditorUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    debtorUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    title: { type: String, maxLength: 150 },
    description: { type: String, maxLength: 1000 },

    amount: { type: Schema.Types.Decimal128 },
    currency: { type: String, maxLength: 10 },
    reason: { type: String, maxLength: 255 },
    status: { type: String, maxLength: 30 },

    dueDate: { type: Date },
    acceptedAt: { type: Date },
    rejectedAt: { type: Date },
    paidAt: { type: Date },

    verificationRequired: { type: Boolean },
    verificationThresholdSnapshot: { type: Schema.Types.Decimal128 }
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

const Debt = mongoose.model('Debt', debtSchema);
module.exports = Debt;