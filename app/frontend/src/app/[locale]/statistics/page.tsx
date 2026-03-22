'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { setStats } from '@/stores/slices/statisticsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/stores/store';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

interface GraphData {
  date: string;
  amount: number;
  count: number;
}

const mockData: GraphData[] = [
  { date: 'Jan', amount: 400, count: 2 },
  { date: 'Feb', amount: 300, count: 1 },
  { date: 'Mar', amount: 500, count: 3 },
  { date: 'Apr', amount: 200, count: 1 },
  { date: 'May', amount: 600, count: 4 },
  { date: 'Jun', amount: 450, count: 2 },
];

function StatisticsContent() {
  const dispatch = useDispatch();
  const { stats } = useSelector((state: RootState) => state.statistics);
  const t = useTranslations('Statistics');

  useEffect(() => {
    dispatch(setStats({
      totalDebts: 156,
      debtsLastWeek: 12,
      totalAmount: 2450.00,
      graphData: mockData,
    }));
  }, [dispatch]);

  return (
    <main className='flex w-full max-w-4xl mx-auto flex-col gap-8 py-12 px-4'>
      <h1 className='text-3xl font-bold'>{t('title')}</h1>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='bg-card text-card-foreground p-6 rounded-lg border shadow-sm'>
          <p className='text-sm text-muted-foreground'>{t('cards.totalDebts')}</p>
          <p className='text-3xl font-bold mt-2'>{stats.totalDebts}</p>
        </div>

        <div className='bg-card text-card-foreground p-6 rounded-lg border shadow-sm'>
          <p className='text-sm text-muted-foreground'>{t('cards.lastWeek')}</p>
          <p className='text-3xl font-bold mt-2'>{stats.debtsLastWeek}</p>
        </div>

        <div className='bg-card text-card-foreground p-6 rounded-lg border shadow-sm'>
          <p className='text-sm text-muted-foreground'>{t('cards.totalAmount')}</p>
          <p className='text-3xl font-bold mt-2'>€{stats.totalAmount.toFixed(2)}</p>
        </div>
      </div>

      <div className='bg-card text-card-foreground p-6 rounded-lg border shadow-sm'>
        <h2 className='text-xl font-semibold mb-6'>{t('chart.title')}</h2>
        <div className='h-80 w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart data={stats.graphData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='date' />
              <YAxis />
              <Tooltip />
              <Line 
                type='monotone' 
                dataKey='amount' 
                stroke='#8884d8' 
                strokeWidth={2}
                dot={{ fill: '#8884d8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </main>
  );
}

const LoadingStats = () => {
  const t = useTranslations('Statistics');
  return (
    <main className='flex w-full max-w-4xl mx-auto flex-col items-center justify-between py-12 px-4'>
      <div className='text-xl'>{t('loading')}</div>
    </main>
  );
};

const DynamicStatistics = dynamic(() => Promise.resolve(StatisticsContent), {
  ssr: false,
  loading: LoadingStats,
});

export default function StatisticsPage() {
  return <DynamicStatistics />;
}
