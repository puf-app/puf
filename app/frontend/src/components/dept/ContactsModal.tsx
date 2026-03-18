'use client';

import { useState, useRef, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Tick01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IDebtor } from '@/stores/slices/debtSlice';


const CONTACTS: IDebtor[] = [];

interface ContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDebtor: (debtor: IDebtor) => void;
  selectedDebtorIds: string[];
}

export default function ContactsModal({
  isOpen,
  onClose,
  onAddDebtor,
  selectedDebtorIds,
}: ContactsModalProps) {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearch('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = CONTACTS.filter(
    (c) =>
      c.displayName.toLowerCase().includes(search.toLowerCase()) ||
      c.username.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">Add people</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} />
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            <Input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Enter name or email"
            />
            <Button type="button">Add</Button>
          </div>

          <p className="text-xs font-medium text-gray-500 mb-2">Your contacts:</p>

          <ul className="space-y-1 max-h-52 overflow-y-auto">
            {filtered.length === 0 && (
              <li className="py-4 text-center text-sm text-gray-400">
                No contacts found
              </li>
            )}
            {filtered.map((contact) => {
              const isSelected = selectedDebtorIds.includes(contact.id);
              return (
                <li key={contact.id}>
                  <button
                    type="button"
                    onClick={() => !isSelected && onAddDebtor(contact)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 cursor-default'
                        : 'hover:bg-gray-50 text-gray-800'
                    }`}
                  >
                    <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {contact.displayName.charAt(0)}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium truncate">
                        {contact.displayName}
                      </span>
                      <span className="block text-xs text-gray-400 truncate">
                        @{contact.username}
                      </span>
                    </span>
                    {isSelected && (
                      <HugeiconsIcon icon={Tick01Icon} size={16} color="#2563eb" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
