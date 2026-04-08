const {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse
} = require('@simplewebauthn/server');
const User = require('../models/User');

const rpName = process.env.RP_NAME || 'PufApp';
const rpID = process.env.RP_ID || 'localhost';
const origin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

exports.getRegistrationOptions = async (req, res) => {
    try {
        const user = req.user;
        const options = await generateRegistrationOptions({
            rpName,
            rpID,
            userID: Buffer.from(user._id.toString()),
            userName: user.username,
            attestationType: 'none',
            authenticatorSelection: {
                residentKey: 'preferred',
                userVerification: 'preferred',
                authenticatorAttachment: 'platform',
            },
        });

        await User.findByIdAndUpdate(user._id, {currentChallenge: options.challenge});

        return res.status(200).json({data: options, error: ""});
    } catch (error) {
        return res.status(500).json({data: {}, error: error.message});
    }
};

exports.verifyRegistration = async (req, res) => {
    try {
        const user = req.user;
        const verification = await verifyRegistrationResponse({
            response: req.body,
            expectedChallenge: user.currentChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
        });

        if (verification.verified && verification.registrationInfo) {
            const {credential} = verification.registrationInfo;

            const newAuth = {
                credentialID: credential.id,
                publicKey: Buffer.from(credential.publicKey).toString('base64url'),
                counter: credential.counter,
                transports: req.body.response.transports || [],
            };

            await User.findByIdAndUpdate(user._id, {
                $push: {authenticators: newAuth},
                $set: {currentChallenge: null}
            });

            return res.status(200).json({data: {message: "Biometrics registered successfully!"}, error: ""});
        }
        return res.status(400).json({data: {}, error: "Verification failed"});
    } catch (error) {
        return res.status(500).json({data: {}, error: error.message});
    }
};

exports.getLoginOptions = async (req, res) => {
    try {
        const {username} = req.query;
        const user = await User.findOne({username}).lean();

        if (!user || !user.authenticators?.length) {
            return res.status(400).json({data: {}, error: "No biometric devices found"});
        }

        const options = await generateAuthenticationOptions({
            rpID,
            allowCredentials: user.authenticators.map(auth => ({
                id: auth.credentialID,
                type: 'public-key',
                transports: auth.transports,
            })),
            userVerification: 'preferred',
        });

        await User.findByIdAndUpdate(user._id, {currentChallenge: options.challenge});

        return res.status(200).json({data: options, error: ""});
    } catch (error) {
        return res.status(500).json({data: {}, error: error.message});
    }
};

exports.verifyLogin = async (req, res) => {
    try {
        const {username, body} = req.body;
        const user = await User.findOne({username}).lean();

        if (!user || !user.currentChallenge) return res.status(400).json({data: {}, error: "Session expired"});

        const dbAuth = user.authenticators.find(a => a.credentialID === body.id);
        if (!dbAuth) return res.status(400).json({data: {}, error: "Device not recognized"});

        const authenticatorData = {
            credentialID: Buffer.from(dbAuth.credentialID, 'base64url'),
            credentialPublicKey: Buffer.from(dbAuth.publicKey, 'base64url'),
            publicKey: Buffer.from(dbAuth.publicKey, 'base64url'),
            counter: Number(dbAuth.counter) || 0,
            transports: dbAuth.transports
        };

        const verification = await verifyAuthenticationResponse({
            response: body,
            expectedChallenge: user.currentChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            credential: authenticatorData,
        });

        if (verification.verified) {
            await User.findOneAndUpdate(
                {_id: user._id, "authenticators.credentialID": dbAuth.credentialID},
                {
                    $set: {"authenticators.$.counter": verification.authenticationInfo.newCounter},
                    currentChallenge: null,
                    lastLoginAt: new Date()
                }
            );

            req.session.userId = user._id;
            req.session.role = user.admin ? 'admin' : 'user';

            return res.status(200).json({data: {message: "Login successful!"}, error: ""});
        }
        return res.status(401).json({data: {}, error: "Auth failed"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({data: {}, error: error.message});
    }
};

exports.listAuthenticators = async (req, res) => {
    try {
        const devices = req.user.authenticators.map(auth => ({
            id: auth.credentialID,
            transports: auth.transports
        }));
        return res.status(200).json({data: devices, error: ""});
    } catch (e) {
        return res.status(500).json({data: {}, error: e.message});
    }
};

exports.removeAuthenticator = async (req, res) => {
    try {
        const {credentialId} = req.params;
        const initialCount = req.user.authenticators.length;

        req.user.authenticators = req.user.authenticators.filter(auth =>
            auth.credentialID !== credentialId
        );

        if (req.user.authenticators.length === initialCount) {
            return res.status(404).json({data: {}, error: "Device not found"});
        }

        await req.user.save();
        return res.status(200).json({data: {message: "Device removed successfully"}, error: ""});
    } catch (e) {
        return res.status(500).json({data: {}, error: e.message});
    }
};