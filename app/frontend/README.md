# PUF Frontend

To je frontend del projekta PUF. Ta projekt je zgrajen z uporabo [Next.js](https://nextjs.org/) (App Router).

## Začetek

Najprej namestite dependencies:

```bash
npm install
```

Zaženite strežnik, da bote lahko delali:

```bash
npm run dev
```

Odprite [http://localhost:3001](http://localhost:3001) v svojem brskalniku.

## Struktura Projekta

Sledimo modularni, razširljivi strukturi map, ki temelji na preverjenih najboljših praksah, da ohranimo kodo dosledno in enostavno za navigacijo.

- `src/app/` - Next.js App Router strani, postavitve in API poti.
- `src/components/` - Ponovno uporabne, skupne UI komponente. (Za oblikovni sistem bomo uporabljali **shadcn/ui**).
- `src/features/` - Moduli po funkcionalnostih (npr. dolgovi, uporabniški profil), ki vsebujejo lastne komponente, hooke, storitve in tipe.
- `src/lib/` - Pomožne funkcije, API klienti in konfiguracije knjižnic tretjih oseb.
- `src/hooks/` - Skupni custom React hooki.
- `src/config/` - Globalne konfiguracije in konstante.
- `src/types/` - Globalni TypeScript vmesniki in tipi. Opomba: API tipi se še trenutno spreminjajo, tako, da če kaj ne dela napišite.
- `src/stores/` - Globalno upravljanje stanja z Redux Toolkit (npr. `userSlice`).
- `src/providers/` - React context providerji (kot je Redux Provider).

## Splošna navodila za razvoj

Prosimo, da se pri prispevanju k temu projektu strogo držite naslednjih pravil, da ohranimo kakovost in doslednost kode:

### Git & Strategija vej

1. **Osnovna veja:** Vedno ustvarite nove veje iz veje `frontend`.
2. **Poimenovanje vej:** Uporabljajte opisne predpone za imena vej glede na delo, ki ga opravljate:
   - `feature/naloga` - za nove funkcionalnosti
   - `fix/naloga` - za popravke napak
3. **Pull Requesti (PR):**
   - Odprite PR, ko je vaša naloga končana.
   - **NE združujte svojega PR sami!** Dodajte komentar z razlago svojega dela in počakajte, da ga nekdo drug pregleda in odobri.
4. **Razdelitev nalog:** Sledite zadolžitvam, določenim v projektni `.docx` datoteki, ali se pred prevzemom nezačetih nalog posvetujte z ekipo. Organizirati se moramo, da vsak dobi svoje točke!

### Sporočila commitov

Uporabljajte [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), da bo git zgodovina pregledna. Začnite sporočila commitov z:

- `feat:` (npr. `feat: dodaj obrazec za ustvarjanje dolga`)
- `fix:` (npr. `fix: odpravi sesutje pri manjkajočem povzetku`)
- `chore:` (npr. `chore: posodobi odvisnosti`)
- `docs:`, `style:`, `refactor:`, itd.

### Najboljše prakse kodiranja

- **Čista koda:** Odstranite vse `console.log` stavke in debug kodo pred commitom, ko bodo API-ji pripravljeni.
- **Upravljanje stanja:** Uporabljamo **Redux Toolkit** za globalno stanje. Oglejte si `userSlice` za primer, kako je globalna shramba strukturirana in dodana v `store.ts`. Za dostop do stanja uporabite custom hooke iz `src/hooks/redux.ts`.
- **Stanje API-ja:** Backend API je trenutno v razvoju. Dokler ni popolnoma funkcionalen, ni potrebe po pravih API zahtevkih.
- **Oblikovanje:** Dizajn naj bo preprost in dosleden. Kmalu bomo integrirali **shadcn/ui**.
- **Prevodi:** Implementirati moramo `i18next` za lokalizacijo. Trenutno so nizi hardcodani (npr. v footerju), to pa je treba prenesti v prevajalski sistem. Če prevzamete to nalogo, začnite z mapiranjem prevajalskih slovarjev!

## Vprašanja ali težave?

Če niste prepričani, kako uporabiti določeno orodje (npr. Redux), ali ne želite opraviti določene naloge, vprašajte v klepetu ali kontaktirajte vodjo ekipe za pomoč.
