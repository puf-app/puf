const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');

const userVerificationSchema = new Schema({

    userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},

    verificationType: {
        type: String,
        maxLength: 30,
        required: true,
        enum: ['ID_CARD', 'PASSPORT', 'DRIVERS_LICENSE'],
        uppercase: true
    },
    documentNumber: {type: String, maxLength: 100, required: true},
    countryCode: {
        type: String, minLength: 2,
        maxLength: 2, required: true, uppercase: true, trim: true,
        validate: {
            validator: function (v) {
                return validator.isISO31661Alpha2(v);
            },
            message: props => `${props.value} is not a valid ISO country code!`
        }
    },
    status: {type: String, maxLength: 30, enum: ['DRAFT','PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'], default: 'DRAFT'},

    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: {type: Date},
    expiresAt: {type: Date},
    reviewNote: {type: String, maxLength: 500}
}, {
    collection: 'user_verifications',
    timestamps: {createdAt: 'requestedAt', updatedAt: false}
});

const UserVerification = mongoose.model('UserVerification', userVerificationSchema);
module.exports = UserVerification;
