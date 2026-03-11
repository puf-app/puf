const User = require('../models/User');

const updateLastSeen = async (req, res, next) => {
    const userId = (req.user && req.user._id) || (req.session && req.session.userId);

    if (userId) {
        try {
            const now = new Date();

            const lastSeen = req.user ? req.user.lastSeenAt : null;

            if (!lastSeen || (now - lastSeen) > 5 * 60 * 1000) {
                await User.findByIdAndUpdate(userId, {
                    lastSeenAt: now
                });
            }
        } catch (err) {
            console.error("Failed to update lastSeenAt:", err);
        }
    }
    next();
};

module.exports = {updateLastSeen};