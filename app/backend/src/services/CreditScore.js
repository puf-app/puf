const WEIGHTS = {
    REPAYMENT: {
        BASE: 0.35,
        ON_TIME_PAYMENT_RATIO: 0.45,
        RECENCY_WEIGHT: 0.25,
        SEVERITY_INDEX: 0.20,
        HISTORY_LENGTH_LOG_FACTOR: 0.10
    },
    FINANCIAL: {
        BASE: 0.25,
        DEBT_TO_INCOME_INVERSE: 0.50,
        UTILIZATION_RATE_INVERSE: 0.30,
        INCOME_STABILITY_INDEX: 0.20
    },
    SOCIAL_TRUST: {
        BASE: 0.25,
        VOUCHER_SCORE_WEIGHTED_AVG: 0.60,
        NETWORK_DENSITY_FACTOR: 0.20,
        RELATIONSHIP_DURATION_EXP_DECAY: 0.20
    },
    PROFILE: {
        BASE: 0.15,
        TIER_LEVEL: 0.60,
        DATA_CONSISTENCY_SCORE: 0.20,
        ACCOUNT_AGE_DAYS_LOG: 0.20
    }
};


const evaluateRiskWithAI = async (scoreData, repaymentData, financialData) => {
    try {
        const prompt = `You are an AI credit risk analyst. Evaluate this profile and return exclusively a JSON object.
Required format:
{"aiAdjustmentPoints": <int between -20 and 20>, "aiRecommendedAction": "<APPROVE or DENY or MANUAL_REVIEW>", "aiInsights": ["<string reason>"]}

Profile Data:
Algorithmic Score: ${scoreData.score}
Repayment Profile: ${JSON.stringify(repaymentData)}
Financial Profile: ${JSON.stringify(financialData)}`;

        // Klic AI
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama3', 
                prompt: prompt,
                stream: false,
                format: 'json' 
            })
        });

        if (!response.ok) {
            throw new Error(`napaka ai ${response.status}`);
        }

        const data = await response.json();
        const aiResult = JSON.parse(data.response);

        const adjustment = Math.max(-20, Math.min(20, (aiResult.aiAdjustmentPoints || 0)));

        return {
            algorithmicScore: scoreData.score,
            aiAdjustmentPoints: adjustment,
            aiFinalScore: scoreData.score + adjustment,
            aiRecommendedAction: aiResult.aiRecommendedAction || (scoreData.score >= 60 ? 'APPROVE' : 'DENY'),
            aiInsights: aiResult.aiInsights || ['Local Llama profile scan completed.']
        }; 
    } catch (error) {
        return {
            algorithmicScore: scoreData.score,
            aiAdjustmentPoints: 0,
            aiFinalScore: scoreData.score,
            aiRecommendedAction: scoreData.score >= 60 ? 'APPROVE' : 'DENY',
            aiInsights: ['only math']
        };
    }
};

const calculateCreditScore = async (userId, repaymentData, financialData, socialData, profileData) => {
    try {
        const accountAgeDays = profileData?.accountAgeDays || 0;
        const totalLoans = repaymentData?.totalLoans || 0;
        
        let activeWeights = JSON.parse(JSON.stringify(WEIGHTS));
        
        if (totalLoans < 3 && accountAgeDays < 90) {
            activeWeights.REPAYMENT.BASE = 0.15;
            activeWeights.FINANCIAL.BASE = 0.25;
            activeWeights.SOCIAL_TRUST.BASE = 0.40;
            activeWeights.PROFILE.BASE = 0.20;
        }

        const repaymentScore = await calculateRepaymentScore(repaymentData, activeWeights.REPAYMENT);
        const financialScore = await calculateFinancialScore(financialData, activeWeights.FINANCIAL);
        const trustScore = await calculateTrustScore(socialData, activeWeights.SOCIAL_TRUST);
        const profileScore = await calculateProfileScore(profileData, activeWeights.PROFILE);

        let finalScore = (
            (repaymentScore * activeWeights.REPAYMENT.BASE) +
            (financialScore * activeWeights.FINANCIAL.BASE) +
            (trustScore * activeWeights.SOCIAL_TRUST.BASE) +
            (profileScore * activeWeights.PROFILE.BASE)
        );

        if (repaymentData?.defaulted > 0) {
            finalScore *= 0.6;
        }
        
        if (financialData?.dti > 0.8) {
            finalScore *= 0.85;
        }

        let baseScore = Math.round(finalScore);

        let resultData = {
            score: baseScore,
            riskBand: getRiskBand(baseScore),
            components: {
                repayment: { score: Math.round(repaymentScore), weight: activeWeights.REPAYMENT.BASE },
                financial: { score: Math.round(financialScore), weight: activeWeights.FINANCIAL.BASE },
                trust: { score: Math.round(trustScore), weight: activeWeights.SOCIAL_TRUST.BASE },
                profile: { score: Math.round(profileScore), weight: activeWeights.PROFILE.BASE }
            },
            meta: {
                isThinFile: (totalLoans < 3),
                calculationTimestamp: new Date().toISOString()
            }
        };

        const aiDecision = await evaluateRiskWithAI(resultData, repaymentData, financialData);

        return {
            userId,
            finalScore: aiDecision.aiFinalScore,
            finalRiskBand: getRiskBand(aiDecision.aiFinalScore),
            aiAnalysis: aiDecision,
            components: resultData.components,
            meta: resultData.meta
        };

    } catch (error) {
        throw new Error('napaka');
    }
};

const calculateRepaymentScore = async (data, weights) => {
    if (!data) return 50; 

    const { 
        totalLoans = 0, 
        completedLoans = 0, 
        latePayments = 0, 
        averageDaysLate = 0
    } = data;

    if (totalLoans === 0) return 50;

    let onTimeRatio = completedLoans / (totalLoans || 1);
    let reliabilityScore = 100 * Math.pow(onTimeRatio, 3);

    let severityPenalty = 0;
    if (averageDaysLate > 0) {
        let sigmoidVal = 1 / (1 + Math.exp(-0.2 * (averageDaysLate - 15)));
        severityPenalty = sigmoidVal * 100;
    }
    let severityScore = Math.max(0, 100 - severityPenalty);

    let recencyScore = 100 * Math.exp(-0.5 * latePayments);

    let historyScore = Math.min(100, Math.log10(totalLoans + 1) * 35);

    let score = (
        (reliabilityScore * weights.ON_TIME_PAYMENT_RATIO) +
        (severityScore * weights.SEVERITY_INDEX) + 
        (recencyScore * weights.RECENCY_WEIGHT) +
        (historyScore * weights.HISTORY_LENGTH_LOG_FACTOR) 
    );

    return Math.min(100, Math.max(0, score));
};

const calculateFinancialScore = async (data, weights) => {
    if (!data) return 50;
    
    const monthlyIncome = data.monthlyIncome || 2000; 
    const currentDebt = data.currentDebt || 0;
    const creditLimit = data.creditLimit || (monthlyIncome * 3);

    const dti = currentDebt / monthlyIncome;
    const optimalDti = 0.15;
    const sigma = 0.25;
    let dtiScore = 100 * Math.exp(-Math.pow(dti - optimalDti, 2) / (2 * Math.pow(sigma, 2)));

    const utilization = currentDebt / creditLimit;
    let utilScore = 100 / (1 + 10 * Math.pow(utilization, 4));

    let disposable = Math.max(0, monthlyIncome - currentDebt);
    let stabilityScore = Math.min(100, Math.log(disposable + 100) * 15);

    let score = (
        (dtiScore * weights.DEBT_TO_INCOME_INVERSE) +
        (utilScore * weights.UTILIZATION_RATE_INVERSE) +
        (stabilityScore * weights.INCOME_STABILITY_INDEX)
    );

    return Math.min(100, Math.max(0, score));
};

const calculateTrustScore = async (data, weights) => {
    if (!data || !data.vouches) return 40;

    const vouches = data.vouches || [];
    
    let sumInverse = 0;
    let validVouches = 0;
    let totalScore = 0;
    
    vouches.forEach(v => {
        let s = (v.friendScore || 50);
        if(s > 0) {
            sumInverse += (1 / s);
            totalScore += s;
            validVouches++;
        }
    });
    
    let effectiveQuality = 50;
    if (validVouches > 0) {
        effectiveQuality = validVouches / sumInverse; 
    }

    let count = vouches.length;
    let quantityScore = 100 / (1 + Math.exp(-0.8 * (count - 3))); 

    const averageVouchPoints = validVouches > 0 ? (totalScore / validVouches) : 50;
    let networkStrength = (averageVouchPoints * Math.min(count, 5)) / 5;

    let score = (
        (effectiveQuality * weights.VOUCHER_SCORE_WEIGHTED_AVG) +
        (quantityScore * weights.NETWORK_DENSITY_FACTOR) + 
        (networkStrength * weights.RELATIONSHIP_DURATION_EXP_DECAY) 
    );

    return Math.min(100, Math.max(0, score));
};

const calculateProfileScore = async (data, weights) => {
    if (!data) return 20;

    let basePoints = 0;
    const hasID = data.idVerified;
    const hasVideo = data.videoVerified;
    const hasPhone = data.phoneVerified;
    const hasEmail = data.emailVerified;

    if (hasID) basePoints += 40;
    if (hasVideo) basePoints += 20;
    if (hasPhone) basePoints += 15;
    if (hasEmail) basePoints += 10;

    let multiplier = 1.0;
    if (hasID && hasVideo) multiplier += 0.25;
    if (hasPhone && hasEmail) multiplier += 0.10;

    let verificationScore = Math.min(100, basePoints * multiplier);

    let days = data.accountAgeDays || 0;
    let ageScore = Math.min(100, Math.log2(days + 2) * 12); 

    let score = (
        (verificationScore * weights.TIER_LEVEL) +
        (ageScore * weights.ACCOUNT_AGE_DAYS_LOG) +
        (100 * weights.DATA_CONSISTENCY_SCORE)
    );

    return Math.min(100, Math.max(0, score));
};

const getRiskBand = (score) => {
    if (score >= 85) return 'EXCELLENT'; 
    if (score >= 70) return 'GOOD';     
    if (score >= 60) return 'FAIR';     
    if (score >= 50) return 'POOR';     
    return 'CRITICAL';                   
};

module.exports = {
    calculateCreditScore,
    WEIGHTS
};
