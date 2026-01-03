import TipCalculator from '@/components/tip-calculator';

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4" style={{ paddingBottom: 'env(safe-area-inset-bottom, 1rem)' }}>
      <TipCalculator />
    </main>
  );
}
