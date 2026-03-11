const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: { type: String, maxLength: 100 },
    lastName: { type: String, maxLength: 100 },
    username: { type: String, maxLength: 50, unique: true, required: true },
    email: { type: String, maxLength: 255, unique: true, required: true },
    phone: { type: String, maxLength: 30 },

    password: { type: String, required: true },

    profileImageUrl: { type: String, maxLength: 500 },
    isVerified: { type: Boolean, default: false },
    verificationLevel: { type: String, maxLength: 30 },

    lastLoginAt: { type: Date },
    lastSeenAt: { type: Date },
    status: { type: String, maxLength: 30 },

    admin: { type: Boolean, default: false },
    company: { type: Boolean, default: false }
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

userSchema.pre('save', function(next) {
    const user = this;

    if (!user.isModified('password')) return next();

    bcrypt.hash(user.password, 10, function(err, hash) {
        if (err) {
            return next(err);
        }
        user.password = hash;
        next();
    });
});

userSchema.statics.authenticate = function(username, password, callback) {
    this.findOne({ username: username })
        .exec(function(err, user) {
            if (err) {
                return callback(err);
            } else if (!user) {
                const error = new Error("User not found.");
                error.status = 401;
                return callback(error);
            }

            bcrypt.compare(password, user.password, function(err, result) {
                if (result === true) {
                    return callback(null, user);
                } else {
                    return callback();
                }
            });
        });
}

const User = mongoose.model('User', userSchema);
module.exports = User;