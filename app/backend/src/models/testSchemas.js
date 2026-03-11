const mongoose = require('mongoose');

const User = require('./User');
const Debt = require('./Debt');
const FriendRequest = require('./FriendRequest');
const Friendship = require('./Friendship');
const DebtStatusHistory = require('./DebtStatusHistory');
const DebtEvidence = require('./DebtEvidence');
const UserVerification = require('./UserVerification');
const VerificationDocument = require('./VerificationDocument');

console.log('=========================================');
console.log('MONGOOSE SCHEMA DIAGNOSTICS');
console.log('=========================================\n');

const fakeId = () => new mongoose.Types.ObjectId();

const testData = {
    User: new User({
        username: 'johndoe',
        email: 'john@example.com',
        password: 'hashed_password_here'
    }),
    Debt: new Debt({
        creditorUserId: fakeId(),
        debtorUserId: fakeId()
    }),
    FriendRequest: new FriendRequest({
        senderUserId: fakeId(),
        receiverUserId: fakeId()
    }),
    Friendship: new Friendship({
        user1Id: fakeId(),
        user2Id: fakeId()
    }),
    DebtStatusHistory: new DebtStatusHistory({
        debtId: fakeId(),
        changedByUserId: fakeId()
    }),
    DebtEvidence: new DebtEvidence({
        debtId: fakeId(),
        uploadedByUserId: fakeId()
    }),
    UserVerification: new UserVerification({
        userId: fakeId()
    }),
    VerificationDocument: new VerificationDocument({
        verificationId: fakeId()
    })
};

const models = { User, Debt, FriendRequest, Friendship, DebtStatusHistory, DebtEvidence, UserVerification, VerificationDocument };

console.log('--- 1. VALIDATION TESTS ---');
for (const [modelName, document] of Object.entries(testData)) {
    const error = document.validateSync();
    if (error) {
        console.error(`[FAIL] ${modelName} Model: Failed validation.`);
        for (const field in error.errors) {
            console.error(`       - ${field}: ${error.errors[field].message}`);
        }
    } else {
        console.log(`[PASS] ${modelName} Model: Passed validation.`);
    }
}

console.log('\n--- 2. SCHEMA STRUCTURE OVERVIEW ---');
for (const [name, model] of Object.entries(models)) {
    console.log(`\nModel: ${name}`);
    const paths = model.schema.paths;

    for (const pathName in paths) {
        const field = paths[pathName];

        if (pathName === '__v') continue;

        const type = field.instance;
        let rules = [];

        if (field.options.required) rules.push('required');
        if (field.options.unique) rules.push('unique');
        if (field.options.maxLength) rules.push(`maxLength: ${field.options.maxLength}`);
        if (field.options.default !== undefined) rules.push(`default: ${field.options.default}`);
        if (field.options.ref) rules.push(`ref: '${field.options.ref}'`);

        const rulesStr = rules.length > 0 ? ` (${rules.join(', ')})` : '';
        console.log(`  - ${pathName}: ${type}${rulesStr}`);
    }
}

console.log('\n--- 3. CONNECTION (FOREIGN KEY) DIAGNOSTICS ---');
for (const [name, model] of Object.entries(models)) {
    let hasConnections = false;
    const paths = model.schema.paths;

    for (const pathName in paths) {
        const field = paths[pathName];

        if (field.options && field.options.ref) {
            if (!hasConnections) {
                console.log(`\n[${name}] connects to:`);
                hasConnections = true;
            }
            console.log(`   -> ${pathName} references the '${field.options.ref}' model`);
        }
    }

    if (!hasConnections && name !== 'User') {
        console.log(`\n[NOTE] ${name} has no connections defined.`);
    }
}

console.log('\n=========================================');
console.log('DIAGNOSTICS COMPLETE');
console.log('=========================================');