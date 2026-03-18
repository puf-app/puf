'use client';

import { useState, useRef, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Tick01Icon } from '@hugeicons/core-free-icons';
import { IDolznik } from '@/stores/slices/dolgSlice';

const MOCK_STIKI = [
  { id: '1', username: 'janez_novak', prikaznoIme: 'Janez Novak', email: 'janez@example.com' },
  { id: '2', username: 'maja_kovac', prikaznoIme: 'Maja Kovač', email: 'maja@example.com' },
  { id: '3', username: 'peter_horvat', prikaznoIme: 'Peter Horvat', email: 'peter@example.com' },
  { id: '4', username: 'ana_potocnik', prikaznoIme: 'Ana Potočnik', email: 'ana@example.com' },
];

interface ModalStikovProps {
  jeOdprt: boolean;
  onZapri: () => void;
  onDodajDolznika: (dolznik: IDolznik) => void;
  izbraneDolznikIds: string[];
}

export default function ModalStikov({
  jeOdprt,
  onZapri,
  onDodajDolznika,
  izbraneDolznikIds,
}: ModalStikovProps) {
  const [iskanje, setIskanje] = useState('');
  const vnosRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (jeOdprt) {
      setTimeout(() => vnosRef.current?.focus(), 50);
      setIskanje('');
    }
  }, [jeOdprt]);

  if (!jeOdprt) return null;

  const filtrirani = MOCK_STIKI.filter(
    (s) =>
      s.prikaznoIme.toLowerCase().includes(iskanje.toLowerCase()) ||
      s.username.toLowerCase().includes(iskanje.toLowerCase()) ||
      s.email?.toLowerCase().includes(iskanje.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onZapri()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">Dodaj osebe</h3>
            <button
              onClick={onZapri}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} />
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              ref={vnosRef}
              type="text"
              value={iskanje}
              onChange={(e) => setIskanje(e.target.value)}
              placeholder="Vnesite ime ali e-pošto"
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Dodaj
            </button>
          </div>

          <p className="text-xs font-medium text-gray-500 mb-2">Vaši stiki:</p>

          <ul className="space-y-1 max-h-52 overflow-y-auto">
            {filtrirani.length === 0 && (
              <li className="py-4 text-center text-sm text-gray-400">
                Ni najdenih stikov
              </li>
            )}
            {filtrirani.map((stik) => {
              const jeIzbran = izbraneDolznikIds.includes(stik.id);
              return (
                <li key={stik.id}>
                  <button
                    type="button"
                    onClick={() =>
                      !jeIzbran &&
                      onDodajDolznika({
                        id: stik.id,
                        username: stik.username,
                        prikaznoIme: stik.prikaznoIme,
                        email: stik.email,
                      })
                    }
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      jeIzbran
                        ? 'bg-blue-50 text-blue-700 cursor-default'
                        : 'hover:bg-gray-50 text-gray-800'
                    }`}
                  >
                    <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {stik.prikaznoIme.charAt(0)}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium truncate">
                        {stik.prikaznoIme}
                      </span>
                      <span className="block text-xs text-gray-400 truncate">
                        @{stik.username}
                      </span>
                    </span>
                    {jeIzbran && (
                      <HugeiconsIcon icon={Tick01Icon} size={16} color="#2563eb" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onZapri}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Zapri
          </button>
        </div>
      </div>
    </div>
  );
}
