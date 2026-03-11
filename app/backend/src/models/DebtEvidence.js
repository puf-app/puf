const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const debtEvidenceSchema = new Schema({

    debtId: { type: Schema.Types.ObjectId, ref: 'Debt', required: true },
    uploadedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    fileName: { type: String, maxLength: 255 },
    fileType: { type: String, maxLength: 100 },
    fileUrl: { type: String, maxLength: 500 },
    fileStorageId: { type: String, maxLength: 255 },
    evidenceType: { type: String, maxLength: 30 },
    description: { type: String, maxLength: 500 }
}, {
    timestamps: { createdAt: 'uploadedAt', updatedAt: false }
});

const DebtEvidence = mongoose.model('DebtEvidence', debtEvidenceSchema);
module.exports = DebtEvidence;