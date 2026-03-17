import { Metadata } from 'next';
import { ObrazecUstvariDolg } from '@/components/dolg';

export const metadata: Metadata = {
  title: 'Ustvari dolg | Puff',
  description: 'Ustvari nov dolg in pošlji zahtevek dolžnikom',
};

export default function StranUstvariDolg() {
  return <ObrazecUstvariDolg />;
}
