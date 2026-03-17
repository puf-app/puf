import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type TVrstaDolga =
  | 'osebni'
  | 'poslovni'
  | 'hipoteka'
  | 'studentski'
  | 'kreditna_kartica'
  | 'drugo';

export type TStatusZahtevka =
  | 'cakanje'
  | 'potrjeno'
  | 'zavrnjeno'
  | 'preklicano';

export interface IDolznik {
  id: string;
  username: string;
  prikaznoIme: string;
  email?: string;
}

export interface IZahtevekDolga {
  id: string;
  dolgId: string;
  dolznikId: string;
  dolznikUsername: string;
  status: TStatusZahtevka;
  poslanoOb: string;
  odgovorjenoOb?: string;
}

interface DolgState {
  naslov: string;
  username: string;
  jePoduzetje: boolean;
  opis: string;
  znesek: string;
  valuta: string;
  vrsta: TVrstaDolga | '';
  datumZacetek: string;
  datumKonec: string;
  datumZamude: string;
  dolzniki: IDolznik[];
  zahtevki: IZahtevekDolga[];
  status: 'mirovanje' | 'posiljanje' | 'uspeh' | 'napaka';
  napaka: string | null;
}

const initialState: DolgState = {
  naslov: '',
  username: '',
  jePoduzetje: false,
  opis: '',
  znesek: '',
  valuta: 'EUR',
  vrsta: '',
  datumZacetek: '',
  datumKonec: '',
  datumZamude: '',
  dolzniki: [],
  zahtevki: [],
  status: 'mirovanje',
  napaka: null,
};

const dolgSlice = createSlice({
  name: 'dolg',
  initialState,
  reducers: {
    postaviJePoduzetje: (state, action: PayloadAction<boolean>) => {
      state.jePoduzetje = action.payload;
    },

    dodajDolznika: (state, action: PayloadAction<IDolznik>) => {
      const obstaja = state.dolzniki.find((d) => d.id === action.payload.id);
      if (!obstaja) {
        state.dolzniki.push(action.payload);
      }
    },

    odstraniDolznika: (state, action: PayloadAction<string>) => {
      state.dolzniki = state.dolzniki.filter((d) => d.id !== action.payload);
    },

    postaviZahtevke: (state, action: PayloadAction<IZahtevekDolga[]>) => {
      state.zahtevki = action.payload;
    },

    postaviStatus: (state, action: PayloadAction<DolgState['status']>) => {
      state.status = action.payload;
    },

    postaviNapako: (state, action: PayloadAction<string | null>) => {
      state.napaka = action.payload;
    },

    ponastiviObrazec: () => initialState,
  },
});

export const {
  postaviJePoduzetje,
  dodajDolznika,
  odstraniDolznika,
  postaviZahtevke,
  postaviStatus,
  postaviNapako,
  ponastiviObrazec,
} = dolgSlice.actions;

export default dolgSlice.reducer;
