const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const verificationDocumentSchema = new Schema({
   verificationId: { type: Schema.Types.ObjectId, ref: 'UserVerification', required: true },

    documentSide: { type: String, maxLength: 30 },
    fileName: { type: String, maxLength: 255 },
    fileType: { type: String, maxLength: 100 },
    fileUrl: { type: String, maxLength: 500 },
    fileStorageId: { type: String, maxLength: 255 }
}, {
    collection: 'verification_documents',
    timestamps: { createdAt: 'uploadedAt', updatedAt: false }
});

const VerificationDocument = mongoose.model('VerificationDocument', verificationDocumentSchema);
module.exports = VerificationDocument;
