'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { Clock01Icon, CheckmarkCircle01Icon, Cancel01Icon, BlockedIcon } from '@hugeicons/core-free-icons';
import { IZahtevekDolga, TStatusZahtevka } from '@/stores/slices/dolgSlice';

const konfiguaracijaStatusa: Record<
  TStatusZahtevka,
  { oznaka: string; barva: string; ikona: React.ReactNode }
> = {
  cakanje: {
    oznaka: 'V čakanju',
    barva: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    ikona: <HugeiconsIcon icon={Clock01Icon} size={14} />,
  },
  potrjeno: {
    oznaka: 'Potrjeno',
    barva: 'bg-green-100 text-green-700 border-green-200',
    ikona: <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} />,
  },
  zavrnjeno: {
    oznaka: 'Zavrnjeno',
    barva: 'bg-red-100 text-red-700 border-red-200',
    ikona: <HugeiconsIcon icon={Cancel01Icon} size={14} />,
  },
  preklicano: {
    oznaka: 'Preklicano',
    barva: 'bg-gray-100 text-gray-600 border-gray-200',
    ikona: <HugeiconsIcon icon={BlockedIcon} size={14} />,
  },
};

interface PrikazZahtevkovProps {
  zahtevki: IZahtevekDolga[];
}

export default function PrikazZahtevkov({ zahtevki }: PrikazZahtevkovProps) {
  if (zahtevki.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-400">Zahtevki še niso bili poslani</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">Stanje zahtevkov</h3>
      </div>
      <ul className="divide-y divide-gray-50">
        {zahtevki.map((zahtevek) => {
          const kfg = konfiguaracijaStatusa[zahtevek.status];
          return (
            <li
              key={zahtevek.id}
              className="flex items-center justify-between px-4 py-3 gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {zahtevek.dolznikUsername.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    @{zahtevek.dolznikUsername}
                  </p>
                  <p className="text-xs text-gray-400">
                    Poslano {new Date(zahtevek.poslanoOb).toLocaleDateString('sl-SI')}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${kfg.barva}`}
              >
                {kfg.ikona}
                {kfg.oznaka}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
