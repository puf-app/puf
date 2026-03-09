//const UserModel = require('../models/userModel');

const requireAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }

    return res.status(401).json({
        data: {},
        error: "Unauthorized - you are not logged in"
    })
};

const requireAdmin = (req, res, next) => {
    if (req.session && req.session.userId && req.session.userId.role === 'admin') {
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
            error: "You are already logged in."
        });
    }

    return next();
};

module.exports = {
    requireAuth,
    requireAdmin,
    requireNotAuth
}