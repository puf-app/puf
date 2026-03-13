const https = require('https');

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

module.exports = InflationCalculator;
