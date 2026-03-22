const { calculateCreditScore } = require('./CreditScore');

const zazeniTeste = async () => {
    console.log("--- testiranje ---");

   // 4. Uporabnik z malo podatki 
    const manjkajociUporabnik = {
        repayment: { totalLoans: 1 }, 
        financial: { monthlyIncome: 1200 }, 
        trust: null, 
        profile: { idVerified: true } 
    };


    // 1. Odličen uporabnik (vse poštimano, dobra plača)
    const odlicenUporabnik = {
        repayment: { 
            totalLoans: 12, 
            completedLoans: 12, 
            latePayments: 0, 
            defaulted: 0, 
            averageDaysLate: 0 
        },
        financial: { 
            currentDebt: 1200, 
            creditLimit: 30000, 
            monthlyIncome: 8000 
        },
        trust: { 
            vouches: [
                { friendScore: 85 }, { friendScore: 90 }, { friendScore: 88 }
            ], 
        },
        profile: { 
            accountAgeDays: 800,
            idVerified: true,
            videoVerified: true,
            phoneVerified: true,
            emailVerified: true
        }
    };

    // 2. Povprečen uporabnik (par zamud, srednja plača)
    const povprecenUporabnik = {
        repayment: { 
            totalLoans: 5, 
            completedLoans: 4, 
            latePayments: 1, 
            defaulted: 0, 
            averageDaysLate: 5 
        },
        financial: { 
            currentDebt: 1500, // dti je ok
            creditLimit: 10000, 
            monthlyIncome: 4000 
        },
        trust: { 
            vouches: [
                { friendScore: 60 }, { friendScore: 55 }
            ], 
        },
        profile: { 
            accountAgeDays: 200,
            idVerified: true,
            phoneVerified: true 
        }
    };

    // 3. Tvegan uporabnik (novinec na platformi mogoče samo s slabimi frendi)
    const tveganUporabnik = {
        repayment: { 
            totalLoans: 1, 
            completedLoans: 0, 
            latePayments: 1, 
            defaulted: 0, 
            averageDaysLate: 45 // ouch, velika kazen
        },
        financial: { 
            currentDebt: 1800, 
            creditLimit: 2000, 
            monthlyIncome: 2000 
        },
        trust: { 
            vouches: [
                { friendScore: 40 } // slab kolega
            ], 
        },
        profile: { 
            accountAgeDays: 10,
            idVerified: false,
            emailVerified: true
        }
    };

 

    try {
        const ocena1 = await calculateCreditScore('model_odlicen', odlicenUporabnik.repayment, odlicenUporabnik.financial, odlicenUporabnik.trust, odlicenUporabnik.profile);
        console.log(JSON.stringify(ocena1, null, 2));

        const ocena2 = await calculateCreditScore('model_povprecen', povprecenUporabnik.repayment, povprecenUporabnik.financial, povprecenUporabnik.trust, povprecenUporabnik.profile);
        console.log(JSON.stringify(ocena2, null, 2));

        const ocena3 = await calculateCreditScore('model_tvegan', tveganUporabnik.repayment, tveganUporabnik.financial, tveganUporabnik.trust, tveganUporabnik.profile);
        console.log(JSON.stringify(ocena3, null, 2));

        const ocena4 = await calculateCreditScore('model_pomanjkljiv', manjkajociUporabnik.repayment, manjkajociUporabnik.financial, manjkajociUporabnik.trust, manjkajociUporabnik.profile);
        console.log(JSON.stringify(ocena4, null, 2));

    } catch (napaka) {
        console.error("napaka:", napaka);
    }
};

zazeniTeste();
