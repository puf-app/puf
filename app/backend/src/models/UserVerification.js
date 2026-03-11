const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userVerificationSchema = new Schema({

    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    verificationType: { type: String, maxLength: 30 },
    documentNumber: { type: String, maxLength: 100 },
    countryCode: { type: String, maxLength: 10 },
    status: { type: String, maxLength: 30 },

    reviewedAt: { type: Date },
    expiresAt: { type: Date },
    reviewNote: { type: String, maxLength: 500 }
}, {
    timestamps: { createdAt: 'requestedAt', updatedAt: false }
});

const UserVerification = mongoose.model('UserVerification', userVerificationSchema);
module.exports = UserVerification;