'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserAdd01Icon, Tick01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
  postaviJePoduzetje,
  dodajDolznika,
  odstraniDolznika,
  postaviZahtevke,
  postaviStatus,
  ponastiviObrazec,
  IDolznik,
  IZahtevekDolga,
  TVrstaDolga,
} from '@/stores/slices/dolgSlice';

import ZnackaOsebe from './ZnackaOsebe';
import ModalStikov from './ModalStikov';
import NalaganjeSlik from './NalaganjeSlik';
import PrikazZahtevkov from './PrikazZahtevkov';

const shemaDolga = z.object({
  naslov: z.string().min(1, 'Naslov je obvezen'),
  username: z.string().optional(),
  opis: z.string().optional(),
  znesek: z
    .string()
    .min(1, 'Znesek je obvezen')
    .refine((v) => parseFloat(v) > 0, 'Znesek mora biti večji od 0'),
  valuta: z.string().min(1),
  vrsta: z.string().min(1, 'Vrsta dolga je obvezna'),
  datumZacetek: z.string().min(1, 'Začetni datum je obvezen'),
  datumKonec: z.string().min(1, 'Končni datum je obvezen'),
  datumZamude: z.string().optional(),
});

type VnosiObrazca = z.infer<typeof shemaDolga>;

const VALUTE = ['EUR', 'USD', 'GBP', 'CHF'];

const VRSTE_DOLGA: { vrednost: TVrstaDolga; oznaka: string }[] = [
  { vrednost: 'osebni', oznaka: 'Osebni' },
  { vrednost: 'poslovni', oznaka: 'Poslovni' },
  { vrednost: 'hipoteka', oznaka: 'Hipoteka' },
  { vrednost: 'studentski', oznaka: 'Študentski' },
  { vrednost: 'kreditna_kartica', oznaka: 'Kreditna kartica' },
  { vrednost: 'drugo', oznaka: 'Drugo' },
];

export default function ObrazecUstvariDolg() {
  const dispatch = useAppDispatch();
  const stanje = useAppSelector((state) => state.dolg);
  const [jeModalOdprt, setJeModalOdprt] = useState(false);
  const [slike, setSlike] = useState<File[]>([]);
  const [napakaDolzniki, setNapakaDolzniki] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VnosiObrazca>({
    resolver: zodResolver(shemaDolga),
    defaultValues: { valuta: 'EUR' },
  });

  const obdelajPotrditevDolznikov = (podatki: VnosiObrazca) => {
    if (stanje.dolzniki.length === 0) {
      setNapakaDolzniki('Dodajte vsaj enega dolžnika.');
      return;
    }
    setNapakaDolzniki('');
    dispatch(postaviStatus('posiljanje'));

    // TODO: Zamenjaj z resničnim API klicem ko bo backend pripravljen
    setTimeout(() => {
      const mockZahtevki: IZahtevekDolga[] = stanje.dolzniki.map(
        (d: IDolznik, i: number) => ({
          id: `zahtevek-${i}`,
          dolgId: 'dolg-mock',
          dolznikId: d.id,
          dolznikUsername: d.username,
          status: 'cakanje' as const,
          poslanoOb: new Date().toISOString(),
        })
      );
      dispatch(postaviZahtevke(mockZahtevki));
      dispatch(postaviStatus('uspeh'));
    }, 800);
  };

  const obdelajPrekinitev = () => {
    dispatch(ponastiviObrazec());
    setSlike([]);
    setNapakaDolzniki('');
    reset();
  };

  const obdelajDodajanjeDolznika = (dolznik: IDolznik) => {
    dispatch(dodajDolznika(dolznik));
    setNapakaDolzniki('');
  };

  const jePosiljanjeAktivno = stanje.status === 'posiljanje';
  const jeUspeh = stanje.status === 'uspeh';

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Glava */}
        <header className="bg-[#1a2744] px-6 py-5 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Ustvari dolg
          </h1>
          <button
            type="button"
            onClick={() => setJeModalOdprt(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <HugeiconsIcon icon={UserAdd01Icon} size={16} color="white" />
            Stiki
          </button>
        </header>

        {/* Pasica uspeha */}
        {jeUspeh && (
          <div className="bg-green-50 border-b border-green-200 px-6 py-3 flex items-center gap-2 text-green-700 text-sm font-medium">
            <HugeiconsIcon icon={Tick01Icon} size={16} color="#15803d" />
            Dolg je bil uspešno ustvarjen! Zahtevki so bili poslani dolžnikom.
          </div>
        )}

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <form onSubmit={handleSubmit(obdelajPotrditevDolznikov)} noValidate>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Levi stolpec */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

                {/* Naslov */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Naslov
                  </label>
                  <input
                    {...register('naslov')}
                    placeholder="Vnesite naslov dolga"
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                      errors.naslov ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  {errors.naslov && (
                    <p className="mt-1 text-xs text-red-500">{errors.naslov.message}</p>
                  )}
                </div>

                {/* Uporabniško ime */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Uporabniško ime
                  </label>
                  <input
                    {...register('username')}
                    placeholder="Vnesite vaše uporabniško ime"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                {/* Oseba / Podjetje */}
                <div className="flex gap-4">
                  {[
                    { oznaka: 'Oseba', vrednost: false },
                    { oznaka: 'Podjetje', vrednost: true },
                  ].map(({ oznaka, vrednost }) => (
                    <label
                      key={oznaka}
                      className="flex items-center gap-2 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={stanje.jePoduzetje === vrednost}
                        onChange={() => dispatch(postaviJePoduzetje(vrednost))}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="text-sm text-gray-700">{oznaka}</span>
                    </label>
                  ))}
                </div>

                {/* Dodaj dolžnika */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Dodaj dolžnika
                  </label>
                  <input
                    placeholder="Vnesite uporabniško ime dolžnika"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const vrednost = (e.target as HTMLInputElement).value.trim();
                        if (vrednost) {
                          obdelajDodajanjeDolznika({
                            id: `rocno-${Date.now()}`,
                            username: vrednost,
                            prikaznoIme: vrednost,
                          });
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                  {napakaDolzniki && (
                    <p className="mt-1 text-xs text-red-500">{napakaDolzniki}</p>
                  )}
                  {stanje.dolzniki.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {stanje.dolzniki.map((d: IDolznik) => (
                        <ZnackaOsebe
                          key={d.id}
                          dolznik={d}
                          onOdstrani={(id: string) => dispatch(odstraniDolznika(id))}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Opis */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Opis
                  </label>
                  <input
                    {...register('opis')}
                    placeholder="Vnesite opis dolga"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                {/* Vrsta dolga */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Vrsta dolga
                  </label>
                  <select
                    {...register('vrsta')}
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition ${
                      errors.vrsta ? 'border-red-400' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Izberite vrsto dolga</option>
                    {VRSTE_DOLGA.map(({ vrednost, oznaka }) => (
                      <option key={vrednost} value={vrednost}>
                        {oznaka}
                      </option>
                    ))}
                  </select>
                  {errors.vrsta && (
                    <p className="mt-1 text-xs text-red-500">{errors.vrsta.message}</p>
                  )}
                </div>
              </div>

              {/* Desni stolpec */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

                  {/* Začetni datum */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Začetni datum
                    </label>
                    <input
                      type="date"
                      {...register('datumZacetek')}
                      className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        errors.datumZacetek ? 'border-red-400' : 'border-gray-200'
                      }`}
                    />
                    {errors.datumZacetek && (
                      <p className="mt-1 text-xs text-red-500">{errors.datumZacetek.message}</p>
                    )}
                  </div>

                  {/* Končni datum */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Končni datum
                    </label>
                    <input
                      type="date"
                      {...register('datumKonec')}
                      className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        errors.datumKonec ? 'border-red-400' : 'border-gray-200'
                      }`}
                    />
                    {errors.datumKonec && (
                      <p className="mt-1 text-xs text-red-500">{errors.datumKonec.message}</p>
                    )}
                  </div>

                  {/* Datum zamude */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Datum zamude (maks.)
                    </label>
                    <input
                      type="date"
                      {...register('datumZamude')}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>

                  {/* Valuta + Znesek */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Valuta
                      </label>
                      <select
                        {...register('valuta')}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition"
                      >
                        {VALUTE.map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Znesek dolga
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        {...register('znesek')}
                        placeholder="Vnesite znesek"
                        className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                          errors.znesek ? 'border-red-400' : 'border-gray-200'
                        }`}
                      />
                      {errors.znesek && (
                        <p className="mt-1 text-xs text-red-500">{errors.znesek.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Nalaganje slik */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <NalaganjeSlik slike={slike} onSprememba={setSlike} />
                </div>
              </div>
            </div>

            {/* Prikaz zahtevkov */}
            {stanje.zahtevki.length > 0 && (
              <div className="mt-6">
                <PrikazZahtevkov zahtevki={stanje.zahtevki} />
              </div>
            )}

            {/* Gumbi */}
            <div className="flex gap-3 mt-8 justify-center">
              <button
                type="submit"
                disabled={jePosiljanjeAktivno}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#1a2744] hover:bg-[#243460] disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <HugeiconsIcon icon={Tick01Icon} size={16} color="white" />
                {jePosiljanjeAktivno ? 'Pošiljanje...' : 'Ustvari dolg'}
              </button>
              <button
                type="button"
                onClick={obdelajPrekinitev}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#1a2744] hover:bg-[#243460] text-white text-sm font-medium rounded-xl transition-colors"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} color="white" />
                Prekini
              </button>
            </div>
          </form>
        </main>

        <footer className="mt-12 py-4 text-center text-xs text-gray-400 border-t border-gray-100">
          @2026 Puff Inc.
        </footer>
      </div>

      <ModalStikov
        jeOdprt={jeModalOdprt}
        onZapri={() => setJeModalOdprt(false)}
        onDodajDolznika={obdelajDodajanjeDolznika}
        izbraneDolznikIds={stanje.dolzniki.map((d: IDolznik) => d.id)}
      />
    </>
  );
}
