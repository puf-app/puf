# Important
- Ne commitat .env FILE!
- Ne commitat /node_modules
- Ne commitat nedelujoče kode (lahko ne dela tega kar naj bi ampak naj ne crasha serverja)
- Sproti pišite swagger dokumentacijo za dodane API endpointe
- Komentarji lahko obstajajo ampak naj bodo smiselni
- Git commit messages naj bojo deskriptivni in smiselni
- Za vsak feature naredte nov git branch iz "backend" branch, pol pa PR nazaj na "backend" branch, ki jih bom jaz approve-u ce bojo ok

# Naming conventions
- Vsi endpointi so v camelCase
- Vse public funkcije so v camelCase
- Vsi responsi na API klice so v stilu: 
    { 
        "data":{}, 
        "error":"" 
    } 
    kjer je error prazen, ce je vse ok
- Status kode: 
    200 - OK, 
    201 - Created       - (ustvarjanje podatkov v DB), 
    400 - BadRequest    - (napačno napisan request), 
    401 - Unauthorized  - (ni dovoljenja za vpogled v te podatke), 
    404 - NotFound      - (endpoint ne obstaja), 
    500 - ServerError   - (v primeru crasha v funkciji ali karkoli nepričakovanega), 
    Ostale po želji, samo napišite v swagger dokumentacijo, kaj pomenijo

# Setup
- install Node.js (ce se nimas - https://nodejs.org/en/download)
- cd v app/backend/
- npm install
- naredi kopijo .env.temp in pobrisi .temp, po potrebi vstavi prave podatke (ce nimas, mi pisi na discord (Tilen Gašparič))

# Run 
## (dev)
npm run dev
## (prod)
npm start