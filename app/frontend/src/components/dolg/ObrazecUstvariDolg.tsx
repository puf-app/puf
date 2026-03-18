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

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

import ZnackaOsebe from './ZnackaOsebe';
import ModalStikov from './ModalStikov';
import NalaganjeSlik from './NalaganjeSlik';
import PrikazZahtevkov from './PrikazZahtevkov';

const shemaDolga = z.object({
  naslov: z.string().min(1, 'Title is required'),
  username: z.string().optional(),
  opis: z.string().optional(),
  znesek: z
    .string()
    .min(1, 'Amount is required')
    .refine((v) => parseFloat(v) > 0, 'Amount must be greater than 0'),
  valuta: z.string().min(1),
  vrsta: z.string().min(1, 'Debt type is required'),
  datumZacetek: z.string().min(1, 'Start date is required'),
  datumKonec: z.string().min(1, 'End date is required'),
  datumZamude: z.string().optional(),
});

type VnosiObrazca = z.infer<typeof shemaDolga>;

const VALUTE = ['EUR', 'USD', 'GBP', 'CHF'];

const VRSTE_DOLGA: { vrednost: TVrstaDolga; oznaka: string }[] = [
  { vrednost: 'osebni', oznaka: 'Personal' },
  { vrednost: 'poslovni', oznaka: 'Business' },
  { vrednost: 'hipoteka', oznaka: 'Mortgage' },
  { vrednost: 'studentski', oznaka: 'Student loan' },
  { vrednost: 'kreditna_kartica', oznaka: 'Credit card' },
  { vrednost: 'drugo', oznaka: 'Other' },
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

  const obdelajPotrditevDolznikov = (_podatki: VnosiObrazca) => {
    if (stanje.dolzniki.length === 0) {
      setNapakaDolzniki('At least one debtor is required.');
      return;
    }
    setNapakaDolzniki('');
    dispatch(postaviStatus('posiljanje'));

    // TODO: Replace with real API call when backend is ready
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
      <div className="min-h-screen bg-background">
        {/* Page header */}
        <div className="bg-[#1a2744] px-6 py-5 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Create debt
          </h1>
          <Button
            type="button"
            onClick={() => setJeModalOdprt(true)}
            className="flex items-center gap-2"
          >
            <HugeiconsIcon icon={UserAdd01Icon} size={16} color="white" />
            Contacts
          </Button>
        </div>

        {/* Success banner */}
        {jeUspeh && (
          <div className="bg-green-50 border-b border-green-200 px-6 py-3 flex items-center gap-2 text-green-700 text-sm font-medium">
            <HugeiconsIcon icon={Tick01Icon} size={16} color="#15803d" />
            Debt created successfully! Requests have been sent to debtors.
          </div>
        )}

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <form onSubmit={handleSubmit(obdelajPotrditevDolznikov)} noValidate>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Left column */}
              <Card className="p-6 space-y-5">

                {/* Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="naslov">Title</Label>
                  <Input
                    id="naslov"
                    {...register('naslov')}
                    placeholder="Enter your debt title"
                    className={errors.naslov ? 'border-red-400' : ''}
                  />
                  {errors.naslov && (
                    <p className="text-xs text-red-500">{errors.naslov.message}</p>
                  )}
                </div>

                {/* Username */}
                <div className="space-y-1.5">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    {...register('username')}
                    placeholder="Enter your username"
                  />
                </div>

                {/* Person / Company */}
                <div className="flex gap-4">
                  {[
                    { oznaka: 'Person', vrednost: false },
                    { oznaka: 'Company', vrednost: true },
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

                {/* Add debtor */}
                <div className="space-y-1.5">
                  <Label htmlFor="dolznik">Add debtor</Label>
                  <Input
                    id="dolznik"
                    placeholder="Enter deptor username"
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
                    <p className="text-xs text-red-500">{napakaDolzniki}</p>
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

                {/* Description */}
                <div className="space-y-1.5">
                  <Label htmlFor="opis">Description</Label>
                  <Input
                    id="opis"
                    {...register('opis')}
                    placeholder="Enter debt description"
                  />
                </div>

                {/* Type of debt */}
                <div className="space-y-1.5">
                  <Label htmlFor="vrsta">Type of debt</Label>
                  <select
                    id="vrsta"
                    {...register('vrsta')}
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background transition ${
                      errors.vrsta ? 'border-red-400' : 'border-input'
                    }`}
                  >
                    <option value="">Choose the type of your debt</option>
                    {VRSTE_DOLGA.map(({ vrednost, oznaka }) => (
                      <option key={vrednost} value={vrednost}>
                        {oznaka}
                      </option>
                    ))}
                  </select>
                  {errors.vrsta && (
                    <p className="text-xs text-red-500">{errors.vrsta.message}</p>
                  )}
                </div>
              </Card>

              {/* Right column */}
              <div className="space-y-6">
                <Card className="p-6 space-y-5">

                  {/* Start date */}
                  <div className="space-y-1.5">
                    <Label htmlFor="datumZacetek">Choose a start date</Label>
                    <Input
                      id="datumZacetek"
                      type="date"
                      {...register('datumZacetek')}
                      className={errors.datumZacetek ? 'border-red-400' : ''}
                    />
                    {errors.datumZacetek && (
                      <p className="text-xs text-red-500">{errors.datumZacetek.message}</p>
                    )}
                  </div>

                  {/* End date */}
                  <div className="space-y-1.5">
                    <Label htmlFor="datumKonec">Choose end date</Label>
                    <Input
                      id="datumKonec"
                      type="date"
                      {...register('datumKonec')}
                      className={errors.datumKonec ? 'border-red-400' : ''}
                    />
                    {errors.datumKonec && (
                      <p className="text-xs text-red-500">{errors.datumKonec.message}</p>
                    )}
                  </div>

                  {/* Delay date */}
                  <div className="space-y-1.5">
                    <Label htmlFor="datumZamude">Date of delay (max.)</Label>
                    <Input
                      id="datumZamude"
                      type="date"
                      {...register('datumZamude')}
                    />
                  </div>

                  {/* Currency + Amount */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="valuta">Select currency</Label>
                      <select
                        id="valuta"
                        {...register('valuta')}
                        className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background transition"
                      >
                        {VALUTE.map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="znesek">Debt amount</Label>
                      <Input
                        id="znesek"
                        type="number"
                        min="0"
                        step="0.01"
                        {...register('znesek')}
                        placeholder="Enter amount"
                        className={errors.znesek ? 'border-red-400' : ''}
                      />
                      {errors.znesek && (
                        <p className="text-xs text-red-500">{errors.znesek.message}</p>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Image upload */}
                <Card className="p-6">
                  <NalaganjeSlik slike={slike} onSprememba={setSlike} />
                </Card>
              </div>
            </div>

            {/* Request status */}
            {stanje.zahtevki.length > 0 && (
              <div className="mt-6">
                <PrikazZahtevkov zahtevki={stanje.zahtevki} />
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 mt-8 justify-center">
              <Button
                type="submit"
                disabled={jePosiljanjeAktivno}
                className="flex items-center gap-2"
              >
                <HugeiconsIcon icon={Tick01Icon} size={16} color="white" />
                {jePosiljanjeAktivno ? 'Sending...' : 'Create debt'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={obdelajPrekinitev}
                className="flex items-center gap-2"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} />
                Abort debt
              </Button>
            </div>
          </form>
        </main>
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
