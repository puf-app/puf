const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const friendRequestSchema = new Schema({

    senderUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    status: { type: String, maxLength: 30 },
    message: { type: String, maxLength: 500 },

    respondedAt: { type: Date }
}, {
    collection: 'friend_requests',
    timestamps: { createdAt: 'createdAt', updatedAt: false }
});

const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);
module.exports = FriendRequest;
