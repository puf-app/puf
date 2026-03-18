const User = require('../models/User');
const bcrypt = require('bcrypt');

const registerUser = async (req, res) => {
    try {
        const {firstName, lastName, username, email, password, phone} = req.body;

        if (!firstName || !lastName || !username || !email || !password) {
            return res.status(400).json({data: {}, error: "Firstname, lastname, username, email and password are required"});
        }

        const existingUser = await User.findOne({$or: [{email}, {username}]});
        if (existingUser) {
            return res.status(400).json({data: {}, error: "User or Email already exist"});
        }


        const newUser = new User({
            firstName,
            lastName,
            username,
            email,
            phone,
            password,
            profileImageUrl: null,
            lastSeenAt: new Date()
        });

        await newUser.save();

        return res.status(201).json({
            data: {
                message: "User registered successfully",
                user: {username: newUser.username, email: newUser.email}
            },
            error: ""
        });

    } catch (error) {
        return res.status(500).json({
            data: {},
            error: "Internal server error during registration"
        })
    }
};

const loginUser = async (req, res) => {
    try {
        const {username, password} = req.body;

        if (!username || !password) {
            return res.status(400).json({data: {}, error: "Username and password are required"});
        }

        const user = await User.findOne({username});
        if (!user) {
            return res.status(401).json({data: {}, error: "Invalid credentials"});
        }

        if (user.status === 'SUSPENDED') {
            return res.status(401).json({ data: {}, error: "Your account is suspended. Please contact support." });
        }
        if (user.status === 'DEACTIVATED') {
            return res.status(401).json({ data: {}, error: "Account deactivated. Please reactivate it first." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({data: {}, error: "Invalid credentials"});
        }

        user.lastLoginAt = new Date();
        await user.save();

        req.session.userId = user._id;
        req.session.role = user.admin ? 'admin' : 'user';

        return res.status(200).json({
            data: {message: "Login successful", user: {username: user.username, admin: user.admin}},
            error: ""
        })
    } catch (error) {
        console.error("LOGIN CRASH ERROR:", error);
        return res.status(500).json({
            data: {},
            error: "Server error while logging in"
        });
    }
};

const logoutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                data: {},
                error: "Error logging out"
            });
        }

        res.clearCookie('puf_session')
        return res.status(200).json({
            data: {message: "Logout successful"},
            error: ""
        });
    });
};

const changePassword = async (req, res) => {
    try {
        const {oldPassword, newPassword} = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                data: {},
                error: "Both old and new passwords are required"
            });
        }

        const user = req.user;

        if (!user) {
            return res.status(404).json({
                data: {},
                error: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                data: {},
                error: "Invalid current password"
            });
        }

        user.password = newPassword;
        await user.save();

        return res.status(200).json({
            data: {message: "Password updated successfully"},
            error: ""
        });
    } catch (error) {
        return res.status(500).json({
            data: {},
            error: "Internal server error while changing password"
        });
    }
}

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    changePassword
};

