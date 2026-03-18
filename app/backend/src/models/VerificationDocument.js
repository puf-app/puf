const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const verificationDocumentSchema = new Schema({
   verificationId: { type: Schema.Types.ObjectId, ref: 'UserVerification', required: true },

    documentSide: {
        type: String,
        required: true,
        enum: ['FRONT', 'BACK', 'SELFIE'],
        uppercase: true
    },
    fileName: { type: String, maxLength: 255, required: true },
    fileType: { type: String, maxLength: 100, required: true },
    fileUrl: { type: String, maxLength: 500, required: true },
    fileStorageId: { type: String, maxLength: 255, required: true }
}, {
    collection: 'verification_documents',
    timestamps: { createdAt: 'uploadedAt', updatedAt: false }
});

const VerificationDocument = mongoose.model('VerificationDocument', verificationDocumentSchema);
module.exports = VerificationDocument;
