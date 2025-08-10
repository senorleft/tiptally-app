import TipCalculator from '@/components/tip-calculator';

export default function Home() {
  return (
    <main className="h-screen w-full bg-background flex flex-col items-center justify-center p-4">
      <TipCalculator />
    </main>
  );
}
