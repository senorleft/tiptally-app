import TipCalculator from '@/components/tip-calculator';

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <TipCalculator />
    </main>
  );
}
