const UserVerification = require('../models/UserVerification');
const VerificationDocument = require('../models/VerificationDocument');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

exports.createVerificationRequest = async (req, res) => {
    try{
        const { verificationType, documentNumber, countryCode} = req.body;

        if (!verificationType || !documentNumber || !countryCode) {
            return res.status(400).json({ data: {}, error: "Missing required verification fields" });
        }

        const existingRequest = await UserVerification.findOne({
            userId: req.user._id,
            status: { $in: ['PENDING', 'DRAFT'] }
        });
        if (existingRequest) {
            return res.status(400).json({ data: {}, error: "You already have an active or draft verification request" });
        }

        const aprovedRequest = await UserVerification.findOne({ userId: req.user._id, status: 'APPROVED' });
        if (aprovedRequest) {
            return res.status(400).json({ data: {}, error: "You are already approved" });
        }

        const newRequest = new UserVerification({
            userId: req.user._id,
            verificationType,
            documentNumber,
            countryCode
        });

        await newRequest.save();

        return res.status(201).json({
            data: { message: "Verification request created", verificationId: newRequest._id },
            error: ""
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: error.message });
    }
};

exports.uploadDocument = async (req, res) => {
    try {
        const { verificationId, documentSide } = req.body;

        if (!req.file) {
            return res.status(400).json({ data: {}, error: "No file uploaded" });
        }

        const verificationRequest = await UserVerification.findOne({
            _id: verificationId,
            userId: req.user._id
        });

        if (!verificationRequest) {
            return res.status(403).json({ data: {}, error: "Unauthorized or invalid verification ID" });
        }

        if (verificationRequest.status !== 'DRAFT') {
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                data: {},
                error: `Cannot upload documents. This request is already ${verificationRequest.status}.`
            });
        }

        const existingDoc = await VerificationDocument.findOne({ verificationId, documentSide });
        if (existingDoc) {
            if (fs.existsSync(existingDoc.fileStorageId)) {
                fs.unlinkSync(existingDoc.fileStorageId);
            }
            await VerificationDocument.findByIdAndDelete(existingDoc._id);
        }

        const structuredName = `${documentSide.toUpperCase()}-${req.file.filename}`;
        const newDoc = new VerificationDocument({
            verificationId,
            documentSide,
            fileName: structuredName,
            fileType: req.file.mimetype,
            fileUrl: `/api/verification/view/${structuredName}`,
            fileStorageId: req.file.path
        });

        await newDoc.save();

        return res.status(201).json({
            data: { message: "Document uploaded successfully", documentId: newDoc._id },
            error: ""
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: error.message });
    }
};

exports.getMyVerification = async (req, res) => {
    try {
        const verification = await UserVerification.findOne({ userId: req.user._id })
            .sort({ requestedAt: -1 })
            .lean();

        if (!verification) {
            return res.status(404).json({ data: {}, error: "No verification request found" });
        }

        const docs = await VerificationDocument.find({ verificationId: verification._id }).lean();

        const cleanedVerification = {
            id: verification._id,
            type: verification.verificationType,
            documentNumber: verification.documentNumber
                ? `****${verification.documentNumber.slice(-4)}`
                : "N/A",
            country: verification.countryCode,
            status: verification.status,
            requestedAt: verification.requestedAt,
            documents: docs.map(d => ({
                id: d._id,
                side: d.documentSide,
                type: d.fileType,
                filename: d.fileName
            }))
        };

        return res.status(200).json({ data: cleanedVerification, error: "" });
    } catch (error) {
        return res.status(500).json({ data: {}, error: error.message });
    }
};

exports.getVerificationById = async (req, res) => {
    try {
        const { id } = req.params;

        const verification = await UserVerification.findById(id).populate('userId', 'firstName lastName email');

        if (!verification) {
            return res.status(404).json({ data: {}, error: "Verification request not found" });
        }

        const documents = await VerificationDocument.find({ verificationId: id });

        return res.status(200).json({
            data: {
                verification,
                documents
            },
            error: ""
        });
    } catch (error) {
        return res.status(500).json({ data: {}, error: error.message });
    }
};

exports.viewDocument = async (req, res) => {
    try {
        const { filename } = req.params;
        const doc = await VerificationDocument.findOne({ fileName: filename }).populate('verificationId');

        if (!doc) return res.status(404).json({ data: {}, error: "File not found" });

        const isOwner = doc.verificationId.userId.toString() === req.user._id.toString();
        if (!isOwner && !req.user.admin) {
            return res.status(403).json({ data: {}, error: "Unauthorized access to this document" });
        }

        res.sendFile(path.resolve(doc.fileStorageId));
    } catch (error) {
        res.status(500).json({ data: {}, error: error.message });
    }
};

exports.adminListVerifications = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};

        const list = await UserVerification.find(filter).populate('userId', 'username email');
        return res.status(200).json({ data: list, error: "" });
    } catch (error) {
        res.status(500).json({ data: {}, error: error.message });
    }
};

exports.reviewVerification = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, expiresAt, reviewNote } = req.body;

        const verification = await UserVerification.findById(id);
        if (!verification) return res.status(404).json({ data: {}, error: "Not found" });

        verification.status = status;
        verification.expiresAt = expiresAt;
        verification.reviewNote = reviewNote;
        verification.reviewedAt = new Date();
        verification.reviewedBy = req.user._id;

        await verification.save();

        if (status === 'APPROVED') {
            await User.findByIdAndUpdate(verification.userId, { isVerified: true, verificationLevel: 'IDENTITY' });
        }

        return res.status(200).json({ data: { message: "Review completed" }, error: "" });
    } catch (error) { res.status(500).json({ data: {}, error: error.message }); }
};

exports.deleteDocument = async (req, res) => {
    try {
        const { documentId } = req.params;

        const doc = await VerificationDocument.findById(documentId).populate('verificationId');

        if (!doc) return res.status(404).json({ data: {}, error: "Document not found" });

        if (doc.verificationId.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ data: {}, error: "Unauthorized" });
        }

        if (doc.verificationId.status !== 'PENDING') {
            return res.status(400).json({ data: {}, error: "Cannot delete after review" });
        }

        if (fs.existsSync(doc.fileStorageId)) {
            fs.unlinkSync(doc.fileStorageId);
        }

        await VerificationDocument.findByIdAndDelete(documentId);

        res.status(200).json({ data: { message: "Document deleted successfully" }, error: "" });
    } catch (error) {
        res.status(500).json({ data: {}, error: error.message });
    }
};

exports.cancelVerification = async (req, res) => {
    try {
        const { id } = req.params;

        const verification = await UserVerification.findById(id);

        if (!verification) {
            return res.status(404).json({ data: {}, error: "Verification request not found" });
        }

        if (verification.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ data: {}, error: "Unauthorized: You cannot cancel this request" });
        }

        if (verification.status === 'APPROVED') {
            return res.status(400).json({ data: {}, error: "Cannot cancel an already approved verification" });
        }

        const docs = await VerificationDocument.find({ verificationId: id });

        for (const doc of docs) {
            if (fs.existsSync(doc.fileStorageId)) {
                fs.unlinkSync(doc.fileStorageId);
            }
            await VerificationDocument.findByIdAndDelete(doc._id);
        }

        await UserVerification.findByIdAndDelete(id);

        return res.status(200).json({
            data: { message: "Verification request and all associated files have been permanently deleted" },
            error: ""
        });

    } catch (error) {
        return res.status(500).json({ data: {}, error: error.message });
    }
};

exports.updateVerificationRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const verification = await UserVerification.findById(id);

        if (!verification || verification.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ data: {}, error: "Unauthorized" });
        }

        if (verification.status !== 'DRAFT') {
            return res.status(400).json({ data: {}, error: "Cannot edit a request after it has been submitted" });
        }

        const { verificationType, documentNumber, countryCode } = req.body;
        if (verificationType) verification.verificationType = verificationType;
        if (documentNumber) verification.documentNumber = documentNumber;
        if (countryCode) verification.countryCode = countryCode;

        await verification.save();
        return res.status(200).json({ data: { message: "Draft updated" }, error: "" });
    } catch (error) { res.status(500).json({ data: {}, error: error.message }); }
};

exports.submitVerification = async (req, res) => {
    try {
        const { id } = req.params;
        const verification = await UserVerification.findById(id);

        if (!verification || verification.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ data: {}, error: "Unauthorized" });
        }

        if (verification.status !== 'DRAFT') {
            return res.status(400).json({ data: {}, error: "This request has already been submitted." });
        }

        const docs = await VerificationDocument.find({ verificationId: id });
        const uploadedSides = docs.map(d => d.documentSide.toUpperCase());

        const requiredSides = ['FRONT', 'BACK', 'SELFIE'];
        const missingSides = requiredSides.filter(side => !uploadedSides.includes(side));

        if (missingSides.length > 0) {
            return res.status(400).json({
                data: { missing: missingSides },
                error: `Incomplete submission. Missing: ${missingSides.join(', ')}.`
            });
        }

        verification.status = 'PENDING';
        await verification.save();

        return res.status(200).json({
            data: { message: "Verification submitted successfully. An admin will review it shortly." },
            error: ""
        });

    } catch (error) {
        return res.status(500).json({ data: {}, error: error.message });
    }
};

exports.getVerificationStats = async (req, res) => {
    try {
        const stats = await UserVerification.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const total = stats.reduce((acc, curr) => acc + curr.count, 0);

        return res.status(200).json({
            data: { total, breakdown: stats },
            error: ""
        });
    } catch (error) { res.status(500).json({ data: {}, error: error.message }); }
};

exports.resubmitVerification = async (req, res) => {
    try {
        const { id } = req.params;
        const verification = await UserVerification.findById(id);

        if (verification.status !== 'REJECTED') {
            return res.status(400).json({ data: {}, error: "Only rejected requests can be resubmitted" });
        }

        verification.status = 'DRAFT';
        await verification.save();

        return res.status(200).json({ data: { message: "Status reset to DRAFT. Please correct your info and submit again." }, error: "" });
    } catch (error) { res.status(500).json({ data: {}, error: error.message }); }
};