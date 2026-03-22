const https = require('https');
const readline = require('readline');

class InflationCalculator {
    constructor() {
        this.cpiData = {
            europe: {
                '2020-01': 105.2,
                '2021-01': 107.5,
                '2022-01': 112.3,
                '2023-01': 120.1,
                '2024-01': 125.7
            },
            slovenia: {
                '2020-01': 104.8,
                '2021-01': 106.9,
                '2022-01': 111.7,
                '2023-01': 119.2,
                '2024-01': 124.5
            }
        };
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    }

    async getCPI(region, date) {
        const key = this.formatDate(date);
        const local = this.cpiData[region] && this.cpiData[region][key];
        const remote = await this.fetchCPIFromInternet(region, key);
        return remote ?? local ?? null;
    }

    async fetchCPIFromInternet(region, yearMonth) {
        const url = this.getCpiApiUrl(region, yearMonth);
        if (!url) return null;

        const json = await this.fetchJson(url);
        if (!json) return null;

        if (typeof json.value === 'number') return json.value;
        if (typeof json.cpi === 'number') return json.cpi;
        if (json.data && typeof json.data === 'object') {
            const val = json.data.value ?? json.data.cpi;
            return typeof val === 'number' ? val : null;
        }
        return null;
    }

    getCpiApiUrl(region, yearMonth) {
        const [year, month] = yearMonth.split('-');
        if (region === 'europe') {
            return `https://api.example.com/inflation/europe/${year}-${month}`;
        }
        if (region === 'slovenia') {
            return `https://api.example.com/inflation/slovenia/${year}-${month}`;
        }
        return null;
    }

    fetchJson(url) {
        return new Promise((resolve) => {
            https.get(url, (res) => {
                let raw = '';
                res.on('data', (chunk) => { raw += chunk; });
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(raw));
                    } catch {
                        resolve(null);
                    }
                });
            }).on('error', () => resolve(null));
        });
    }

    async calculateInflation(region, dateFrom, dateTo) {
        const cpiFrom = await this.getCPI(region, dateFrom);
        const cpiTo = await this.getCPI(region, dateTo);
        if (cpiFrom === null || cpiTo === null) return null;
        return ((cpiTo - cpiFrom) / cpiFrom) * 100;
    }

    calculateRealInterestRate(nominalRatePct, inflationPct) {
        return ((1 + nominalRatePct / 100) / (1 + inflationPct / 100) - 1) * 100;
    }

    adjustNominalRateByAge(nominalRatePct, age) {
        if (typeof age !== 'number' || age <= 0) return nominalRatePct;
        if (age < 25) return nominalRatePct + 2.0;
        if (age < 35) return nominalRatePct + 1.5;
        if (age < 50) return nominalRatePct + 1.0;
        if (age < 65) return nominalRatePct + 1.5;
        return nominalRatePct + 2.0;
    }

    async printInflation(fromStr, toStr, nominalInterestRatePct = null, age = null) {
        const dateFrom = new Date(fromStr + '-01');
        const dateTo = new Date(toStr + '-01');
        const inflationEurope = await this.calculateInflation('europe', dateFrom, dateTo);
        const inflationSlovenia = await this.calculateInflation('slovenia', dateFrom, dateTo);
        if (inflationEurope === null || inflationSlovenia === null) {
            console.log('CPI data not available for the selected dates.');
            return;
        }
        console.log(`Inflation in Europe from ${fromStr} to ${toStr}: ${inflationEurope.toFixed(2)}%`);
        console.log(`Inflation in Slovenia from ${fromStr} to ${toStr}: ${inflationSlovenia.toFixed(2)}%`);
        if (typeof nominalInterestRatePct === 'number') {
            const adjustedNominal = this.adjustNominalRateByAge(nominalInterestRatePct, age);
            const realEurope = this.calculateRealInterestRate(adjustedNominal, inflationEurope);
            const realSlovenia = this.calculateRealInterestRate(adjustedNominal, inflationSlovenia);
            console.log(`Real interest rate (Europe): ${realEurope.toFixed(2)}% (nominal: ${adjustedNominal.toFixed(2)}%)`);
            console.log(`Real interest rate (Slovenia): ${realSlovenia.toFixed(2)}% (nominal: ${adjustedNominal.toFixed(2)}%)`);
        }
    }
}

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

    const mode = (await prompt('Select mode (inflation/loan): ', rl)).toLowerCase();

    if (mode === 'inflation') {
        const fromStr = await prompt('from (YYYY-MM): ', rl);
        const toStr = await prompt('to (YYYY-MM): ', rl);
        const nominalInterestRatePct = Number(await prompt('nominal interest rate (%): ', rl));

        await new InflationCalculator().printInflation(fromStr, toStr, nominalInterestRatePct);
        rl.close();
        return;
    }

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
    InflationCalculator,
    calculateMonthlyInstallment,
    calculateMaxLoanAmount,
    checkQualification,
    simulateInflationAdjustedPayments,
};
