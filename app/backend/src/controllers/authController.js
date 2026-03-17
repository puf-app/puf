const User = require('../models/User');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const ENABLE_EMAIL_2FA = String(process.env.ENABLE_EMAIL_2FA || 'false').toLowerCase() === 'true';
const TWO_FA_CODE_TTL_MINUTES = Number(process.env.TWO_FA_CODE_TTL_MINUTES || 10);
const TWO_FA_RECHECK_HOURS = Number(process.env.TWO_FA_RECHECK_HOURS || 168);
const TWO_FA_MAX_ATTEMPTS = Number(process.env.TWO_FA_MAX_ATTEMPTS || 5);

const isSmtpConfigured = () => {
    return Boolean(
        process.env.SMTP_HOST &&
        process.env.SMTP_PORT &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASS
    );
};

const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

const shouldRequire2FA = (user) => {
    if (!user.lastLoginAt) return true;

    const lastLoginTime = new Date(user.lastLoginAt).getTime();
    const maxAgeMs = TWO_FA_RECHECK_HOURS * 60 * 60 * 1000;

    return (Date.now() - lastLoginTime) > maxAgeMs;
};

const generate2FACode = () => {
    return crypto.randomInt(100000, 1000000).toString();
};

const send2FACodeEmail = async (email, username, code) => {
    const transporter = createTransporter();

    await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'PUF - 2FA prijavna koda',
        text: `Pozdravljen/a ${username},\n\nTvoja 2FA koda je: ${code}\nKoda velja ${TWO_FA_CODE_TTL_MINUTES} minut.\n\nCe kode nisi zahteval/a, ignoriraj to sporocilo.`
    });
};

const clearPending2FA = (req) => {
    if (req.session) {
        req.session.pending2FA = null;
    }
};

const registerUser = async (req, res) => {
    try {
        const {firstName, lastName, username, email, password, phone} = req.body;

        if (!firstName || !lastName || !username || !email || !password) {
            return res.status(400).json({data: {}, error: "Username, email and password are required"});
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

        if (ENABLE_EMAIL_2FA && shouldRequire2FA(user)) {
            if (!isSmtpConfigured()) {
                return res.status(500).json({
                    data: {},
                    error: "2FA email settings are missing on the server"
                });
            }

            const code = generate2FACode();
            const codeHash = await bcrypt.hash(code, 10);
            const expiresAt = Date.now() + TWO_FA_CODE_TTL_MINUTES * 60 * 1000;

            try {
                await send2FACodeEmail(user.email, user.username, code);
            } catch (mailError) {
                return res.status(500).json({
                    data: {},
                    error: "Failed to send 2FA code email"
                });
            }

            req.session.pending2FA = {
                userId: String(user._id),
                codeHash,
                expiresAt,
                attempts: 0
            };

            return res.status(200).json({
                data: {
                    message: "2FA code sent to your email",
                    requires2FA: true
                },
                error: ""
            });
        }

        user.lastLoginAt = new Date();
        await user.save();

        clearPending2FA(req);
        req.session.userId = user._id;
        req.session.role = user.admin ? 'admin' : 'user';

        return res.status(200).json({
            data: {
                message: "Login successful",
                requires2FA: false,
                user: {username: user.username, admin: user.admin}
            },
            error: ""
        })
    } catch (error) {
        return res.status(500).json({
            data: {},
            error: "Server error while logging in"
        });
    }
};

const verifyLogin2FA = async (req, res) => {
    try {
        if (!ENABLE_EMAIL_2FA) {
            return res.status(400).json({
                data: {},
                error: "2FA is currently disabled"
            });
        }

        const {code} = req.body;

        if (!code) {
            return res.status(400).json({
                data: {},
                error: "2FA code is required"
            });
        }

        if (!req.session || !req.session.pending2FA || !req.session.pending2FA.userId) {
            return res.status(401).json({
                data: {},
                error: "No pending 2FA authentication"
            });
        }

        const pending2FA = req.session.pending2FA;
        const user = await User.findById(pending2FA.userId);

        if (!user) {
            clearPending2FA(req);
            return res.status(401).json({
                data: {},
                error: "Invalid 2FA session"
            });
        }

        if (!pending2FA.codeHash || !pending2FA.expiresAt) {
            clearPending2FA(req);
            return res.status(401).json({
                data: {},
                error: "2FA code was not requested"
            });
        }

        if (Date.now() > Number(pending2FA.expiresAt)) {
            clearPending2FA(req);
            return res.status(401).json({
                data: {},
                error: "2FA code expired"
            });
        }

        if (Number(pending2FA.attempts) >= TWO_FA_MAX_ATTEMPTS) {
            clearPending2FA(req);
            return res.status(401).json({
                data: {},
                error: "Too many invalid 2FA attempts"
            });
        }

        const validCode = await bcrypt.compare(String(code), pending2FA.codeHash);

        if (!validCode) {
            pending2FA.attempts = Number(pending2FA.attempts || 0) + 1;
            req.session.pending2FA = pending2FA;

            return res.status(401).json({
                data: {},
                error: "Invalid 2FA code"
            });
        }

        user.lastLoginAt = new Date();
        await user.save();

        clearPending2FA(req);
        req.session.userId = user._id;
        req.session.role = user.admin ? 'admin' : 'user';

        return res.status(200).json({
            data: {
                message: "Login successful",
                requires2FA: false,
                user: {username: user.username, admin: user.admin}
            },
            error: ""
        });
    } catch (error) {
        return res.status(500).json({
            data: {},
            error: "Server error while verifying 2FA"
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
    verifyLogin2FA,
    logoutUser,
    changePassword
};

