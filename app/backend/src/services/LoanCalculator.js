const readline = require('readline');

function calculateMonthlyInstallment(principal, annualInterestRatePct, years) {
    const monthlyRate = annualInterestRatePct / 100 / 12;
    const months = years * 12;
    if (monthlyRate === 0) return principal / months;
    return principal * (monthlyRate / (1 - Math.pow(1 + monthlyRate, -months)));
}

function calculateMaxLoanAmount({
    monthlyNetIncome,
    existingMonthlyDebt,
    interestRatePct,
    years,
    minRemaining = 750,
    maxPaymentRatio = 0.4,
}) {
    const maxIncomePayment = monthlyNetIncome * maxPaymentRatio;
    const maxRemainingPayment = monthlyNetIncome - existingMonthlyDebt - minRemaining;
    const maxPayment = Math.max(0, Math.min(maxIncomePayment, maxRemainingPayment));

    if (maxPayment <= 0) return 0;

    const monthlyRate = interestRatePct / 100 / 12;
    const months = years * 12;
    if (monthlyRate === 0) return maxPayment * months;

    const principal = maxPayment * (1 - Math.pow(1 + monthlyRate, -months)) / monthlyRate;
    return Math.max(0, principal);
}

function getEmploymentPolicy(employmentType) {
    const type = (employmentType || '').toLowerCase();
    switch (type) {
        case 'permanent':
            return { minCreditScore: 500, maxLtv: 0.8 };
        case 'temporary':
            return { minCreditScore: 600, maxLtv: 0.75 };
        case 'self-employed':
        case 'sp':
        case 's.p.':
            return { minCreditScore: 650, maxLtv: 0.7 };
        case 'student':
            return { minCreditScore: 700, maxLtv: 0.6 };
        default:
            return { minCreditScore: 650, maxLtv: 0.7 };
    }
}

function requiresCollateral(requestedLoan) {
    return requestedLoan >= 120000;
}

function checkQualification({
    monthlyNetIncome,
    existingMonthlyDebt,
    age,
    years,
    interestRatePct,
    propertyValue,
    downPayment,
    employmentType,
    creditScore,
    collateralType,
}) {
    const requestedLoan = Math.max(0, propertyValue - downPayment);
    const employmentPolicy = getEmploymentPolicy(employmentType);

    const maxBorrowByProperty = propertyValue * employmentPolicy.maxLtv;
    const maxLoanByIncome = calculateMaxLoanAmount({
        monthlyNetIncome,
        existingMonthlyDebt,
        interestRatePct,
        years,
    });

    const monthlyInstallment = calculateMonthlyInstallment(requestedLoan, interestRatePct, years);

    const downPaymentOk = downPayment >= propertyValue * (1 - employmentPolicy.maxLtv);
    const ageOk = age >= 18 && age + years <= 70;
    const creditOk = typeof creditScore === 'number' && creditScore >= employmentPolicy.minCreditScore;

    const collateralNeeded = requiresCollateral(requestedLoan);
    const collateralOk = !collateralNeeded || (typeof collateralType === 'string' && collateralType.trim() !== 'none' && collateralType.trim() !== '');

    const approved =
        requestedLoan > 0 &&
        requestedLoan <= maxBorrowByProperty &&
        requestedLoan <= maxLoanByIncome &&
        monthlyInstallment <= Math.min(monthlyNetIncome * 0.4, monthlyNetIncome - existingMonthlyDebt - 750) &&
        ageOk &&
        downPaymentOk &&
        creditOk &&
        collateralOk;

    return {
        approved,
        requestedLoan,
        maxBorrowByProperty,
        maxLoanByIncome,
        monthlyInstallment,
        totalInterestPaid: monthlyInstallment * years * 12 - requestedLoan,
        downPaymentOk,
        ageOk,
        creditOk,
        collateralNeeded,
        collateralOk,
        employmentType,
        creditScore,
        collateralType,
    };
}

function simulateInflationAdjustedPayments(monthlyPayment, years, annualInflationPct) {
    const months = years * 12;
    const monthlyInflation = annualInflationPct / 100 / 12;
    let realTotal = 0;

    for (let month = 1; month <= months; month += 1) {
        const inflationFactor = Math.pow(1 + monthlyInflation, month);
        realTotal += monthlyPayment / inflationFactor;
    }

    return {
        nominalTotal: monthlyPayment * months,
        realTotal,
        averageRealPayment: realTotal / months,
    };
}

async function prompt(question, rl) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => resolve(answer.trim()));
    });
}

async function runCli() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const monthlyNetIncome = Number(await prompt('monthlyNetIncome (€): ', rl));
    const existingMonthlyDebt = Number(await prompt('existingMonthlyDebt (€): ', rl));
    const age = Number(await prompt('age: ', rl));
    const employmentType = (await prompt('employmentType (permanent/temporary/self-employed/student): ', rl)).toLowerCase();
    const creditScore = Number(await prompt('creditScore (1-1000): ', rl));
    const loanYears = Number(await prompt('loanYears: ', rl));
    const interestRate = Number(await prompt('interestRate (% annual): ', rl));
    const propertyValue = Number(await prompt('propertyValue (€): ', rl));
    const downPayment = Number(await prompt('downPayment (€): ', rl));
    const collateralType = (await prompt('collateral (none/hipoteka/porok/zavarovanje): ', rl)).toLowerCase();
    const inflationRate = Number(await prompt('expected annual inflation rate (%): ', rl));

    rl.close();

    const result = checkQualification({
        monthlyNetIncome,
        existingMonthlyDebt,
        age,
        years: loanYears,
        interestRatePct: interestRate,
        propertyValue,
        downPayment,
        employmentType,
        creditScore,
        collateralType,
    });

    const inflationSimulation = simulateInflationAdjustedPayments(
        result.monthlyInstallment,
        loanYears,
        inflationRate,
    );

    console.log('--- Loan simulation results ---');
    console.log(`approved: ${result.approved}`);
    console.log(`requested loan amount: €${result.requestedLoan.toFixed(2)}`);
    console.log(`maximum loan (income-based): €${result.maxLoanByIncome.toFixed(2)}`);
    console.log(`maximum loan (max LTV): €${result.maxBorrowByProperty.toFixed(2)}`);
    console.log(`monthly installment: €${result.monthlyInstallment.toFixed(2)}`);
    console.log(`total interest paid: €${result.totalInterestPaid.toFixed(2)}`);
    console.log(`inflation-adjusted total paid: €${inflationSimulation.realTotal.toFixed(2)}`);
    console.log(`average inflation-adjusted monthly: €${inflationSimulation.averageRealPayment.toFixed(2)}`);
    console.log('--- decision details ---');
    console.log(`age ok: ${result.ageOk} (age: ${age}, end age: ${age + loanYears})`);
    console.log(`down payment ok: ${result.downPaymentOk} (required min: €${(propertyValue * (1 - getEmploymentPolicy(employmentType).maxLtv)).toFixed(2)})`);
    console.log(`credit score ok: ${result.creditOk} (score: ${creditScore}, required: ${getEmploymentPolicy(employmentType).minCreditScore})`);
    console.log(`collateral required: ${result.collateralNeeded}, provided: ${result.collateralOk} (${result.collateralType || 'none'})`);
}

if (require.main === module) {
    runCli();
}

module.exports = {
    calculateMonthlyInstallment,
    calculateMaxLoanAmount,
    checkQualification,
    simulateInflationAdjustedPayments,
};
