const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;
const validator = require('validator');

const userSchema = new Schema({
    firstName: {type: String, maxLength: 100, required: true},
    lastName: {type: String, maxLength: 100, required: true},
    username: {type: String, maxLength: 50, unique: true, required: true},
    email: {type: String, maxLength: 255, unique: true, required: true, trim: true, lowercase: true, validate: {
            validator: function(value) {
                const isEmail = validator.isEmail(value);
                const isDisposable = value.endsWith('mailinator.com') || value.endsWith('tempmail.com');
                return isEmail && !isDisposable;
            },
            message: "Please use a valid, permanent email address."
        }},
    phone: {type: String, maxLength: 30, default: null},

    password: {type: String, required: true},

    profileImageUrl: {type: String, maxLength: 500},
    isVerified: {type: Boolean, default: false},
    verificationLevel: {
        type: String, maxLength: 30, enum: ['NONE', 'BASIC', 'IDENTITY', 'ENHANCED'],
        default: 'NONE'
    },

    authenticators: [{
        credentialID: { type: String, required: true },
        publicKey: { type: String, required: true },
        counter: { type: Number, default: 0 },
        transports: [String]
    }],
    currentChallenge: { type: String },

    lastLoginAt: {type: Date},
    lastSeenAt: {type: Date},
    status: {
        type: String, maxLength: 30, enum: ['ACTIVE', 'SUSPENDED', 'DEACTIVATED'],
        default: 'ACTIVE'
    },

    admin: {type: Boolean, default: false},
    company: {type: Boolean, default: false}
}, {
    collection: 'users',
    timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}
});

userSchema.pre('save', async function () {
    const user = this;

    if (!user.isModified('password')) return;

    try {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    } catch (err) {
        throw err;
    }
});

userSchema.statics.authenticate = function(username, password, callback) {
    this.findOne({ username: username })
        .exec(function(err, user) {
            if (err) return callback(err);
            if (!user) {
                const error = new Error("User not found.");
                error.status = 401;
                return callback(error);
            }

            if (user.status !== 'ACTIVE') {
                const error = new Error(`Account is ${user.status.toLowerCase()}.`);
                error.status = 403;
                return callback(error);
            }

            bcrypt.compare(password, user.password, function(err, result) {
                if (result === true) return callback(null, user);
                return callback();
            });
        });
}

const User = mongoose.model('User', userSchema);
module.exports = User;
