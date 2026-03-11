const User = require('../models/User');

const requireAuth = async (req, res, next) => {
    try {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({
                data: {},
                error: "Unauthorized - please log in"
            });
        }

        const user = await User.findById(req.session.userId);

        if (!user || user.status !== 'ACTIVE') {
            req.session.destroy();
            const statusMsg = user ? `Your account is ${user.status.toLowerCase()}` : "User no longer exists";
            return res.status(401).json({data: {}, error: `Unauthorized - ${statusMsg}`});
        }

        req.user = user;

        return next();
    } catch (error) {
        return res.status(500).json({
            data: {},
            error: "Internal server error during authentication"
        });
    }
};

const requireAdmin = (req, res, next) => {
    if (req.user && req.user.admin === true) {
        return next();
    }

    return res.status(401).json({
        data: {},
        error: "Unauthorized - You need admin rights to access this page."
    })
};

const requireNotAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        return res.status(400).json({
            data: {},
            error: "Bad Request - You are already logged in"
        });
    }

    return next();
};

module.exports = {
    requireAuth,
    requireAdmin,
    requireNotAuth
}