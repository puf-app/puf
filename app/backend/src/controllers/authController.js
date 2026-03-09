//const UserModel = require('../models/userModel');
//const bcrypt = require('bcrypt');

const registerUser = async (req, res) => {
    try {
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({
                data: {},
                error: "Email and password are required"
            });
        }

        //TODO Checking if user already exists in DB
        //TODO Hashing the password
        //TODO saving user to DB

        return res.status(201).json({
            data: {
                message: "User registered successfully",
                user: {email: email}
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
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({ data: {}, error: "Email and password are required" });
        }

        //TODO finding the user in DB, checking the password and setting session data.

        req.session.userId = "id_uporabnika_iz_baze";
        req.session.role = "user";

        return res.status(200).json({
            data: {message: "Login successful", user: {email}},
            error: ""
        })
    } catch (error) {
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

module.exports = {
    registerUser,
    loginUser,
    logoutUser
};

