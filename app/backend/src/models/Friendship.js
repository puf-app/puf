const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const friendshipSchema = new Schema({

    user1Id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    user2Id: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    status: { type: String, maxLength: 30 }
}, {
    collection: 'friendships',
    timestamps: { createdAt: 'createdAt', updatedAt: false }
});

const Friendship = mongoose.model('Friendship', friendshipSchema);
module.exports = Friendship;
